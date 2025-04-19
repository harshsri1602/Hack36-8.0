import { ifError } from "assert";
import CommentModel from "../../models/comment.model.js";
import PostModel from "../../models/post.model.js";
import {v2 as cloudinary} from 'cloudinary';
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
        const pincode = req.user.address.pincode;
        let { title, description, tag, latitude, longitude } = req.body;

        latitude = parseFloat(latitude);
        longitude = parseFloat(longitude);

        if(!title || !description || !tag){
            return res.status(400).json({
                message : "Please provide title , description and tag!"
            })
        }

        const postData = {
            title,
            description,
            tag,
            pincode,
            user: userId,
            latitude,
            longitude,
            images: []
        };

        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(file =>
                cloudinary.uploader.upload(file.path, { resource_type: "image" })
            );

            const uploadResults = await Promise.all(uploadPromises);
            postData.images = uploadResults.map(result => result.secure_url);
        }

        const newPost = new PostModel(postData);
        await newPost.save();

        await UserModel.findByIdAndUpdate(
            userId,
            { $push: { posts: newPost._id } },
            { new: true }
        );

        return res.status(200).json({
            message: "User successfully created a post!",
            post: newPost
        });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error!"
        });
    }
};

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

// route for a user to delete a post(works , tested on postman)
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
            {$pull : {posts : postId,interactedPosts : {postId : postId}}}
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

        if (![0, 1, 2, 3].includes(voteType)) {
            return res.status(400).json({ error: "Invalid vote type" });
        }

        const post = await PostModel.findById(post_id);
        if (!post) return res.status(404).json({ error: "Post not found" });
        // Input of votetype should be 0 1 2 3

        let flag=false;

        let checkPreviousInteraction = await UserModel.findOne({_id : userId , "interactedPosts.postId" : post_id}).select('interactedPosts');
        const existingVoteIndex = post.votes.findIndex(v => v.userId.toString() === userId.toString());
        
        if(checkPreviousInteraction){
            flag=true;
            // user has already voted on this post
            // nullify the effect of the previous vote 
            
            const previousReaction = checkPreviousInteraction.interactedPosts.find(item => item.postId.toString() === post_id.toString());
            if(previousReaction.reaction === 0){
                post.lowCount-=1;
            }
            else if(previousReaction.reaction === 1){
                post.mediumCount-=1;
            }
            else if(previousReaction.reaction === 2){
                post.highCount-=1;
            }
            else{
                post.criticalCount-=1;
            }
        }
        let currentReaction;
        if (voteType === 0) {
            currentReaction = 0;
            post.lowCount += 1;
        } else if (voteType === 1) {
            currentReaction=1;
            post.mediumCount += 1;
        } else if(voteType===2){
            currentReaction=2;
            post.highCount += 1; 
        } else if(voteType===3){
            currentReaction=3;
            post.criticalCount += 1; 
        } else {
            return res.status(400).json({ error: "Invalid vote type" });
        }
        if(!flag){
            // user voted on this post for the first time , just add the reaction
            await UserModel.findOneAndUpdate(
                {_id : userId },
                {$push : {interactedPosts : {postId : post_id,reaction : currentReaction}}}
            )
            post.votes.push({ userId, voteType });
        }
        else{
            // user voted on this post b4 , just update the reaction
            await UserModel.findOneAndUpdate(
                {_id : userId , "interactedPosts.postId" : post_id},
                {$set : {"interactedPosts.$.reaction" : currentReaction}}
            )
            post.votes[existingVoteIndex].voteType = voteType;
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
        //console.log(req.user);
        const { commentId, voteType } = req.body;
        if (!["upvote", "downvote"].includes(voteType)) {
            return res.status(400).json({ error: "Invalid vote type" });
        }
        
        const comment = await CommentModel.findById(commentId);
        if (!comment) return res.status(404).json({ error: "Comment not found" });

        if (!comment.upvotes) comment.upvotes = 0;
        if (!comment.downvotes) comment.downvotes = 0;

        const existingVoteIndex = comment.votes.findIndex(v => v.userId.toString() === userId.toString());
        let flag=false;
        let checkPreviousInteraction = await UserModel.findOne({_id : userId , "interactedComments.commentId" : commentId}).select('interactedComments');
        let currentReaction;
        if(checkPreviousInteraction && (existingVoteIndex !== -1)){
            flag=true;
            const previousReaction = checkPreviousInteraction.interactedComments.find(item => item.commentId.toString() === commentId.toString());
            const previousVote = comment.votes[existingVoteIndex].voteType;
            if(previousReaction.reaction === "upvote"){
                comment.upvotes-=1;
            }
            else{
                comment.downvotes-=1;
            }
        }

        if (voteType === "upvote") {
            currentReaction="upvote";
            comment.upvotes += 1;
        } else if (voteType === "downvote") {
            currentReaction="downvote";
            comment.downvotes += 1;
        } else {
            return res.status(400).json({ error: "Invalid vote type" });
        }

        if(!flag){
            await UserModel.findOneAndUpdate(
                {_id : userId },
                {$push : {interactedComments : {commentId : commentId,reaction : currentReaction}}}
            )
            comment.votes.push({ userId, voteType });
        }
        else{
            await UserModel.findOneAndUpdate(
                {_id : userId , "interactedComments.commentId" : commentId},
                {$set : {"interactedComments.$.reaction" : currentReaction}}
            )
            comment.votes[existingVoteIndex].voteType = voteType;
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
        //const posts = await PostModel.find({pincode : pincode}).populate('comments');
        const posts = await PostModel.find({pincode : pincode}).populate('comments');
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

export const PostById = async(req,res)=>{
    try {
        const {id} = req.params;
        const userId = req.user._id;
        const post = await PostModel.findById(postId);
        if(!post){
            return res.status(404).json({
                message : "The given post does not exist!"
            })
        }
        return res.status(200).json({success:true,post});   
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong while voting on comment" });
    }
}

export const removeCommentVote = async(req,res)=>{
    try{
        const userId = req.user._id;
        const {commentId} = req.params;

        const comment = await CommentModel.findById(commentId);
        if(!comment){
            return res.status(404).json({
                message : "Given comment does not exist!"
            })
        }

        const user = await UserModel.findOne({
            _id: userId,
            "interactedComments.commentId": commentId,
        });

        if (!user) {
            return res.status(400).json({ message: "No vote to remove" });
        }

        const interaction = user.interactedComments.find(
            (item) => item.commentId.toString() === commentId.toString()
        );

        // Update vote count
        if (interaction.reaction === "upvote") {
            comment.upvotes = Math.max(comment.upvotes - 1, 0);
        } else if (interaction.reaction === "downvote") {
            comment.downvotes = Math.max(comment.downvotes - 1, 0);
        }

        await comment.save();

        await UserModel.updateOne(
            {_id : userId},
            {$pull : {interactedComments : {commentId : commentId}}}
        )

        return res.status(200).json({
            message : "vote from comment successfully removed!"
        })

    } catch(error){
        console.error(error);
        return res.status(500).json({
            message : "Internal Server Error"
        })
    }
}

export const removePostVote = async(req,res)=>{
    try{
        const userId = req.user._id;
        const {postId} = req.params;

        const post = await PostModel.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: "Given post does not exist!",
            });
        }

        const user = await UserModel.findOne({
            _id: userId,
            "interactedPosts.postId": postId,
        });

        if (!user) {
            return res.status(400).json({ message: "No vote to remove" });
        }

        const interaction = user.interactedPosts.find(
            (item) => item.postId.toString() === postId.toString()
        );  

        if (interaction.reaction === 0) {
            post.lowCount = Math.max(post.lowCount - 1, 0);
        } else if (interaction.reaction === 1) {
            post.mediumCount = Math.max(post.mediumCount - 1, 0);
        } else if (interaction.reaction === 2) {
            post.highCount = Math.max(post.highCount - 1, 0);
        } else if (interaction.reaction === 3) {
            post.criticalCount = Math.max(post.criticalCount - 1, 0);
        }

        await post.save();

        await UserModel.updateOne(
            { _id: userId },
            { $pull: { interactedPosts: { postId: postId } } }
        );

        return res.status(200).json({
            message: "Vote from post successfully removed!",
        });


    } catch(error){
        console.error(error);
        return res.status(500).json({
            message : "Internal Server Error"
        })
    }
}