import e from "express";
import {User} from "../models/user.model.js";
import {ApiError}  from "../utils/ApiError.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async (req, res, next) => {
    const token = req.headers("authorization")?.replace(/Bearer\s/, "") || req.cookies.token;
    if (!token) {
        throw new ApiError(401, "unauthorized request");
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user =await User.findById(decoded._id).select('-password -refreshToken ');
        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }
        if (user.role !== decoded.role) {
            throw new ApiError(403, "Forbidden: Role mismatch");
        }

        req.user = decoded;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token");
    }
});

const isAdmin = asyncHandler( async ( req,res,next ) => {

    const user = await User.findById(req.user.id);
    if(!user){
        return next(new ApiError(404,"User Not Found"))
    }

    if(user.role!=='admin'){
        return next(new ApiError(403,"Access Denied"));
    }
    next();
});

export {verifyJWT, isAdmin}
