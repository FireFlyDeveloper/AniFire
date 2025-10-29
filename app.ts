import express from "express";
import router from "./src/routers/index";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

try {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
} catch (error) {
  console.error("Error starting server:", error);
}

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/api", router);
