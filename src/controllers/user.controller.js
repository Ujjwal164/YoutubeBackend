import asyncHandler from "../utils/asyncHandler.js";
import {User} from "../models/user.models.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";


const register = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const {fullName , email , userName , password } = req.body

     if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }
    
    const checkUser = await User.findOne({
        $or: [{ email }, { userName }]
    });
    if(checkUser) {
        throw new ApiError(400, "User already exists")
    }

    const avatarPath = req.files.avatar?.[0]?.path;  // just like express giveuse req. bodyy so ike that multer provide us req.filles so we can access the files uploaded by user
    const coverImagePath = req.files.coverImage?.[0]?.path;

    if(!avatarPath) {
        throw new ApiError(400, "Avatar is required")
    }

    const uploadedAvatar = await uploadImage(avatarPath);
    const uploadedCoverImage = coverImagePath ? await uploadImage(coverImagePath) : null;
    if(!uploadedAvatar) {
        throw new ApiError(500, "Failed to upload avatar")
    }

    const user  = await User.create({
        fullName,
        email,
        userName,
        password,
        avatar: uploadedAvatar.secure_url, // cloudinary return us the url of the image
        coverImage: uploadedCoverImage ? uploadedCoverImage.secure_url : null
    })

    const createdUser = User.findById({_id: user._id}).select("-password -refreshToken"); // -- yeh humna isliye lgaye kyuki yeh huma nahi chaiye
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            "User registered successfully",
            createdUser
        )
    );

   
});



export {register};