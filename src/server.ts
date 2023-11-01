import http from "http";
import logger from "./modules/utils/logger";

const server = http.createServer();

server.on("request", (req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("Server Online");
});

server.on("listening", () => {
  logger.info("HTTP server is running");
});

server.listen(80);

export default server;
