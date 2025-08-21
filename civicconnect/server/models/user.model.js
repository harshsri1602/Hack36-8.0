import mongoose from 'mongoose'

const user_Schema = new mongoose.Schema({
    googleId:{
        type:String
    },
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true,
    },
    phoneNumber:{
        type:Number,
        required:true,
    },
    profileImg:{
        type:String,
        default:'data:image/png;base64,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'
    },
    address:{
        type:Object,
        default:{
            line1:'',
            area:'',
            pincode:'',
        }
    },
    interactedPosts : [{
        postId : {type : mongoose.Schema.Types.ObjectId,ref:'Post'},
        reaction : {type : Number}
    }], // this is to ensure that a user is not able to do multiple votes for a post
    interactedComments : [{
        commentId : {type : mongoose.Schema.Types.ObjectId,ref:'Comment'},
        reaction : {type : String}
    }], // this is to ensure that a user is not able to do multiple votes for a comment
    banned:{
        type:Boolean,
        default:false,
    },
    posts:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post"
    }],
    isVerified:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
});

const UserModel = mongoose.model('User',user_Schema);
export default UserModel;