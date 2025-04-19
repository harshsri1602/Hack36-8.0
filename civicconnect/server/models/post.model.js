import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    title:{
        // this is the main title of the post
        type:String,
        required:true,
    },
    description:{
        // this is a short description to the problem 
        type:String,
    },
    images:[{
        // images relevant to the problem
        type:String
    }],
    tag:{
        type : String,
        enum:['road','domestic','electricity','utility','other'],
        default:'domestic',
    }, // it can be road , electricity , utility , others etc
    post_date:{
        // date when post is created
        type:Date,
        default:Date.now()
    },
    latitude: {
        type: Number,
        required: true, // optional if not all posts will have a location
    },
    longitude: {
        type: Number,
        required: true,
    },
    weightedSeverity : {
        type : Number,
        default : 0
    }, // this will indicate the overall severity of the post taking into account the number of low , medium , high and critical votes on the post
    state:{
        // defines the current state of the issue 
        type:String,
        enum:['UNRESOLVED','IN PROGRESS','ACTION TAKEN','RESOLVED'],
        default:'UNRESOLVED'
    },
    solution:[{
        // this is the solution posted by the admin after resolving a problem
        // feedback by users on this solution posted by admin is based on the number of upviotes and downvotes received on this comment
        type:mongoose.Schema.Types.ObjectId,
        ref:'Solution'
    }],
    pincode:{
        type:String,
    },
    lowCount : {
        type : Number,
        default : 0
    },// number of votes for this post in the category low priority
    mediumCount : {
        type : Number ,
        default : 0
    },// number of votes for this post in the category medium priority
    highCount : {
        type : Number , 
        default : 0
    },// number of votes for this post in the category high priority
    criticalCount : {
        type : Number , 
        default : 0
    },// number of votes for this post in the category critical priority
    user:{
        // the creator of the post
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    comments:[{
        // all the comments to the post
        type:mongoose.Schema.Types.ObjectId,
        ref:'Comment'
    }],
    admin_taken:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Admin'
    }
});

const PostModel = mongoose.model('Post',PostSchema);
export default PostModel;