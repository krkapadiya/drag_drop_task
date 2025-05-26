const mongoose=require('mongoose');
const MONGOURL=process.env.MONGO_URL

const connection=mongoose.connect(MONGOURL)
.then(()=>{
    console.log('mongodb connected');    
}).catch(()=>{
    console.log('error in connecting');  
});

module.exports={connection}