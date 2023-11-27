import express, { NextFunction } from 'express'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import CustomException from '../utils/error.handler'
import userModel from '../models/user.model'
import CustomResponse from '../utils/response.handler'
dotenv.config()

// This was put into this file due to some issues with my TypeScript Compiler.
declare global {
    namespace Express {
        interface Request {
            user: any
        }
    }
}

// A middleware function to verify and validate the jwt token passed before
// allowing a user perform a request
export async function verifyToken(
    request: express.Request,
    response: express.Response,
    next: NextFunction
) {
    if (
        request.headers.authorization &&
        request.headers.authorization.startsWith("Bearer")
    ) {
        try {
            const token = request.headers.authorization.split(" ")[1]
            jwt.verify(token, `${process.env.JWT_ACCESS_KEY}`, async (error: any, user: any) => {
                console.log(error)
                if (error) return next(new CustomResponse(response).error("Invalid bearer token", 403))
                const userExists = await userModel.findById(user._id).exec()
                if (userExists) {
                    request.user = user
                    next()
                }
                else {
                    return next(new CustomResponse(response).error('Please sign up', 401))
                }
            })
        }
        catch (err: any) {
            return next(new CustomResponse(response).error(err.message, 500))
        }
    }
    else {
        return next(new CustomResponse(response).error('Your are not authenticated', 401))
    }
}