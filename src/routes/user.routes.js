import { Router } from "express";
import {loginUser, logOut, register ,generateAccessRefreshToken} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
   upload.fields([
    {
        name:"avatar",
        maxCount:1
    },{
        name:"coverImage",
        maxCount:1
    }
   ]),
    register
)

router.route("/login").post(loginUser);

//secured routes

router.route("/logout").post( verifyJWT ,logOut)
router.route("/refresh-token").post( generateAccessRefreshToken);

export default router;