import express from "express"
import dotenv from "dotenv"
import {connectDb} from "./database/db.js"
import cookieParser from "cookie-parser"

import cloudinary from "cloudinary"

dotenv.config({path: "../.env"})

cloudinary.v2.config({
  cloud_name: process.env.Cloudinary_Cloud_Name,
  api_key: process.env.Cloudinary_Api,
  api_secret: process.env.Cloudinary_Secret,
})

const app = express()
app.use(express.json())
app.use(express.urlencoded())
app.use(cookieParser())

app.get("/", (req, res) => {
  res.send("hiiiiiii")
})

// importing routes
import userRoutes from "./routes/userRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import postRoutes from "./routes/postRoutes.js"

//using routes
app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)
app.use("/api/post", postRoutes)
//
const port = process.env.PORT
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
  connectDb()
})
