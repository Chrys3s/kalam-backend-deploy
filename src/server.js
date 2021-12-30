const express = require("express");
const blogRoute = require("./routes/blogs");
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT || 1104;
const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "UPDATE", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use("/v1/blogs/", blogRoute);

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
