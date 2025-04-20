import express from "express";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

import videoRouter from "./routes/video.route.js";
app.use("/api", videoRouter);

// import transactionRouter from "./routes/transaction.route.js";
// app.use("/api/transaction", transactionRouter);

// import budgetRouter from "./routes/budget.route.js";
// app.use("/api/budget", budgetRouter);

export default app;