import { Hono } from "hono";
import AnilistRoute from "./meta/index";
import TopmanhuaRoute from "./topmanhua/index";
import UnifiedRoute from "./unified/index";

const router = new Hono();

router.route("/meta", AnilistRoute);
router.route("/topmanhua", TopmanhuaRoute);
router.route("/unified", UnifiedRoute);

export default router;
