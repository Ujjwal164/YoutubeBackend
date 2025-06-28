import mongoose from "mongoose";

const userSchema = new mongoose.Schema({},{timestamps:true});

constUser = mongoose.model("User",userSchema);