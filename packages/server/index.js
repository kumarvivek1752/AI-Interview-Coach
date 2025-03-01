import express from "express";
import cors from "cors";

import router from "./routes/index.js";

const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["GET"],
    credentials: true,
  })
);

app.use(router);

const PORT = 4000;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
