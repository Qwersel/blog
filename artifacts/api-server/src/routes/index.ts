import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authorsRouter from "./authors";
import articlesRouter from "./articles";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authorsRouter);
router.use(articlesRouter);

export default router;
