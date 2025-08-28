import express from "express"
import {isAuth} from "../middleware/isAuth.js"
import {
  followandUnfollow,
  myProfile,
  updatePassword,
  updateProfile,
  userFollowerandFollowingData,
  userProfile,
} from "../controller/userController.js"
import uploadFile from "../middleware/multer.js"

const router = express.Router()

router.get("/me", isAuth, myProfile)
router.get("/:id", isAuth, userProfile)
router.put("/:id  ", isAuth, updateProfile)
router.post("/:id", isAuth, updatePassword)
router.put("/:id  ", isAuth, uploadFile, updateProfile)
router.post("/follow/:id", isAuth, followandUnfollow)
router.get("/followdata/:id", isAuth, userFollowerandFollowingData)

export default router
