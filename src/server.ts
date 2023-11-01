import Koa from "koa";
import KoaRouter from "koa-router";
import osu from "node-os-utils";
import { getInviteURL } from "./modules/utils/functions";
import logger from "./modules/utils/logger";

const controller = new AbortController();
const server = new Koa({});
const router = new KoaRouter();

server.on("listening", () => {
  logger.info("HTTP server is running");
});

server.use(async (ctx, next) => {
  logger.info(`HTTP ${ctx.request.method} ${ctx.request.url}`);
  await next();
});

router.get("root", "/", async (ctx) => {
  const metrics = {
    uptime: osu.os.uptime(),
    cpu: await osu.cpu.usage(),
    network: await osu.netstat.inOut(),
    processes: await osu.proc.totalProcesses(),
    memory: await osu.mem.info(),
    // @ts-ignore
    drive: await osu.drive.info(),
  };

  ctx.body = metrics;
});

router.get("invite", "/invite", (ctx) => {
  const url = getInviteURL();
  ctx.redirect(url);
});

server.use(router.routes()).use(router.allowedMethods());
server.listen({ port: Number(process.env.PORT), signal: controller.signal });

process.on("SIGTERM", () => {
  logger.info("Shutting down HTTP server");
  controller.abort();
  process.exit(0);
});

export default server;
