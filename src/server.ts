import logger from "./modules/utils/logger";
import Koa from "koa";
import KoaRouter from "koa-router";
import { getInviteURL } from "./modules/utils/functions";
import osu from "node-os-utils";

const server = new Koa();
const router = new KoaRouter();

server.on("ready", () => {
  logger.info("HTTP server is running");
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
server.listen(80);

export default server;
