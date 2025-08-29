import {Post} from "../models/postModel.js"
import TryCatch from "../utils/tryCatch.js"
import getDataUrl from "../utils/urlGenerator.js"
import cloudinary from "cloudinary"

export const newPost = TryCatch(async (req, res) => {
  const {caption} = req.body

  const ownerId = req.user._id

  const file = req.file

  const fileUrl = getDataUrl(file)

  let option

  const type = req.query.type

  if (type === "reel") {
    option = {
      resource_type: "video",
    }
  } else {
    option = {}
  }

  const myCloud = await cloudinary.v2.uploader.upload(fileUrl.content, option)

  const post = await Post.create({
    caption,
    post: {
      id: (await myCloud).public_id,
      url: (await myCloud).secure_url,
    },
    owner: ownerId,
    type,
  })

  res.status(201).json({
    message: "Post created",
    post,
  })
})

export const deletePost = TryCatch(async (req, res) => {
  const post = await Post.findById(req.params.id)

  if (!post) {
    return res.status(404).json({
      message: "No post with this id",
    })
  }

  if (post.owner.toString() !== req.user._id.toString())
    return res.status(403).josn({
      message: "Unauthorized",
    })

  await cloudinary.v2.uploader.destroy(post.post.id)

  await post.deleteOne()

  res.json({
    message: "Post deleted",
  })
})

export const getAllPost = TryCatch(async (req, res) => {
  const posts = await Post.find({type: "post"})
    .sort({createdAt: -1})
    .populate("owner", "-password")

  const reels = await Post.find({type: "reel"})
    .sort({createdAt: -1})
    .populate("owner", "-password")

  res.json({posts, reels})
})

export const likeUnlikePost = TryCatch(async (req, res) => {
  const post = await Post.findById(req.params.id)

  if (!post) {
    return res.status(404).json({
      message: "No post with this id",
    })
  }

  if (post.likes.includes(req.user._id)) {
    const index = post.likes.indexOf(req.user._id)
    post.likes.splice(index, 1)

    await post.save()

    res.json({
      message: "Post Unliked",
    })
  } else {
    post.likes.push(req.user._id)
    res.json({
      message: "Post Liked",
    })

    await post.save()
  }
})

export const commentOnPost = TryCatch(async (req, res) => {
  const post = await Post.findById(req.params.id)

  if (!post) {
    return res.status(404).json({
      message: "No post with this id",
    })
  }

  // post.comments.comment = req.body.comment

  post.comments.push({
    user: req.user._id,
    name: req.user.name,
    comment: req.body.comment,
  })

  await post.save()

  res.json({
    message: "comment added",
  })
})

export const deleteComment = TryCatch(async (req, res) => {
  const post = await Post.findById(req.params.id)

  if (!post) {
    return res.status(404).json({
      message: "No post with this id",
    })
  }

  if (!req.body.commentId) {
    return res.status(400).json({
      message: "please give comment Id",
    })
  }

  const commentIndex = post.comments.findIndex(
    (item) => item._id.toString() === req.body.commentId
  )

  if (commentIndex === -1) {
    return res.status(400).json({
      message: "comment not found",
    })
  }

  const comment = post.comments[commentIndex]

  if (
    post.owner.toString() === req.user._id ||
    comment.user.toString() === req.user._id.toString()
  ) {
    post.comments.splice(commentIndex, 1)
    await post.save()

    return res.json({
      message: "comment deleted",
    })
  } else {
    res.status(400).json({
      message: "You are not allowed to delete comment",
    })
  }
})

export const editCaption = TryCatch(async (req, res) => {
  const post = await Post.findById(req.params.id)

  if (!post) {
    return res.status(404).json({
      message: "No post with this id",
    })
  }

  if (post.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      message: "You are not owner of this post",
    })
  }

  post.caption = req.body.caption
  await post.save()

  res.json({
    message: "Caption updated",
  })
})
