const { Router } = require("express");
const route = Router();
const blogDB = require("../models/db");

//Get all Blogs
route.get("/", async (req, res) => {
  try {
    const result = await blogDB.find();
    const fetchRes = {
      data: result,
      status: 200,
      message: "Data Retrieved Succefully",
      count: result.length,
    };
    return res.status(200).json(fetchRes);
  } catch (err) {
    const fetchRes = {
      data: [],
      status: 502,
      message: "Unable to Retreive data",
    };
    return res.status(502).json(fetchRes);
  }
});

//Getting blog by id, and increase it's view count
route.get("/blog/:id", async (req, res) => {
  const blogId = req.params.id;
  try {
    await blogDB.updateOne({ _id: blogId }, { $inc: { views: 1 } });
    const result = await blogDB.find({ _id: blogId });
    const fetchRes = {
      data: result,
      status: 200,
      message: "Data Retrieved Succefully",
    };
    return res.status(200).json(fetchRes);
  } catch (err) {
    const fetchRes = {
      data: [],
      status: 502,
      message: "Unable to Retreive data",
    };
    return res.status(502).json(fetchRes);
  }
});

//Adding a new post
route.post("/", async (req, res) => {
  const title = req.body.title;
  let imgUrl = req.body.imgUrl;
  const content = req.body.content;
  const tags = req.body.tags;
  const authorDetails = req.body.authorDetails;

  if (!(title && content && tags && authorDetails)) {
    return res.status(400).json({
      message: "Invalid/Incomplete blog details",
      status: "400",
    });
  }

  if (!imgUrl) {
    imgUrl = "imageUrl";
  }

  const createDoc = new blogDB({
    imgUrl: imgUrl,
    blogTitle: title,
    content: content,
    author: authorDetails,
    tags: tags,
  });

  try {
    const result = await createDoc.save();
    const fetchRes = {
      data: result,
      status: 200,
      message: "Data Retrieved Succefully",
    };
    console.log("done");
    return res.status(200).json(fetchRes);
  } catch (err) {
    const fetchRes = {
      data: [],
      status: 502,
      message: "Unable to Retreive data",
    };
    return res.status(502).json(fetchRes);
  }
});

//Like a blog or disliked if already liked
route.post("/like/blog/:id", async (req, res) => {
  const blogId = req.params.id;
  const user = req.body.userDetails;
  try {
    const result = await blogDB.find({ _id: blogId });

    if (result.length > 1) {
      return res
        .status(405)
        .json({ message: "Duplicate blog Id", status: "405" });
    }

    if (result.length < 1) {
      return res.status(404).json({ message: "No blog found", status: "404" });
    }

    if (
      result[0].author.authorEmail === user.userEmail ||
      result[0].author.authorId === user.userId
    ) {
      return res.status(405).json({
        message: "Author cannot like his/her own post.",
        status: "405",
      });
    }

    if (result[0].likes.includes(user.userId)) {
      const totalLikes = result[0].likes.length - 1;
      await blogDB.updateOne(
        { _id: blogId },
        { $pull: { likes: user.userId } }
      );
      return res
        .status(201)
        .json({ message: "Disliked post", count: totalLikes });
    } else {
      const totalLikes = result[0].likes.length + 1;
      await blogDB.updateOne(
        { _id: blogId },
        { $push: { likes: user.userId } }
      );
      return res.status(201).json({
        message: "Liked post",
        data: [totalLikes],
        status: 200,
      });
    }
  } catch (err) {
    return res.status(404).json({ message: "Blog Not Found", status: "404" });
  }
});

//posting a comment on a blog
route.post("/comment/blog/:id", async (req, res) => {
  const blogId = req.params.id;
  const commentDetails = req.body;

  try {
    let blogDetails = await blogDB.find({ _id: blogId });
    blogDetails[0].comments.push(commentDetails);
    await blogDB.updateOne(
      { _id: blogId },
      { $push: { comments: commentDetails } }
    );
    return res.status(201).json({
      message: "Comment added",
      status: "201",
      blogContent: blogDetails,
    });
  } catch (err) {
    return res.status(401).json({
      message: "Invalid blog ID",
      status: "401",
    });
  }
});

//Edit a post
route.patch("/update/blog/:id", async (req, res) => {
  const blogId = req.params.id;
  const title = req.body.blogTitle;
  const content = req.body.content;
  const tags = req.body.tags;
  const authorDetails = req.body.author;

  if (!(title && content && tags && authorDetails)) {
    return res.status(400).json({
      message: "Invalid/Incomplete blog details",
      status: "400",
    });
  }

  try {
    const blogDetails = await blogDB.find({ _id: blogId });
    if (
      authorDetails.authorEmail === blogDetails[0].author.authorEmail &&
      authorDetails.authorId === blogDetails[0].author.authorId
    ) {
      await blogDB.updateOne(
        { _id: blogId },
        {
          $set: {
            tags: tags,
            content: content,
            author: authorDetails,
            blogTitle: title,
            lastModified: new Date(),
          },
        }
      );

      return res
        .status(201)
        .json({ message: "Blog Updated", status: 201, data: [] });
    } else {
      return res.status(403).json({
        message: "Unauthorized, Blog can only be deleted by author",
        status: 403,
      });
    }
  } catch (err) {
    return res
      .status(502)
      .json({ message: "Internal server error", status: 502, data: [] });
  }
});

//Delete a post
route.delete("/delete/blog/:id", async (req, res) => {
  const blogId = req.params.id;
  const authorEmail = req.body.authorDetails.authorEmail;
  const authorId = req.body.authorDetails.authorId;

  try {
    const blogDetails = await blogDB.find({ _id: blogId });
    if (
      authorEmail === blogDetails[0].author.authorEmail &&
      authorId === blogDetails[0].author.authorId
    ) {
      await blogDB.deleteOne({ _id: blogId });
      return res.status(201).json({ message: "Blog Deleted", status: 201 });
    } else {
      return res.status(403).json({
        message: "Unauthorized, Blog can only be deleted by author",
        status: 403,
        data: [],
      });
    }
  } catch (err) {
    return res
      .status(502)
      .json({ message: "Internal server error", status: 502, data: [] });
  }
});

module.exports = route;
