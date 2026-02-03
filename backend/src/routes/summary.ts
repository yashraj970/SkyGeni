import { Router, Request, Response, NextFunction } from "express";
import { getSummary } from "../services/summaryService";

const router = Router();

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = getSummary();
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

export default router;
