// commands.js (extraits)
import Discord from "discord.js";
const { SlashCommandBuilder } = Discord;

import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import dotenv from "dotenv";
import { query } from "./db.js";
dotenv.config();

const commands = [
    new SlashCommandBuilder()
        .setName("register")
        .setDescription("S'inscrire au tournoi")
        .addStringOption(o =>
            o.setName("pseudo").setDescription("Ton pseudo Minecraft").setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName("unregister")
        .setDescription("Se désinscrire du tournoi")
].map(c => c.toJSON());

export async function registerSlashCommands() {
    const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
    await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
    );
    console.log("✅ Commandes enregistrées !");
}

export async function handleInteractions(interaction, client) {
    if (!interaction.isCommand()) return;

    const announceChannel = client.channels.cache.get(process.env.ANNOUNCE_CHANNEL_ID);
    const { commandName, options, user } = interaction;

    if (commandName === "register") {
        const pseudo = options.getString("pseudo");
        const discordId = user.id;
        const discordTag = user.tag;

        // Vérif doublon
        const exists = await query("SELECT 1 FROM inscriptions WHERE discord_id = $1", [discordId]);
        if (exists.rowCount > 0) {
            await interaction.reply({ content: "❌ Vous êtes déjà inscrit !", ephemeral: true });
            return;
        }

        // Insert
        await query(
            "INSERT INTO inscriptions (discord_id, discord_tag, minecraft) VALUES ($1, $2, $3)",
            [discordId, discordTag, pseudo]
        );

        await interaction.reply({ content: `✅ ${pseudo} est inscrit !`, ephemeral: true });
        if (announceChannel) announceChannel.send(`Nouvelle inscription : ${discordTag} -> ${pseudo}`);
    }

    if (commandName === "unregister") {
        const discordId = user.id;
        const res = await query(
            "DELETE FROM inscriptions WHERE discord_id = $1 RETURNING *",
            [discordId]
        );

        if (res.rowCount === 0) {
            await interaction.reply({ content: "ℹ️ Vous n'êtes pas inscrit.", ephemeral: true });
            return;
        }

        await interaction.reply({ content: `❌ ${user.tag} est désinscrit.`, ephemeral: true });
        if (announceChannel) announceChannel.send(`Désinscription : ${user.tag}`);
    }
}
