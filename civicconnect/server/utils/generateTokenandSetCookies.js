import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (obj , res)=>{
    const token = jwt.sign({id : obj._id} , process.env.JWT_SECRET , {
        expiresIn: '1d'
    })
	res.cookie("jwt", token, {
		maxAge: 1*24*60*60*1000,
        httpOnly:true,
        sameSite:"strict",
        secure:process.env.NODE_ENV!=="development"
	});

	return token;
};