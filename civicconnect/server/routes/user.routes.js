import express from 'express';
import { userLogin, userRegister } from '../controllers/user/user.authController.js';
import { createPost , viewAllUserPosts , deletePost} from '../controllers/user/user.postModelController.js';
import authUser from '../middleware/authUser.js';
const UserRouter= express.Router();

UserRouter.post('/register',userRegister);
UserRouter.post('/login',userLogin);
UserRouter.post('/postIssue',authUser,createPost);
UserRouter.get('/viewAllPosts',authUser,viewAllUserPosts);
UserRouter.delete('/deletePost/:postId',deletePost);
export default UserRouter