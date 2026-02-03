import { Router, Request, Response, NextFunction } from "express";
import { getRecommendations } from "../services/recommendationsService";

const router = Router();

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    const recommendations = getRecommendations();
    res.json(recommendations);
  } catch (error) {
    next(error);
  }
});

export default router;
