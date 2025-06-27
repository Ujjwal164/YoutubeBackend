import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDb = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`Connected to the database: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("Error connecting to the database:", error);
        throw error;
        process.exit(1); // Exit the process with failure
    }
}

export default connectDb;