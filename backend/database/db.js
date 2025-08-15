import mongoose from "mongoose"

export const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      dbName: "SocailMedia",
    })
    console.log("Connected to db")
  } catch (error) {
    console.log(error)
  }
}
