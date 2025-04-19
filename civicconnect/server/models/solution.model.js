import mongoose from "mongoose";

const solution_schema = new mongoose.Schema({
    description:{
        type:String,
        required:true,
    },
    img:{
        type:String,
    },
    post:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Post'
    }
});

const SolutionModel = mongoose.model('Solution',solution_schema);
export default SolutionModel;