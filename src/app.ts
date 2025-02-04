import express from "express";
import dotenv from "dotenv";
import connectMongoDB from "./config/db.config";
import userRouter from "./routers/user/user.router";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const db = connectMongoDB;
db();
app.listen(port, (err) => {
  if (err) {
    console.log("Something went wrong with the server");
  } else {
    console.log(`Server is running on http://localhost:${port}`);
  }
});
