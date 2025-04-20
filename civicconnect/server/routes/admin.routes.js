import express from 'express';
import { AcceptProblem, AdminLogin, AdminRegister, logoutUser, UpdateSolution, ViewRegion } from '../controllers/admin/admin.authController.js';
import authAdmin from '../middleware/authAdmin.js';
import { uploadImages } from '../middleware/multer.js';

const AdminRouter = express.Router();

AdminRouter.post('/login',AdminLogin);
AdminRouter.post('/register',AdminRegister);
AdminRouter.post('/logout',authAdmin,logoutUser);
AdminRouter.post('/acceptProblem',authAdmin,AcceptProblem);
AdminRouter.post('/solution',authAdmin,uploadImages,UpdateSolution);
AdminRouter.get('/posts', authAdmin, ViewRegion); 

export default AdminRouter