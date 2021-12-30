const mongoose = require("mongoose");
require("dotenv").config();

// const mongoURI =
// 	process.env.DB_URL_REMOTE ||
// 	process.env.DB_URL_LOCAL ||
// 	`mongodb://localhost/kalamDB`;
const mongoURI =
  "mongodb+srv://Gaurav:Gauravgoyal@1@kalam-dev-env.bswxg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

mongoose.connect(
  mongoURI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => {
    console.log("DB Connected");
  }
);

const blogSchema = new mongoose.Schema({
  imgUrl: {
    type: String,
    required: true,
  },
  blogTitle: {
    type: String,
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: {
      authorName: {
        type: String,
        required: true,
      },
      authorEmail: {
        type: String,
        required: true,
      },
      authorId: {
        type: String,
        required: true,
      },
    },
  },
  likes: {
    type: [String],
    default: [],
  },
  comments: {
    type: [{}],
    default: [],
  },
  views: {
    type: Number,
    default: 0,
  },
  tags: {
    type: [String],
    required: true,
  },
});

module.exports = mongoose.model("blogDB", blogSchema);
