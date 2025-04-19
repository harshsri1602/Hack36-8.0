import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors' ;
import connectDB from "./config/db.js";
import session from "express-session";
import memorystore from 'memorystore';
import cookieParser from 'cookie-parser';
import { connectCloudinary } from './config/cloudinary.js';
import UserRouter from './routes/user.routes.js';
const MemoryStore = memorystore(session); // This is to prevent memory leaks in session storage by providing a more efficient in-memory store than the default MemoryStore, with optional cleanup of expired sessions.

dotenv.config();
connectDB();
connectCloudinary();
const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use('/api/v1/user',UserRouter);


app.get("/", (req, res) => {
    res.send("Civic Connect API is running");
});
app.listen(process.env.PORT || 8000, () => {
    console.log(`server is running on port ${process.env.PORT || 8000}`);
});