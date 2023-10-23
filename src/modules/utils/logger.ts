import { createWriteStream } from "fs";
import pino from "pino";
import { stdout } from "process";
import { PassThrough } from "stream";

const dest = new PassThrough();
dest.pipe(stdout);
dest.pipe(createWriteStream("/tmp/bot.log", { flags: "a" }));

const logger = pino(dest);

export default logger;
