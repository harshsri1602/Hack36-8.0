import CommentModel from "../../models/comment.model.js";
import PostModel from "../../models/post.model.js";
import UserModel from "../../models/user.model.js";

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
        let {title,description,tag,latitude,longitude} = req.body;
        const img=req.file;
        latitude = parseFloat(req.body.latitude);
        longitude = parseFloat(req.body.longitude);
        if(!title || !description || !tag){
            return res.status(400).json({
                message : "Please provide title , description and tag"
            })
        }

        const postData = {
            title,
            description,
            tag,
            user : userId,
            latitude,
            longitude
        }
        if(img){
            // if user has uploaded an image to the issue
            const imgUpload = await cloudinary.uploader.upload(img.path,{resource_type:"image"});
            const imgURL = imgUpload.secure_url;
            postData.images = [imgURL];
        }

        const newPost = new PostModel(postData);
        await newPost.save();

        const updateProf = await UserModel.findByIdAndUpdate(
            userId,
            {$push : {posts : newPost._id}},
            { new: true }
        )
        if(!updateProf){
            console.log("Failed to Add to user profile");
        }

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
        const userPinCode = req.user.address.pincode;

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
        //await CommentModel.findByIdAndDelete({post_id: postId});
        await CommentModel.deleteMany({post_id : postId});
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

// route for user to add a comment to a post(works on postman)
export const CreateComment = async (req, res) => {
    try {
        const userId = req.user._id;
        const { post_id, comment } = req.body;

        if(!post_id || !comment){
            return res.status(400).json({
                message : "Please provide the post and the comment!"
            })
        }

        const post = await PostModel.findById(post_id);
        if(!post){
            return res.status(404).json({
                message : "Post not found!"
            })
        }

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

// this is for the user to post a vote for a issue (works on postman)
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
        } else if(voteType===3){
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

// this works , tested on postman
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

// this works , tested on postman
export const ViewRegion = async(req,res) => {
    try {
        const pincode = req.user.address.pincode;
        const posts = await PostModel.find({pincode : pincode}).populate('Comment');
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