import express from "express";
// import catalogRouter from "./api/catalog.route";
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
// app.use("/", catalogRouter);
app.use("/", (req: Request, res: Response, _: NextFunction) => {
  res.status(200).json({ message: "Auth Service" });
});

const errorHandler: ErrorHandler = (err, req, res, next) =>
  HandleErrorWithLogger(err, req, res, next);
app.use(errorHandler);

export default app;
