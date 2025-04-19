import UserModel from "../../models/user.model.js";
import PostModel from "../../models/post.model.js";
import CommentModel from "../../models/comment.model.js";

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

// route for user to create a post (works on postman)
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

// route for user to find all the posts he has posted (works on postman)
export const viewAllUserPosts = async(req,res)=>{
    try{
        const userId = req.user._id;

        const allUserPosts = await UserModel.findById(userId).select('posts').populate('posts');

        if(!allUserPosts){
            return res.status(404).json({
                message : "No posts for the given user found"
            })
        }

        return res.status(200).json({
            message : "All the posts by the user successfully fetched!",
            allUserPosts
        })
    } catch(error){
        console.error(error);
        return res.status(500).json({
            message : "Internal Server Error!"
        })
    }
}

// route for a user to delete a post
export const deletePost = async(req,res)=>{
    try{
        const {postId} = req.params;
        const userId = req.user._id;
        const post = await PostModel.findById(postId);
        if(!post){
            return res.status(404).json({
                message : "The given post does not exist!"
            })
        }

        // first delete all the dependicies of all this post
        // delete this post from the user
        await UserModel.findByIdAndUpdate(
            userId,
            {$pull : {posts : postId}}
        )

        // now delete all the associated comments to this post (NOT DONE YET)
        await CommentModel.findByIdAndDelete({post_id: postId});
        // now delete the post
        await PostModel.findByIdAndDelete(postId);

        return res.status(200).json({
            message : "The given post is successfully deleted!"
        })
        
    } catch(error){
        console.error(error);
        return res.status(500).json({
            message : "Internal Server Error!"
        })
    }
}