import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/user.routes.js';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN, // Replace with your frontend URL
    credentials: true // Allow cookies to be sent with requests
}))

app.use(express.json({
    limit: '16kb' // Set a limit for the size of JSON bodies
})); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.static('public')); // Serve static files from the 'public' directory
app.use(cookieParser()); // Parse cookies from the request headers


app.use("/api/v1/users",userRoutes)

export {app};