const { SlashCommandBuilder } = require('discord.js');

module.exports = [
    new SlashCommandBuilder()
        .setName('register')
        .setDescription('S\'inscrire au tournoi')
        .addStringOption(option =>
            option.setName('minecraft')
                .setDescription('Ton pseudo Minecraft')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('unregister')
        .setDescription('Se désinscrire du tournoi'),

    new SlashCommandBuilder()
        .setName('export')
        .setDescription('Exporter la liste des participants')
].map(command => command.toJSON());
