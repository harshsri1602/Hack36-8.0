import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
    post_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Post',
        required:true,
    },
    written_by:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    comment:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
    },
})

const CommentModel= mongoose.model('Comment',CommentSchema);
export default CommentModel;