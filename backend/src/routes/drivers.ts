import { Router, Request, Response, NextFunction } from "express";
import { getDrivers } from "../services/driversService";

const router = Router();

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    const drivers = getDrivers();
    res.json(drivers);
  } catch (error) {
    next(error);
  }
});

export default router;
