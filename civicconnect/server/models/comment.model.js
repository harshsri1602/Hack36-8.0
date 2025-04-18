import mongoose from "mongoose";

const comment_schema = new mongoose.Schema({
    post_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Posts',
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

const Comment_model= mongoose.model('Comments',comment_schema);
export default Comment_model;