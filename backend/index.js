import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB from "./src/connectDB.js";

dotenv.config({
  path: "/.env",
});

connectDB()
  .then(() => {
    app.get("/", (req, res) => {
      res.send(
        `<h1>Server is running at http://localhost:${process.env.PORT}</h1>`
      );
    });

    app.listen(process.env.PORT || 7000, () => {
      console.log(
        `⚙️ Server is running at http://localhost:${process.env.PORT} : ${
          process.env.PORT || 7000
        }`
      );
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });
