import express from 'express';
import { userLogin, userRegister } from '../controllers/user/user.authController.js';
import { createPost } from '../controllers/user/user.postModelController.js';
import authUser from '../middleware/authUser.js';
const UserRouter= express.Router();

UserRouter.post('/register',userRegister);
UserRouter.post('/login',userLogin);
UserRouter.post('/postIssue',authUser,createPost);

export default UserRouter