import { Router } from "express";
import transcriptionRouter from "./audio.js";
import audioGenerationRouter from "./audioGeneration.js"
// import queryRouter from "./query.js";

const router = Router();

router.use(transcriptionRouter);
router.use(audioGenerationRouter)
// router.use(queryRouter);

export default router;