import jwt from 'jsonwebtoken'
import UserModel from '../models/user.model.js';

const authUser = async (req,res,next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ error: "unauthorized - no token found" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ error: "Unauthorized - wrong token" })
        }
        const id = decoded.id;
        const user = await UserModel.findById(id).select('-password');
        if(!user){
            return res.status(404).json({
                message : "User not found!"
            })
        }
        req.user = user;
        next();
    } catch (error) {
        console.log("error in protectRoute middleware: ", error.message)
        res.status(500).json({ error: "internal server error" });
    }
}

export default authUser;