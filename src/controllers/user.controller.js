import asyncHandler from "../utils/asyncHandler.js";
import {User} from "../models/user.models.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import uploadImage from "../utils/Cloudinary.js";
import Jwt from "jsonwebtoken";

const generateRefreshAndAccessToken = async(userId)=>{
    try {
        const user = await User.findById(userId);
        if(!user) {
            throw new ApiError(404, "User not found");
        }
    
        const refreshToken = user.generateRefreshToken();
        const accessToken = user.generateAccessToken();
    
        user.refreshToken = refreshToken;
        user.save();
    
        return {
            accessToken,
            refreshToken
        }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

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
        [fullName, email, userName, password].some((field) => field?.trim() === "")
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

    const createdUser =await User.findById({_id: user._id}).select("-password -refreshToken"); // -- yeh humna isliye lgaye kyuki yeh huma nahi chaiye
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            createdUser,
            "User registered successfully"
        )
    );

   
});

const loginUser = asyncHandler(async (req, res) =>{
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const {email, userName, password} = req.body
    console.log(email);

    if (!userName && !email) {
        throw new ApiError(400, "username or email is required")
    }
    
    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }

    const user = await User.findOne({
        $or: [{userName}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

   const isPasswordValid = await user.isPasswordCorrect(password)

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }

   const {accessToken, refreshToken} = await generateRefreshAndAccessToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})

const logOut = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
        req.user._id, 
        {
        $set:{
            refreshToken:1
        }
    },
    {
        new: true
    }
);
 const options = {
        httpOnly: true,
        secure: true, // Set to true if using HTTPS
        
    };
return res.status(200)
.clearCookie("accessToken", options)
.clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
});

const generateAccessRefreshToken = asyncHandler(async (req,res) => {
   const incomingRefreshToken = res.cookie.refreshToken || req.body.refreshToken;

   if(!incomingRefreshToken) {
    throw new ApiError(400, "Refresh token is required")
   }

   try {
      const decodedToken = Jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
      
      const user = await User.findById(decodedToken._id);
      if(!user) {
        throw new ApiError(401, "Invalid refresh token")
      }

      if(incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Refresh token is invalid or expired")
      }

        const {accessToken, newRefreshToken} = await generateRefreshAndAccessToken(user._id);
        const options = {
            httpOnly: true, 
            secure: true // Set to true if using HTTPS
        };
        return res.status(200)
        .cookie("accessToken", accessToken, options)    
        .cookie("refreshToken", newRefreshToken, options)
        .json(new ApiResponse(
            200,
             {accessToken, refreshToken:newRefreshToken},
              "Tokens generated successfully"));
    } catch (error) {
      throw new ApiError(401, "Invalid refresh token")
   }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const {currentPassword , newPassword} = req.body;
    const user = await User.findById(req.user._id);
    if(!user) {
        throw new ApiError(404, "User not found")
    }
    const isPasswordValid = await user.isPasswordCorrect(currentPassword);
    if(!isPasswordValid) {
        throw new ApiError(401, "Current password is incorrect")
    }
    user.password = newPassword;
    await user.save({validationBeforeSave: true}); // this will validate the password before saving it to the database
    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(
        200,
        req.user,
        "Currnt user fetched"
    )
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const {fullName, userName, email} = req.body;
    if(!fullName || !userName || !email) {
        throw new ApiError(400, "All fields are required")
    }
    const user = await User.findByIdAndUpdate(
        req.user._id, 
        {
            $set: {
                fullName,
                userName,
                email
            }
        },
        {
            new: true, // this will return the updated user
            
        }
    ).select("-password");
 
    
    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "User details updated successfully"
        )
    )
});

const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    //TODO: delete old image - assignment

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    )
})

const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing")
    }

    //TODO: delete old image - assignment


    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover image updated successfully")
    )
})
export {register,
    loginUser,
    logOut,
    generateAccessRefreshToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
};