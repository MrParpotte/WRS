require('dotenv').config(); // Charger le .env
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const fetch = require('node-fetch');
const fs = require('fs');
const commands = require('./commands');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const token = process.env.TOKEN;
const guildId = process.env.GUILD_ID;
const clientId = process.env.CLIENT_ID;
const dbFile = './players.json';

let db = {};
if (fs.existsSync(dbFile)) {
    db = JSON.parse(fs.readFileSync(dbFile));
}

// Déployer les commandes
const rest = new REST({ version: '10' }).setToken(token);
(async () => {
    await rest.put(Routes.applicationGuildCommands(client.user?.id || clientId, guildId), { body: commands });
})();

client.on('ready', () => console.log(`${client.user.tag} est connecté !`));

async function getMinecraftUUID(username) {
    try {
        const res = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.id;
    } catch {
        return null;
    }
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, options, user, channel } = interaction;

    if (commandName === 'register') {
        // Vérifier si l'utilisateur est déjà inscrit
        if (db[user.id]) {
            return interaction.reply({ content: 'Tu es déjà inscrit au tournoi !', ephemeral: true });
        }

        const mcName = options.getString('minecraft');
        const uuid = await getMinecraftUUID(mcName);
        if (!uuid) return interaction.reply({ content: 'Pseudo Minecraft invalide !', ephemeral: true });

        const tournamentChannel = client.channels.cache.get(process.env.TOURNAMENT_CHANNEL_ID);
        if (!tournamentChannel) return interaction.reply({ content: 'Salon tournoi introuvable !', ephemeral: true });

        const msg = await tournamentChannel.send(`**Nouveau participant :**\nDiscord: ${user.tag}\nMinecraft: ${mcName}\nUUID: ${uuid}`);


        db[user.id] = {
            discordTag: user.tag,
            minecraft: mcName,
            uuid: uuid,
            messageId: msg.id
        };
        fs.writeFileSync(dbFile, JSON.stringify(db, null, 4));
        interaction.reply({ content: 'Inscription réussie !', ephemeral: true });
    }
    else if (commandName === 'unregister') {
        if (!db[user.id]) return interaction.reply({ content: 'Tu n\'es pas inscrit !', ephemeral: true });

        try {
            const msg = await channel.messages.fetch(db[user.id].messageId);
            msg.delete();
        } catch { }

        delete db[user.id];
        fs.writeFileSync(dbFile, JSON.stringify(db, null, 4));
        interaction.reply({ content: 'Désinscription réussie !', ephemeral: true });

    } else if (commandName === 'export') {
        const buffer = Buffer.from(JSON.stringify(db, null, 4));
        await interaction.reply({ files: [{ attachment: buffer, name: 'participants.json' }] });
    }
});

client.login(token);
