// commands.js
import { SlashCommandBuilder } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import dotenv from "dotenv";
dotenv.config();

const commands = [
    new SlashCommandBuilder()
        .setName("register")
        .setDescription("S'inscrire au tournoi")
        .addStringOption(option =>
            option.setName("pseudo")
                .setDescription("Ton pseudo Minecraft")
                .setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName("unregister")
        .setDescription("Se désinscrire du tournoi")
].map(cmd => cmd.toJSON());

export async function registerSlashCommands() {
    const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
    try {
        console.log("⏳ Enregistrement des commandes...");
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );
        console.log("✅ Commandes enregistrées !");
    } catch (err) {
        console.error("Erreur enregistrement commandes:", err);
    }
}

export async function handleInteractions(interaction, client) {
    const announceChannel = client.channels.cache.get(process.env.ANNOUNCE_CHANNEL_ID);

    if (!interaction.isCommand()) return;

    const { commandName, options, user } = interaction;

    if (commandName === "register") {
        const pseudo = options.getString("pseudo");
        await interaction.reply({ content: `✅ ${pseudo} est inscrit !`, ephemeral: true });
        if (announceChannel) {
            announceChannel.send(`Nouvelle inscription : ${user.tag} -> ${pseudo}`);
        }
    }

    if (commandName === "unregister") {
        await interaction.reply({ content: `❌ ${user.tag} est désinscrit.`, ephemeral: true });
        if (announceChannel) {
            announceChannel.send(`Désinscription : ${user.tag}`);
        }
    }
}
