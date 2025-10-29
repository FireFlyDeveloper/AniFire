import express from "express";
import AnilistRoute from "./anilist.route";

const router = express.Router();

router.use("/anilist", AnilistRoute);

export default router;
