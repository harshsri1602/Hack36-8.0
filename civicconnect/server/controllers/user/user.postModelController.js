import CommentModel from "../../models/comment.model.js";
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
        const latitude = parseFloat(req.body.latitude);
        const longitude = parseFloat(req.body.longitude);
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

export const CreateComment = async (req, res) => {
    try {
        const userId = req.user._id;
        const { post_id, comment } = req.body;

        const newComment = new CommentModel({
            post_id,
            written_by: userId,
            comment
        });

        await newComment.save();

        await PostModel.findByIdAndUpdate(
            post_id,
            { $push: { comments: newComment._id } },
            { new: true }
        );

        res.status(201).json({
            message: "Comment added successfully",
            comment: newComment
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong while creating the comment" });
    }
};

export const VotePost = async (req, res) => {
    try {
        const userId = req.user._id;
        const { post_id, voteType } = req.body;

        const post = await PostModel.findById(post_id);
        if (!post) return res.status(404).json({ error: "Post not found" });
        // Input of votetype should be 0 1 2 3
        if (voteType === 0) {
            post.lowCount += 1;
        } else if (voteType === 1) {
            post.mediumCount += 1;
        } else if(voteType===2){
            post.highCount += 1; 
        } else if(voteType===2){
            post.criticalCount += 1; 
        } else {
            return res.status(400).json({ error: "Invalid vote type" });
        }

        await post.save();
        res.status(200).json({ message: "Vote registered", post:post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong while voting" });
    }
};

export const VoteComment = async (req, res) => {
    try {
        const userId = req.user._id;
        const { commentId, voteType } = req.body;

        const comment = await CommentModel.findById(commentId);
        if (!comment) return res.status(404).json({ error: "Comment not found" });

        if (!comment.upvotes) comment.upvotes = 0;
        if (!comment.downvotes) comment.downvotes = 0;

        if (voteType === "upvote") {
            comment.upvotes += 1;
        } else if (voteType === "downvote") {
            comment.downvotes += 1;
        } else {
            return res.status(400).json({ error: "Invalid vote type" });
        }

        await comment.save();
        res.status(200).json({ message: "Comment vote registered", comment:comment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong while voting on comment" });
    }
};

export const ViewRegion = async(req,res) => {
    try {
        const pincode = req.user.address.pincode;
        const posts = await PostModel.find({pincode});
        if(!posts){
            return res.status(200).json({success:true,message:"No problems in your region"});
        }
        else{
            return res.status(200).json({success:true,posts});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong while voting on comment" });
    }
}