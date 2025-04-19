import jwt from 'jsonwebtoken'
import Admin_model from '../models/admin.model.js';

const authAdmin = async (req,res,next) => {
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
        const user = await Admin_model.findById(id).select('-password');
        req.admin = user;
        next();
    } catch (error) {
        console.log("error in protectRoute middleware: ", error.message)
        res.status(500).json({ error: "internal server error" });
    }
}

export default authAdmin;