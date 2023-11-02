import ServerModel from "@/modules/db/models/server";
import UserModel from "@/modules/db/models/user";
import { inlineCode } from "discord.js";
import { AppError } from "./errors";

export const serverMiddleware: MiddlewareFunc = async function (
  interaction,
  ctx,
  next
) {
  const server = await ServerModel.query().findById(interaction.guildId!);

  if (!server?.mc_server) {
    throw new AppError(
      "Missing Configuration",
      "There is no minecraft server configured in settings"
    );
  }

  ctx.set("server", server);
  next();
};

export const playerMiddleware: MiddlewareFunc = async function (
  interaction,
  ctx,
  next
) {
  const player = await UserModel.query().findById(interaction.user.id);
  if (!player)
    throw new AppError(
      `Profile Not Found`,
      `Are you sure you created your profile with ${inlineCode(
        "/player create"
      )} command?`
    );

  ctx.set("player", player);

  next();
};
