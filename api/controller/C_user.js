require('express');
require('mongoose');
const user=require('./../model/M_user');

const register=async(req,res)=>{
    res.render('index')
}

const registeruser = async (req, res) => {
    try {
        const { user_name,email,password } = req.body;
        const newuser=await user.create({ 
            user_name:user_name,
            email:email,
            password:password
        });
        req.session.userId = newuser._id;

        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
        res.status(500).send("User not created");
    }
};

const login=async(req,res)=>{
    res.render('login')
};

const loginuser = async (req, res) => {
    const { email, password } = req.body;
    const finduser = await user.findOne({ email: email });
    if (!finduser || finduser.password !== password) {
        return res.status(401).send("Invalid credentials");
    }
    req.session.userId = finduser._id;  
    res.redirect("/dashboard");
};

const getallusers = async (req, res) => {
    try {
        const logged_user = await user.findById(req.session.userId);

        let users = await user.find({ _id: { $ne: logged_user._id } });

        if (logged_user.user_order && logged_user.user_order.length > 0) {
            const orderedUsers = [];
            const remainingUsers = [];

            logged_user.user_order.forEach(id => {
                const found = users.find(u => u._id.toString() === id.toString());
                if (found) orderedUsers.push(found);
            });

            users.forEach(u => {
                if (!logged_user.user_order.includes(u._id)) {
                    remainingUsers.push(u); 
                }
            });
            users = [...orderedUsers, ...remainingUsers];
        }
        res.render('dashboard', { users, userId: logged_user._id });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
};

const updateuserorder = async (req, res) => {
    try {
        const { userIds } = req.body;
        const userId = req.session.userId;

        await user.findByIdAndUpdate(userId, { user_order: userIds });

        const io = req.app.get('io');
        io.to(userId.toString()).emit('userorderupdated', userIds);

        res.status(200).json({
            success: true,
            message: "User order updated"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Not updated"
        });
    }
};

module.exports={register,registeruser,login,loginuser,getallusers,updateuserorder}
