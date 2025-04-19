import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {v2 as cloudinary} from 'cloudinary';
import validator from 'validator'
import AdminModel from '../../models/admin.model.js';
import PostModel from '../../models/post.model.js';

export const AdminRegister = async(req,res)=>{
    try {
        const {name,email,password,phoneNumber,areaPin} = req.body;
        const img = req.file;

        if(!name || !email || !password || !phoneNumber || !areaPin){
            return res.status(400).json({success:false,message:'Fill all the details'});
        }

        if(!validator.isEmail(email)){
            return res.status(400).json({success:false,message:'Please enter a valid email'});
        }
        
        if(password.length<8){
            return res.status(400).json({success:false,message:'Enter a strong password'});
        }

        const salt = await bcrypt.genSalt(10);
        const hash_pwd = await bcrypt.hash(password,salt);

        const data = {
            name,
            email,
            password:hash_pwd,
            phoneNumber,
            areaPin,
        };

        const newUser = new AdminModel(data);
        await newUser.save();
        
        if(img){
            const imgUpload = await cloudinary.uploader.upload(img.path,{resource_type:"image"});
            const imgURL = imgUpload.secure_url;
            const updateUser = AdminModel.findByIdAndUpdate(newUser._id,{profileImg:imgURL});
        }
        res.status(200).json({success:true,message:'Admin Created'})
    } catch (error) {
        console.log(error);
        res.status(500).json({success:false,message:error.message});
    }
}

export const AdminLogin = async(req,res)=>{
    try {
        const {email,password} = req.body;
        const user = await AdminModel.findOne({email});
        if(!user){
            return res.status(401).json({success:false,message:'Account Not Found'});
        }

        const isMatch = bcrypt.compare(password,user.password);

        if(!isMatch){
            return res.status(400).json({
                message : "Invalid credentials provided!"
            })
        }
        
        generateTokenAndSetCookie(user._id,res);
        return res.status(200).json({
            message : "User logged in successfully",
            user
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({success:false,message:error.message});
    }
}

export const TakeProblem = async(req,res)=>{
    try {
        const {post_id} = req.body;
        const admin = req.admin;
        const post = await PostModel.findByIdAndUpdate({post_id},{
            admin_taken:admin._id,
        });
        const adminChange = await AdminModel.findByIdAndUpdate(admin._id,{
            $push : {posts: post._id}
        });

        return res.status(200).json({success:true,message:'Problem Received'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({success:false,message:error.message});
    }
}

export const updateStatus = async(req,res)=>{
    try {
        const admin = req.admin;
        const {post_id,state} = req.body;
        const post = await PostModel.findByIdAndUpdate(post_id,{
            state:state
        });
        return res.status(201).json({success:true,message:'Updated status of problem'})
    } catch (error) {
        console.error(error);
        return res.status(500).json({success:false,message:error.message});
    }
}