import {User} from "../models/userModel.js"
import getDataUrl from "../utils/urlGenerator.js"
import bcrypt from "bcrypt"
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

    const user = User.findOne({email})
    if (user) {
      res.status(400).json({
        message: "User already exist",
      })
    }

    const fileUrl = getDataUrl(file)

    //
    const hashPassword = await bcrypt.hash(password, 10)
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}
