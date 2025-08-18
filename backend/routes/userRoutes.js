import express from "express"
import {isAuth} from "../middleware/isAuth.js"
import {myProfile, userProfile} from "../controller/userController.js"

const router = express.Router()

router.get("/me", isAuth, myProfile)
router.get("/:id", isAuth, userProfile)

export default router
