import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
    },
    images:[{
        type:String
    }],
    tag:{type : String},
    post_date:{
        type:Date,
        default:Date.now()
    },
    sever
    state:{
        type:String,
        enum:['open','solved'],
        default:'open'
    },
    solution:[{
        type:String
    }],
    feedback:[{
        type:String
    }],
    upvoteRate:{
        type:Number,
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    comments:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Comment'
    }],
});

const PostModel = mongoose.model('Post',PostSchema);
export default PostModel;