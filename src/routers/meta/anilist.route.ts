import express from "express";
import AnilistController from "../../controllers/meta/AnilistController";

const router = express.Router();
const controller = new AnilistController();

router.get("/home", controller.getHomeFeed.bind(controller));

export default router;
