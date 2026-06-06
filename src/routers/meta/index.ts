import { Hono } from "hono";
import AnilistRoute from "./anilist.route";

const router = new Hono();

router.route("/anilist", AnilistRoute);

export default router;
