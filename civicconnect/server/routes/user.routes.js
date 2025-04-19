import express from 'express';
import { userLogin, userRegister } from '../controllers/user/user.authController.js';
import { CreateComment, createPost, VoteComment, VotePost , viewAllUserPosts , deletePost, ViewRegion} from '../controllers/user/user.postModelController.js';
import authUser from '../middleware/authUser.js';
//import 
const UserRouter= express.Router();

UserRouter.post('/register',userRegister);
UserRouter.post('/login',userLogin);
UserRouter.post('/postIssue',authUser,createPost);
UserRouter.get('/viewAllPosts',authUser,viewAllUserPosts);
UserRouter.delete('/deletePost/:postId',authUser,deletePost);
UserRouter.post('/comment',authUser,CreateComment);
UserRouter.post('/vote',authUser,VotePost);
UserRouter.post('/voteComment',authUser,VoteComment);
UserRouter.get('/viewRegion',authUser,ViewRegion);

export default UserRouter;