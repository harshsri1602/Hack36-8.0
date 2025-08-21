import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors' ;
import connectDB from "./config/db.js";
import session from "express-session";
import memorystore from 'memorystore';
import cookieParser from 'cookie-parser';
import { connectCloudinary } from './config/cloudinary.js';
import UserRouter from './routes/user.routes.js';
import AdminRouter from './routes/admin.routes.js';
import rebuildTrieFromDB from './utils/rebuildTrieFromDB.js';
import passport from './config/passport.js';
const MemoryStore = memorystore(session); // This is to prevent memory leaks in session storage by providing a more efficient in-memory store than the default MemoryStore, with optional cleanup of expired sessions.

dotenv.config();
connectDB();
connectCloudinary();
const app = express();

// Middleware
app.use(cors({
    origin:'http://localhost:3000',// link to where the frontend is posted
    credentials:true,
}));
app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "mysecret",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({ checkPeriod: 86400000 }), // cleanup expired sessions every 24h
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      httpOnly: true,
      secure: false, // set true in production with HTTPS
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/v1/user',UserRouter);
app.use('/api/v1/admin',AdminRouter);


app.get("/", (req, res) => {
    res.send("Civic Connect API is running");
});

// app.listen(process.env.PORT || 8000, () => {
//     console.log(`server is running on port ${process.env.PORT || 8000}`);
// });
const startServer = async () => {
    try {
        await rebuildTrieFromDB(); // Rebuild Trie before starting server

        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running on port ${process.env.PORT || 8000}`);
        });

    } catch (err) {
        console.error("Failed to start server:", err);
    }
};

startServer(); 