import { Client, GatewayIntentBits } from "discord.js";
import { config } from "dotenv";
config();

import { registerSlashCommands, handleInteractions } from "./commands.js";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", async () => {
    console.log(`✅ Connecté en tant que ${client.user.tag}`);
    await registerSlashCommands();
});

client.on("interactionCreate", async (interaction) => {
    await handleInteractions(interaction, client);
});

client.login(process.env.DISCORD_TOKEN);