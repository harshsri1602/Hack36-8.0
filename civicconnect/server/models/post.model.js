import mongoose from "mongoose";

const post_schema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
    },
    img:[{
        type:String
    }],
    tags:[{
        type:String,
    }],
    post_date:{
        type:Date,
        default:Date.now()
    },
    status:{
        type:String,
        enum:['Immediate','Serious','Normal'],
        required:true,
    },
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
    }
});

const Post_model = mongoose.model('Posts',post_schema);
export default Post_model