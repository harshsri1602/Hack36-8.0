import express from 'express';
import { getUser, logoutUser, userLogin, userRegister } from '../controllers/user/user.authController.js';
import { CreateComment, createPost, VoteComment, VotePost , viewAllUserPosts , deletePost, ViewRegion, PostById} from '../controllers/user/user.postModelController.js';
import authUser from '../middleware/authUser.js';
import { uploadImages } from '../middleware/multer.js';
//import 
const UserRouter= express.Router();

UserRouter.post('/register',userRegister);
UserRouter.post('/login',userLogin);
UserRouter.post('/postIssue',authUser,uploadImages,createPost);
UserRouter.get('/post/:id',authUser,PostById);
UserRouter.get('/viewAllPosts',authUser,viewAllUserPosts);
UserRouter.delete('/deletePost/:postId',deletePost);
UserRouter.post('/comment',authUser,CreateComment);
UserRouter.post('/vote',authUser,VotePost);
UserRouter.post('/voteComment',authUser,VoteComment);
UserRouter.get('/viewRegion',authUser,ViewRegion);
UserRouter.get('/:id',getUser)
UserRouter.post('/logout',logoutUser);

export default UserRouter;