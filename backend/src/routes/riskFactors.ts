import { Router, Request, Response, NextFunction } from "express";
import { getRiskFactors } from "../services/riskFactorsService";

const router = Router();

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    const riskFactors = getRiskFactors();
    res.json(riskFactors);
  } catch (error) {
    next(error);
  }
});

export default router;
