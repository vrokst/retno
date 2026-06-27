import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import generateRouter from "./generate";
import transcriptRouter from "./transcript";
import historyRouter from "./history";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(generateRouter);
router.use(transcriptRouter);
router.use(historyRouter);

export default router;
