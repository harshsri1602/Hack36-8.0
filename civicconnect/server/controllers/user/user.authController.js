import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {v2 as cloudinary} from 'cloudinary';
import validator from 'validator'
import UserModel from '../../models/user.model.js';
import {generateTokenAndSetCookie} from '../../utils/generateTokenandSetCookies.js'

export const userRegister = async(req,res)=>{
    try {
        const {name,email,password,phoneNumber,line1,area,pincode} = req.body;
        const img = req.file;

        if(!name || !email || !password || !phoneNumber || !line1 || !area || !pincode){
            return res.status(400).json({success:false,message:'Fill all the details'});
        }

        if(!validator.isEmail(email)){
            return res.status(400).json({success:false,message:'Please enter a valid email'});
        }
        
        if(password.length<8){
            return res.status(400).json({success:false,message:'Enter a strong password'});
        }

        const checkUser = await UserModel.findOne({$or:[{email},{phoneNumber}]});
        if(checkUser){
            return res.status(400).json({success:false,message:"Email or Phone Number Already taken"});
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
            //address:JSON.parse(address),
            address
        };

        const newUser = new UserModel(data);
        await newUser.save();
        
        if(img){
            const imgUpload = await cloudinary.uploader.upload(img.path,{resource_type:"image"});
            const imgURL = imgUpload.secure_url;
            const updateUser = await UserModel.findByIdAndUpdate(newUser._id,{profileImg:imgURL});
            await updateUser.save();
        }
        return res.status(200).json({success:true,message:'User Created'})
    } catch (error) {
        console.error(error);
        return res.status(500).json({success:false,message:error.message});
    }
}

export const userLogin = async(req,res)=>{
    try {
        const {email,password} = req.body;
        const user = await UserModel.findOne({email});
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

export const updateProfile = async(req,res) => {
    try {
        
        const {email,password,phoneNumber,line1,area,pincode} = req.body;
        const user = req.user;
        const checkUser = UserModel.find({$or:[{email},{phoneNumber}]});
        if(checkUser){
            return res.status(400).json({success:false,message:"Email or Phone Number Already taken"});
        }

        const salt = await bcrypt.genSalt(10);
        const hash_pwd = await bcrypt.hash(password,salt);
        const address={
                line1,
                area,
                pincode
        }

        const updateUser = await UserModel.findByIdAndUpdate(user._id,{email,password:hash_pwd,phoneNumber,address:JSON.parse(address)})
        await updateUser.save();
        return res.status(200).json({success:true,message:"Updated User Information"});
        
    } catch (error) {
        console.log(error);
        res.status(500).json({success:false,message:error.message});
    }
}

export const logoutUser = async (req, res) => {
    try {
        // Clear the cookie
        res.clearCookie('jwt', {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
        });

        return res.status(200).json({
            success: true,
            message: 'User logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong during logout'
        });
    }
};

export const getUser = async(req,res)=>{
    try {
        const {id} = req.params; 
        const data = await UserModel.findById(id);
        const name = data.name;
        return res.status(200).json({success:true,name});       
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
}