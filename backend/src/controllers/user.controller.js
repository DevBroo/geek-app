import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {User} from "../models/user.model.js";
import {Address} from "../models/address.model.js";
import { cloudinary, uploadImageCloudinary } from "../utils/cloudinary.service.js";
import jwt from "jsonwebtoken";



const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId).select("-password -refreshToken");
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Error generating access and refresh tokens:", error);
        throw new ApiError(500, "Internal server error");
        
    }

}; 

const registerUser = asyncHandler( async (req, res) => {

    const { username, email, password } = req.body;

    const existedUser = await User.findOne({
        $or: [{ email }, { username }],
    });
    console.log(existedUser);

    if (existedUser) {
        throw new ApiError(400, "User already exists with this email or username");
    }

    const { orgName, contactNumber, shopAddress, GSTNumber, urdId, isBoth, billingAddress, shippingAddress, district, landmark, city, pinCode, state } = req.body;

    if (
        [ email, username, password, orgName, contactNumber, shopAddress, GSTNumber, urdId, isBoth, billingAddress, shippingAddress, district, landmark, city, pinCode, state].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    // make the orgName regex to be alphabetic and 3-50 characters long
    const orgNameRegex = /^[a-zA-Z\s]{3,50}$/;
    if (!orgNameRegex.test(orgName)) {
        throw new ApiError(400, "Invalid organization name format");
    }

    // make the cotactnumber regex to be 10 digit number
    const contactNumberRegex = /^\d{10}$/;
    if (!contactNumberRegex.test(contactNumber)) {
        throw new ApiError(400, "Invalid contact number format");
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,12}$/;
    if (!passwordRegex.test(password)) {
        throw new ApiError(400, "Invalid password format");
    }

    // make the username regex to be alphanumeric and 3-20 characters long
    const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
    if (!usernameRegex.test(username)) {
        throw new ApiError(400, "Invalid username format");
    }

    // make the email regex to be valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Invalid email format");
    }

    // make the GSTNumber regex to be 15 digit alphanumeric number
    const GSTNumberRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!GSTNumberRegex.test(GSTNumber)) {
        throw new ApiError(400, "Invalid GST number format");
    }   
    
    let profilePictureLocalPath;
    if (req.files && Array.isArray(req.files.profilePicture) && req.files.profilePicture.length > 0) {
        profilePictureLocalPath = req.files.profilePicture[0].path || "";
    } 

    const profilePicture = await uploadImageCloudinary(profilePictureLocalPath);
    if (!profilePicture) {
        throw new ApiError(500, "Failed to upload profile picture");
    }

    // const options = {
    //     HttpOnly: true,
    //     secure: process.env.NODE_ENV === 'production', // Set to true in production
    // }

    if (GSTNumber && GSTNumber !== '') {
        isGstVerified = true; 
    }
    if (!billingAddress || !shippingAddress || !district || !landmark || !city || !pinCode || !state) {
        throw new ApiError(400, "All address fields are required")
    }


    const newUser = await User.create({
        fullName,
        email,
        username,
        password,
        orgName,
        contactNumber,
        shopAddress,
        GSTNumber,
        profilePicture: profilePicture.url, // Assuming profilePicture.url contains the URL of the uploaded image
    });

    if (!newUser) {
        throw new ApiError(500, "Failed to create user");
    }
    console.log(newUser);
    await newUser.save({ validateBeforeSave: false });

    const userAddress = await Address.create({
        isBoth,
        billingAddress,
        shippingAddress,
        district,
        landmark,
        city,
        pinCode,
        state,
        user: newUser._id, // Will be set after user creation
    });
    if (!userAddress) {
        throw new ApiError(500, "Failed to create address");
    }
    await userAddress.save({ validateBeforeSave: false });

    return res.status(200)
    // .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
        new ApiResponse(
           200,
            "User registered successfully",
            {
                user: newUser,
                address: userAddress,
                // accessToken,
                refreshToken,
                profilePicture: profilePicture.url, // Assuming profilePicture.url contains the URL of the uploaded image
            }
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

    const {email, username, password} = req.body
    console.log(email);

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
    
    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

   const isPasswordValid = await user.isPasswordCorrect(password)

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }

   const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

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
   
const logOutUser = asyncHandler(async (req, res) => {
    
    const user = req.user;
    if (!user) {
        throw new ApiError(401, "User not authenticated");
    } 

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Set to true in production
        sameSite: 'Strict', // Adjust as needed
    };

    await User.findByIdAndUpdate(
        req.user._id, 
        { 
            $set:{
                refreshToken: undefined
            }
        }, 
        { new: true }
    )
        .then(() => {
            res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, {}, "User logged out successfully"));
        }
        )
        .catch(error => {
            console.error("Error logging out user:", error);
            throw new ApiError(500, "Internal Server Error");
        }
    );
});


const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.body.refreshToken || req.cookies.refreshToken 

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})


const changeCurrentPassword = asyncHandler( async( req, res) => {
    // get current password and new password from req.body and compare it with db password and update it.
    // if old password matches then only allow to change the password else throw error.
    // also add some validations like min length etc... for new password. 

    const {oldPassword, newPassword} = req.body;

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect =await user.isPasswordCorrect(oldPassword)
        
    if(!isPasswordCorrect){
        throw new ApiError(401, "Old Password is incorrect")
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,12}$/;
    if (!passwordRegex.test(newPassword)) {
        throw new ApiError(400, "Invalid password format");
    }

    user.password = newPassword;
    user = await user.save({validateBeforeSave : false})

    return res.
    status(200).
    json(
        new ApiResponse(200, user, "Password changed successfully"))

})

const getCurrentUser = asyncHandler(async (req, res) => {
    // fetch the user from db using id stored in req.user._id and send response back to client.
    return res.
    status(200).
    json(new ApiResponse(200, req.user, "User fetched successfully"))
}
);


const updateAccountDetails = asyncHandler( async( req, res ) => {
    const {username, email, contactNumber, shopAddress, GSTNumber, urdId, } = req.body;

    if (!username || !email || !contactNumber || !shopAddress || !GSTNumber || !urdId) {
        new ApiError(400, "All fields is required to update account details")
    }
 
    const user = await user.findByIdAndUpdate(
        req.user._id, {
        
        $set:{
                username,
                email,
                contactNumber,
                shopAddress,
                GSTNumber,
                urdId,
            }
    },
    {new:true})
    .select("-password")

    return res.
    status(200).
    json(new ApiResponse(200, user, "Account Details updated successfully"))

})


const updateProfilePicture = asyncHandler( async( req, res ) => {
    const profilePictureLocalPath = req.file?.path 

    if (!profilePictureLocalPath){
        throw new ApiError(400, "No file found")
    }

    const picture = await uploadImageCloudinary(profilePictureLocalPath)

    if(!picture.url){
        throw new ApiError(500, "Error while uploading profile picture")
    }

    // TODO: remove the previous profile picture from cloudinary before updating the new one. 
    cloudinary.uploader.destroy(picture.public_id);

    const user = await User.findByIdAndUpdate(
        req.user?._id, {
            $set:{
                    profilePicture: picture.url
                }
        },
        {new:true}
    )
    .select("-password -refreshToken")

    return res.
    status(200).
    json(new ApiResponse(200, user, "Profile Picture updated successfully"))  
})


export { 
    registerUser, 
    loginUser, 
    logOutUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateAccountDetails, 
    updateProfilePicture 
};