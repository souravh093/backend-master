import express from "express";
import "dotenv/config";
import fileUpload from "express-fileupload";
import helmet from "helmet";
import cors from "cors";
import { limiter } from "./config/ratelimiter.js";

const app = express();

const port = process.env.PORT || 5000;

// * Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(fileUpload());
app.use(helmet());
app.use(cors());
app.use(limiter);

app.get("/", (req, res) => {
  res.json({ message: "hello server is running..." });
});

import ApiRoutes from "./routes/api.js";
app.use("/api", ApiRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
