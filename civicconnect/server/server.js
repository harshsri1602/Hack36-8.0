require("dotenv").config();
const express = require("express");
const cors = require("cors"); 
const connectDB = require("./config/db");
const session = require("express-session");
const MemoryStore = require('memorystore')(session); // This is to prevent memory leaks in session storage by providing a more efficient in-memory store than the default MemoryStore, with optional cleanup of expired sessions.

connectDB();
const app = express();
app.use(cors());
app.use(express.json());



app.get("/", (req, res) => {
    res.send("Civic Connect API is running");
});
app.listen(process.env.PORT || 8000, () => {
    console.log(`server is running on port ${process.env.PORT || 8000}`);
});