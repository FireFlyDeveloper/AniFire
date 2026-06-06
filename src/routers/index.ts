import { Hono } from "hono";
import AnilistRoute from "./meta/index";
import TopmanhuaRoute from "./topmanhua/index";

const router = new Hono();

router.route("/meta", AnilistRoute);
router.route("/topmanhua", TopmanhuaRoute);

export default router;
