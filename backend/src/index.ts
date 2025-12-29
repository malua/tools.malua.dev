import { router } from "@backend/router";
import { factory } from "@backend/lib/utils/factory";
import { errorMiddleware } from "@backend/services/error";
import { dbMiddleware } from "@backend/services/db";
import { authenticationMiddleware } from "@backend/services/auth/authentication-middleware";
import { authorizationMiddleware } from "@backend/services/auth/authorization-middleware";
import { cors } from "hono/cors";
import { env } from "hono/adapter";

const app = factory
  .createApp()
  .use(dbMiddleware)
  // CORS for development (when FRONTEND_URL is set)
  .use("/api/*", (c, next) => {
    const { FRONTEND_URL } = env<{ FRONTEND_URL?: string }>(c);
    if (FRONTEND_URL) {
      return cors({
        origin: FRONTEND_URL,
        credentials: true,
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      })(c, next);
    }
    return next();
  })
  .use(authenticationMiddleware)
  .use(authorizationMiddleware)
  .route("/api", router)
  .onError(errorMiddleware);

export default app;

export type AppType = typeof app;
