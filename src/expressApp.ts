import express from "express";
import userRouter from "./api/auth.route";
import cookieParser from "cookie-parser";
import { httpLogger, HandleErrorWithLogger } from "./utils";
import { Request, Response, NextFunction } from "express";
interface ErrorHandler {
  (err: Error, req: Request, res: Response, next: NextFunction): void;
}
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(httpLogger);
app.use("/", userRouter);

const errorHandler: ErrorHandler = (err, req, res, next) =>
  HandleErrorWithLogger(err, req, res, next);
app.use(errorHandler);

export default app;
