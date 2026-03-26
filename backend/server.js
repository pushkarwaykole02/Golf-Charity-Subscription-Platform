import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import { errorHandler, notFoundHandler } from "./utils/errors.js";
import { authRequired } from "./middlewares/authRequired.js";

import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import scoreRoutes from "./routes/scores.routes.js";
import charityRoutes from "./routes/charities.routes.js";
import drawRoutes from "./routes/draws.routes.js";
import winnerRoutes from "./routes/winners.routes.js";
import adminRoutes from "./routes/admin.routes.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") ?? "*" }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/profile", authRequired, profileRoutes);
app.use("/api/subscriptions", authRequired, subscriptionRoutes);
app.use("/api/scores", authRequired, scoreRoutes);
app.use("/api/charities", authRequired, charityRoutes);
app.use("/api/draws", authRequired, drawRoutes);
app.use("/api/winners", authRequired, winnerRoutes);
app.use("/api/admin", authRequired, adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${port}`);
});

