import express from 'express'
import { forgotPassword, resetPassword, signin, signup } from '../controllers/authController'
const authRouter=express.Router()
authRouter.post('/signin',signin)
authRouter.post('/signup',signup)
authRouter.post('/forgot-password',forgotPassword)
authRouter.post('/reset-password/:token',resetPassword)
export default authRouter