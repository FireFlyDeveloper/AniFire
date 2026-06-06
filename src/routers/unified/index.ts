import { Hono } from "hono";
import UnifiedMediaController from "../../controllers/UnifiedMediaController";

const router = new Hono();
const controller = new UnifiedMediaController();

router.get("/types", controller.getAvailableTypes.bind(controller));
router.get("/search", controller.search.bind(controller));
router.get("/info", controller.getInfo.bind(controller));

export default router;
