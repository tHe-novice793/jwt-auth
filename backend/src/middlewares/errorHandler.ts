import type { ErrorRequestHandler, Response } from "express";
import { BAD_REQUEST, INTERNAL_SEVER_ERROR } from "../constants/http.js";
import z, { ZodError } from "zod";

const handleZodError = (res: Response, error: z.ZodError) => {
    const errors = error.issues.map((err) => ({
        path: err.path.join("."),
        message: err.message,
    }))

    return res.status(BAD_REQUEST).json({
        message: error.issues[0]?.message || "Validation Failed",
        errors,
    })
}

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  console.log(`PATH: ${req.path}`, error);

  if(error instanceof z.ZodError){
    return handleZodError(res, error)
  }

  return res.status(INTERNAL_SEVER_ERROR).send("Internal Server Error");
};
