import { Hono } from "hono";
import TopmanhuaController from "../../controllers/TopmanhuaController";

const router = new Hono();
const controller = new TopmanhuaController();

router.get("/search", controller.search.bind(controller));

export default router;
