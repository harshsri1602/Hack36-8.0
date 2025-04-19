import UserModel from "../../models/user.model.js";
import PostModel from "../../models/post.model.js";

// export const createPost = async(req,res)=>{
//     try{
//         const userid = req.user._id;
        
//         const {title,description,images,tag,status,} = 
//     } catch(error){
//         console.error(error);
//         return res.status(500).json({
//             message : "Internal Server Error!"
//         })
//     }
// }

export const createPost = async(req,res)=>{
    try{
        const userId = req.user._id;
        const {title,description,tag} = req.body;
        const img=req.file;

        if(!title || !description || !tag){
            return res.status(400).json({
                message : "Please provide title , description and tag"
            })
        }

        const postData = {
            title,
            description,
            tag,
            user : userId
        }
        if(img){
            // if user has uploaded an image to the issue
            const imgUpload = await cloudinary.uploader.upload(img.path,{resource_type:"image"});
            const imgURL = imgUpload.secure_url;
            postData.images = [imgURL];
        }

        const newPost = new PostModel(postData);
        await newPost.save();

        await UserModel.findByIdAndUpdate(
            userId,
            {$push : {posts : newPost._id}}
        )

        return res.status(200).json({
            message : "User successfully created a post!",
            post : newPost
        })

    } catch(error){
        console.error(error);
        return res.status(500).json({
            message : "Internal Server Error!"
        })
    }
}