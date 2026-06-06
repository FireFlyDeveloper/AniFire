import { Hono } from "hono";
import UnifiedMediaController from "../../controllers/UnifiedMediaController";

const router = new Hono();
const controller = new UnifiedMediaController();

router.get("/initialize", controller.initialize.bind(controller));
router.get("/stats", controller.getStats.bind(controller));
router.get("/types", controller.getAvailableTypes.bind(controller));
router.get("/search", controller.search.bind(controller));
router.get("/info", controller.getInfo.bind(controller));

export default router;
