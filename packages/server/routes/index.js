import { Router } from "express";
import audioRouter from "./audio.js";
// import queryRouter from "./query.js";

const router = Router();

router.use(audioRouter);
// router.use(queryRouter);

export default router;