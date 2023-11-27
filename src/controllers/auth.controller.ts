import express, { NextFunction } from 'express'
import { passwordCompare, passwordHash } from '../utils/bcrypt'
import userModel from '../models/user.model'
import CustomException from '../utils/error.handler'
import CustomResponse from '../utils/response.handler'
import { jwtSign } from '../utils/auth.util'


/**
 * @description Sign up to the platform
 * @api {POST} /api/v1/auth/sign-up 
 * @access public
 */
export async function SignUp(
    request: express.Request,
    response: express.Response,
    next: NextFunction
) {
    const { fullName, email, password } = request.body
    const hashedPassword = await passwordHash(password)

    const userExists = await userModel.findOne({ email }).exec()
    if (userExists) {
        return next(new CustomResponse(response).error(
            'You cannot use this email to register again',
            400
        ))
    }
    const newUser = new userModel({
        fullName: fullName,
        email: email,
        password: hashedPassword
    })
    await newUser.save()
    return next(new CustomResponse(response).success(
        'Welcome Onboard!',
        newUser,
        201,
        {
            type: 'success',
            action: 'sign-up'
        }
    ))
}

/**
 * @description Log in to the platform
 * @api {POST} /api/v1/auth/sign-in
 * @access Public
 */
export async function LogIn(
    request: express.Request,
    response: express.Response,
    next: NextFunction
) {
    const { email, password } = request.body
    const user = await userModel.findOne({ email }).exec()
    if (!user) {
        return next(new CustomResponse(response).error('Email does not exist', 404))
    }
    const verifyPassword = await passwordCompare(password, user.password)
    if (!verifyPassword) {
        return next(new CustomResponse(response).error('Password is incorrect', 401))
    }

    const payload = {
        _id: user._id,
        fullname: user.fullName,
        email: user.email
    }
    const token = await jwtSign(payload)
    return next(new CustomResponse(response).success(
        'Welcome Back!',
        { user, token },
        200,
        {
            type: 'success',
            action: 'login'
        }
    ))
}