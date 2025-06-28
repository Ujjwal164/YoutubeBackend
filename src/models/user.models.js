import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    watchHistory: [
       {
        type:mongoose.Schema.Types.ObjectId,
        ref: "Video"
       }
    ],
    userName:{
        type:String,
        required: true,
        unique: true,
        trim: true,
        index: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
        match: /.+\@.+\..+/ // Basic email validation
    },
    fullName:{
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    avatar:{
        type:String,
        required: true
    },
    coverImage:{
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String,   
    }
},{timestamps:true});


// this is used to bcypt our password before saving it to the database
// we are using bcrypt to hash the password before saving it to the database
userSchema.pre("save", function(next) {
    if(!this.isModified("password")) return next(); // this check if password oidifed or not if not than we dont need to hash it again
    // if password is modified than we will hash it
    this.password = bcrypt.hash(this.password, 10);
    next();
})

// this is the methd we cretae to compare the password
// this method will be used to compare the password entered by the user with the hashed password stored
userSchema.methods.isComparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateRefreshToken = function() {
   return jwt.sign({
        _id: this._id
      
    },
     process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    })
}
userSchema.methods.generateAccessToken = function() {
    return jwt.sign({
        _id: this._id,
        userName: this.userName,
        email: this.email,
    }, process.env.ACCESS_TOKEN_SECRET,{
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    })
}
constUser = mongoose.model("User",userSchema);