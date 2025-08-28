import TryCatch from "../utils/tryCatch.js"
import {User} from "../models/userModel.js"
import getDataUrl from "../utils/urlGenerator.js"
import cloudinary from "cloudinary"
import bcrypt from "bcrypt"

// my profile

export const myProfile = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password")

  res.json(user)
})

//user profile

export const userProfile = TryCatch(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password")
  if (!user) return res.status.json({message: "No user is with id"})
  res.json(user)
})

//follow and unfollow

export const followandUnfollow = TryCatch(async (req, res) => {
  const user = await User.findById(req.params.id)

  const loggedInUser = await User.findById(req.user._id)

  if (!user) return res.status(404).json({message: "No user is with id"})

  if (user._id.toString() === loggedInUser._id.toString())
    return res.status(400).json({message: "You cant follow yourself"})

  if (user.followers.includes(loggedInUser._id)) {
    const indexFollowing = loggedInUser.following.indexOf(user._id)
    const indexfollower = user.followers.indexOf(loggedInUser._id)

    loggedInUser.following.splice(indexFollowing, 1)
    user.followers.splice(indexfollower, 1)

    await loggedInUser.save()
    await user.save()

    res.json({message: "User unfollowed"})
  } else {
    loggedInUser.following.push(user._id)
    user.followers.push(loggedInUser._id)

    await loggedInUser.save()
    await user.save()

    res.json({message: "User followed"})
  }
})

export const userFollowerandFollowingData = TryCatch(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password")
    .populate("followers", "-password")
    .populate("following", "-password")

  const followers = user.followers
  const following = user.following

  res.json({
    followers,
    following,
  })
})

export const updateProfile = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id)

  const {name} = req.body

  if (name) {
    user.name = name
  }

  const file = req.file
  if (file) {
    const fileUrl = getDataUrl(file)
    await cloudinary.v2.uploader.destroy(user.profilePic.id)
    const myCloud = cloudinary.v2.uploader.upload(fileUrl.content)

    user.profilePic.id = myCloud.public_id
    user.profilePic.url = myCloud.secure_url
  }

  await user.save()

  res.json({
    message: "Profile Updated",
  })
})

export const updatePassword = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id)

  const {oldPassword, newPassword} = req.body

  const comparePassword = await bcrypt.compare(oldPassword, user.password)

  if (!comparePassword) {
    return res.status(400).json({
      message: "Wrong old password",
    })
  }

  user.password = await bcrypt.hash(newPassword, 10)
  await user.save()

  res.json({
    message: "password Updated",
  })
})
