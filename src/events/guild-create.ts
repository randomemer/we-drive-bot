import knex from "@/modules/db";

const config: ListenerConfig<"guildCreate"> = {
  name: "guildCreate",
  async listener(guild) {
    try {
      // knex.select("*").from("servers");
    } catch (error) {
      console.error(error);
    }
  },
};

export default config;
