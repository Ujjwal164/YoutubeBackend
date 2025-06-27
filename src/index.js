import dotenv from 'dotenv';
import connectDb from './db/index.js';

dotenv.config({
    path: './.env' // Specify the path to your .env file
}); // Load environment variables from .env file
connectDb(); // here we are calling the connectDb function to connect to the database