import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {v2 as cloudinary} from 'cloudinary';
import validator from 'validator'
import UserModel from '../../models/user.model';

export const userRegister = async(req,res)=>{
    try {
        const {name,email,password,phoneNumber,line1,area,pincode} = req.body;
        const img = req.file;

        if(name,email,password,phoneNumber,profileImg,line1,area,pincode){
            return res.json({success:false,message:'Fill all the details'});
        }

        if(!validator.isEmail(email)){
            return res.json({success:false,message:'Please enter a valid email'});
        }
        
        if(password.length<8){
            return res.json({success:false,message:'Enter a strong password'});
        }

        const salt = await bcrypt.genSalt(10);
        const hash_pwd = await bcrypt.hash(password,salt);
        const address={
                line1,
                area,
                pincode
        }

        const data = {
            name,
            email,
            password:hash_pwd,
            phoneNumber,
            address:JSON.parse(address),
        };

        const newUser = new UserModel(data);
        await newUser.save();
        
        if(img){
            const imgUpload = await cloudinary.uploader.upload(img.path,{resource_type:"image"});
            const imgURL = imgUpload.secure_url;
            const updateUser = UserModel.findByIdAndUpdate(newUser._id,{profileImg:imgURL});
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
        const user = await UserModel.findOne({email}).select('-password');
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