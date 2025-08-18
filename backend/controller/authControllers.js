import {User} from "../models/userModel.js"
import generateToken from "../utils/generateToken.js"
import TryCatch from "../utils/tryCatch.js"
import getDataUrl from "../utils/urlGenerator.js"
import bcrypt from "bcrypt"
import cloudinary from "cloudinary"

//
export const registerUser = async (req, res) => {
  try {
    const {name, email, password, gender} = req.body
    const file = req.file

    //

    if (!name || !email || !password || !gender || !file) {
      return res.status(400).json({
        message: "Please give all the values ",
      })
    }

    let user = await User.findOne({email})
    if (user) {
      res.status(400).json({
        message: "User already exist",
      })
    }

    const fileUrl = getDataUrl(file)

    //
    const hashPassword = await bcrypt.hash(password, 10)

    //

    const myCloud = await cloudinary.v2.uploader.upload(fileUrl.content)
    console.log(myCloud)

    //
    user = await User.create({
      name,
      email,
      password: hashPassword,
      gender,
      profilePic: {
        id: myCloud.public_id,
        url: myCloud.secure_url,
      },
    })

    //
    generateToken(user._id, res)

    res.status(201).json({
      message: "User Registered Sucessfully",
      user,
    })
    //
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}

export const loginUser = TryCatch(async (req, res) => {
  const {email, password} = req.body

  const user = await User.findOne({email})

  if (!user) {
    return res.status(400).json({
      message: "Invalid Credential",
    })
  }

  //

  const comparePassword = await bcrypt.compare(password, user.password)
  if (!comparePassword) {
    return res.status(400).json({
      message: "Invalid Credential",
    })
  }

  generateToken(user._id, res)

  res.json({
    message: "User Logged In",
    user,
  })
})

export const logoutUser = TryCatch((req, res) => {
  res.cookie = ("Token", "", {maxAge: 0})
  res.json({
    message: "Logged Out Successfully",
  })
})
