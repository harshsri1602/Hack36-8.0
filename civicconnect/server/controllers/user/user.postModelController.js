import CommentModel from "../../models/comment.model.js";
import PostModel from "../../models/post.model.js";

export const createPost = async(req,res)=>{
    try{
        const userid = req.user._id;
        
        // const {title,description,images,tag,status,} = 
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

        if (voteType === "upvote") {
            post.upvotes += 1;
        } else if (voteType === "downvote") {
            post.downvotes += 1;
        } else {
            return res.status(400).json({ error: "Invalid vote type" });
        }

        await post.save();
        res.status(200).json({ message: "Vote registered", post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong while voting" });
    }
};

