import { GuildModel, UserModel } from "@/modules/db";
import { inlineCode } from "discord.js";
import { AppError } from "./errors";
import { GuildModelJoined } from "../db/models/guild";

export const guildMiddleware: MiddlewareFunc = async function (
  interaction,
  ctx,
  next
) {
  const guildModel = (await GuildModel.query()
    .findById(interaction.guildId!)
    .withGraphJoined("minecraft_server")) as GuildModelJoined;

  if (!guildModel?.minecraft_server) {
    throw new AppError(
      "Missing Configuration",
      "There is no minecraft server configured in settings"
    );
  }

  ctx.set("guild", guildModel);
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
