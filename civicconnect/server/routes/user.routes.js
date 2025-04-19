import express from 'express';
import { userLogin, userRegister } from '../controllers/user/user.authController.js';
//import 
const UserRouter= express.Router();

UserRouter.post('/register',userRegister);
UserRouter.post('/login',userLogin);
//UserRouter.post('/postIssue',createPost);

export default UserRouter