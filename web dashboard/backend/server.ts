import type { Request, Response } from "express";
import path from "path";

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

const cloudinaryConnect = require("./db/cloudinary");
const userRoutes = require("./routes/user.routes");

cloudinaryConnect();

app.use(cors());
app.use(express.json());

const docsPath = path.join(__dirname, "prisma/docs");

app.use("/api/docs", express.static(docsPath));

app.use("/api/users", userRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.redirect("http://localhost:5173?utm_source=backend");
});

app.get(/.*/, (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: "API route not found.",
    documentation: "http://localhost:3000/api/docs",
    website: "http://localhost:5173?utm_source=backend",
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
