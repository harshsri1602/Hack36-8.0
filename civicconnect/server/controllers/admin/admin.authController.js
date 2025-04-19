import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {v2 as cloudinary} from 'cloudinary';
import validator from 'validator'
import Admin_model from '../../models/admin.model.js';

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

        const newUser = new Admin_model(data);
        await newUser.save();
        
        if(img){
            const imgUpload = await cloudinary.uploader.upload(img.path,{resource_type:"image"});
            const imgURL = imgUpload.secure_url;
            const updateUser = Admin_model.findByIdAndUpdate(newUser._id,{profileImg:imgURL});
        }
        res.status(200).json({success:true,message:'Doctor Added'})
    } catch (error) {
        console.log(error);
        res.status(500).json({success:false,message:error.message});
    }
}

export const userLogin = async(req,res)=>{
    try {
        const {email,password} = req.body;
        const user = await Admin_model.findOne({email}).select('-password');
        if(!user){
            return res.status(401).json({success:false,message:'Account Not Found'});
        }

        const isMatch = bcrypt.compare(password,user.password);
        if(isMatch){
            generateTokenAndSetCookie(res, user._id);
            res.status(200).json({success:true,user:user});
        }
        else{
            return res.status(400).json({success:false,message:'Invalid Credentials'});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({success:false,message:error.message});
    }
}