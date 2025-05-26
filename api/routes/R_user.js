const express=require('express');
const router=express.Router()
const {register,registeruser,login,loginuser,getallusers,updateuserorder}=require('./../controller/C_user');

router.get('/register',register)
router.post('/adduser',registeruser);
router.get('/login',login);
router.post('/login',loginuser);
router.get('/dashboard',getallusers);
router.post('/updateuserorder',updateuserorder)

module.exports=router