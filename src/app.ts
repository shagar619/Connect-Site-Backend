import express, { Request, Response } from "express";

import cors from "cors";
import { router } from "./app/routes";

import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1);

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://pro-connect-frontend.vercel.app",
    ],
    credentials: true,
  })
);


app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "✨ Welcome to ProConnect  Backend API! 🚀",
  });
});

app.use(globalErrorHandler);

app.use(notFound);

export default app;
