import express from "express";
import AnilistRoute from "./meta/index";

const router = express.Router();

router.use("/meta", AnilistRoute);

export default router;
