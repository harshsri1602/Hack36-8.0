import UserModel from "../../models/user.model.js";
import PostModel from "../../models/post.model.js";

export const createPost = async(req,res)=>{
    try{
        const userid = req.user._id;
        
        const {title,description,images,tag,status,} = 
    } catch(error){
        console.error(error);
        return res.status(500).json({
            message : "Internal Server Error!"
        })
    }
}