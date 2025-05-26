const express=require('express');
const app=express()
require('dotenv').config();
const path=require('path');
const session=require('express-session');
require('./DB/config');
const router = require('./api/routes/R_user');
require('socket.io');
const MongoStore = require('connect-mongo');

const http=require('http').createServer(app)
const io=require('socket.io')(http);
app.set('io',io);

const PORT=process.env.PORT
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 

app.set('view engine','ejs');

app.set('views',path.join(__dirname, 'views'));


app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        collectionName: 'sessions'
    }),
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
    }
}));


app.use('/',router)

io.on('connection', socket => {
    console.log("A user connected:", socket.id);

    socket.on('setuserroom', userId => {
        socket.join(userId); 
        console.log(`Socket ${socket.id} joined room ${userId}`);
    });

    socket.on('reorderusers', ({ userId, userIds }) => {
        socket.to(userId).emit('userorderupdated', userIds);
    });

    socket.on('disconnect', () => {
        console.log("user disconnected:", socket.id);
    });
});

http.listen(PORT,()=>{
    console.log(`server running on ${PORT}`);
})