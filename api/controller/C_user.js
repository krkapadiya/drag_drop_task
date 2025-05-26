require('express');
const mongoose = require('mongoose'); 
const user=require('./../model/M_user');
const bcrypt=require('bcrypt');

const register=async(req,res)=>{
    res.render('index')
}

const registeruser = async (req, res) => {
    try {
        const { user_name,email,password } = req.body;
       const hashedPassword = await bcrypt.hash(password, 10);
        const newuser = await user.create({
            user_name,
            email,
            password: hashedPassword
        });

        req.session.userId = newuser._id;

        res.redirect('/dashboard');
    }catch (error) {
    console.error("Register Error:", error.message, error);
    res.status(500).send("User not created");
}

};

const login=async(req,res)=>{
    res.render('login')
};

const loginuser = async (req, res) => {
    const { email, password } = req.body;
    const finduser = await user.findOne({ email: email });
    const isMatch = await bcrypt.compare(password, finduser.password);
    if (!finduser || !isMatch) {
    return res.status(401).send("Invalid credentials");
}

    req.session.userId = finduser._id;  
    res.redirect("/dashboard");
};

const getallusers = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.redirect('/login');
        }

        const logged_user = await user.findById(req.session.userId);
        if (!logged_user) {
            return res.status(404).send("User not found");
        }

        let users = await user.find({ _id: { $ne: logged_user._id } });

        if (Array.isArray(logged_user.user_order) && logged_user.user_order.length > 0) {
            const orderedUsers = [];
            const remainingUsers = [];

            logged_user.user_order.forEach(id => {
                const found = users.find(u => u._id.toString() === id.toString());
                if (found) orderedUsers.push(found);
            });

            users.forEach(u => {
                if (!logged_user.user_order.includes(u._id.toString())) {
                    remainingUsers.push(u);
                }
            });

            users = [...orderedUsers, ...remainingUsers];
        }

        res.render('dashboard', { users, userId: logged_user._id });

    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).send("Internal Server Error");
    }
};
// make sure this is at the top of your file

const updateuserorder = async (req, res) => {
    try {
        const { userIds } = req.body;
        const userId = req.session.userId;

        // Convert string IDs to ObjectId
        const objectIds = userIds.map(id => new mongoose.Types.ObjectId(id));

        // Update with ObjectId array
        await user.findByIdAndUpdate(userId, { user_order: objectIds });

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
