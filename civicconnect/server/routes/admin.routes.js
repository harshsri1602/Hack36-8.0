import express from 'express';
import { AcceptProblem, AdminLogin, AdminRegister, logoutUser } from '../controllers/admin/admin.authController.js';
import authAdmin from '../middleware/authAdmin.js';

const AdminRouter = express.Router();

AdminRouter.post('/login',AdminLogin);
AdminRouter.post('/register',AdminRegister);
AdminRouter.post('/logout',authAdmin,logoutUser);
AdminRouter.post('/acceptProblem',authAdmin,AcceptProblem);

export default AdminRouter