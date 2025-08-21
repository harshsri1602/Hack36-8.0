import express from 'express';
import { getUser, logoutUser, updateProfile, userLogin, userRegister } from '../controllers/user/user.authController.js';
//import { CreateComment, createPost, VoteComment, VotePost , viewAllUserPosts , deletePost, ViewRegion, PostById} from '../controllers/user/user.postModelController.js';
//import { userLogin, userRegister } from '../controllers/user/user.authController.js';
import { searchPosts,removeCommentVote,removePostVote,CreateComment, createPost, VoteComment, VotePost , viewAllUserPosts , deletePost, ViewRegion,PostById, viewAllPosts} from '../controllers/user/user.postModelController.js';
import authUser from '../middleware/authUser.js';
import { uploadImages } from '../middleware/multer.js';
import passport from '../config/passport.js';
const UserRouter= express.Router();

UserRouter.get('/searchPosts',authUser,searchPosts);
UserRouter.post('/register',userRegister);
UserRouter.post('/login',userLogin);
UserRouter.post('/postIssue',authUser,uploadImages,createPost);
UserRouter.get('/post/:id',authUser,PostById);
UserRouter.get('/viewAllPosts',authUser,viewAllUserPosts);
UserRouter.delete('/deletePost/:postId',authUser,deletePost);
UserRouter.post('/comment',authUser,CreateComment);
UserRouter.post('/vote',authUser,VotePost);
UserRouter.post('/voteComment',authUser,VoteComment);
UserRouter.get('/viewRegion',authUser,ViewRegion);
UserRouter.post('/logout',logoutUser);
UserRouter.post('/removePostVote/:postId',authUser,removePostVote);
UserRouter.post('/removeCommentVote/:commentId',authUser,removeCommentVote);
UserRouter.put('/updateProfile/:userId', updateProfile);
UserRouter.get('/viewAll', viewAllPosts)
UserRouter.get('/:id',getUser)

// Google authentication
UserRouter.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback route
UserRouter.get(
    "/auth/callback/google",
    passport.authenticate("google", { session: false }),
    (req, res) => {
        generateTokenAndSetCookie(req.user, res);

        res.redirect(`${process.env.FRONTEND_URL}/auth/google/success`);
    }
);

export default UserRouter;