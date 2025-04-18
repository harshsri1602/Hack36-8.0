import express from 'express';
import { userLogin, userRegister } from '../controllers/user/user.authController';

const UserRouter= express.Router();

UserRouter.post('/register',userRegister);
UserRouter.post('/login',userLogin);

export default UserRouter