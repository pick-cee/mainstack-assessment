import express, { Router } from "express";
import { LogIn, SignUp } from "../controllers/auth.controller";

const router: Router = express.Router();

router.post('/sign-up', SignUp)
router.post('/sign-in', LogIn)

export default router