import { Router } from "express";
import summaryRouter from "./summary";
import driversRouter from "./drivers";
import riskFactorsRouter from "./riskFactors";
import recommendationsRouter from "./recommendations";

const router = Router();

router.use("/summary", summaryRouter);
router.use("/drivers", driversRouter);
router.use("/risk-factors", riskFactorsRouter);
router.use("/recommendations", recommendationsRouter);

export default router;
