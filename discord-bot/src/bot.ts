import dotenv from 'dotenv';
import { Client, Intents, Message, Role, TextChannel } from "discord.js";
import axios from 'axios';
import express from 'express';
import cors from 'cors';

dotenv.config();

const TOKEN = process.env.BOT_TOKEN;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const SNAP_SHOT_ID = process.env.SNAP_SHOT_ID;
const API_URL_SNAP_HODL = process.env.API_URL_SNAP_HODL;
const DISCORD_REDIRECT_URL = process.env.DISCORD_REDIRECT_URL;
const PORT = process.env.PORT;
const DISCORD_SERVER_GUILD_ID = process.env.DISCORD_SERVER_GUILD_ID;
const DISCORD_SERVER_GUILD_CHANNEL_ID = process.env.DISCORD_SERVER_GUILD_CHANNEL_ID;

console.log("Bot is starting...");

const bot = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES]
});

const app = express();

app.use(cors());
app.use(express.json());

app.post('/authenticate', async (req, res) => {
    const { code, userAddress } = req.body;

    try {
        // Use the code to get a Discord access token
        // const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', {
        //     client_id: CLIENT_ID,
        //     client_secret: CLIENT_SECRET,
        //     grant_type: 'authorization_code',
        //     code: code,
        //     redirect_uri: DISCORD_REDIRECT_URL,
        //     scope: 'identify'
        // });

        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: CLIENT_ID!,
            client_secret: CLIENT_SECRET!,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: DISCORD_REDIRECT_URL!,
            scope: 'identify'
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });


        const discordToken = tokenResponse.data.access_token;

        // Use the access token to get the user's Discord info
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: {
                authorization: `Bearer ${discordToken}`
            }
        });

        const discordUserId = userResponse.data.id;
        const user = await bot.users.fetch(discordUserId);
        if (!user) {
            throw new Error(`Discord user not found: ${discordUserId}`);
        }

        const guild = bot.guilds.cache.get(DISCORD_SERVER_GUILD_ID!);
        const member = guild?.members.cache.get(user.id);
        const role = guild?.roles.cache.find(role => role.name === "FRM Holder");
        // console.log(`Role: `, role);

        const channelId = DISCORD_SERVER_GUILD_CHANNEL_ID!;
        const channel = guild?.channels.cache.get(channelId) as TextChannel;

        // TODO: Continue with your existing logic
        try {
            const response = await axios.get(`${API_URL_SNAP_HODL}/getSnapShotBySnapShotIdAndAddress/${SNAP_SHOT_ID}/${userAddress}`);
            const snapShotBalance = parseFloat(response.data.snapShotBalance);
            console.log(`Snapshot balance: ${snapShotBalance}`); // New line

            if (snapShotBalance > 0) {
                if (role && member) {
                    await member.roles.add(role);
                    await channel.send(`${user} has been assigned the ${role.name}`);
                } else {
                    await channel.send(`Error: User ${user} not found or role "FRM Holder" not found.`);
                }
            } else {
                await channel.send(`User ${user} snapshot balance is zero.`);
            }

        } catch (error) {
            console.error('Error getting snapshot balance:', error);
            await channel.send(`Error occurred while verifying user ${user}'s wallet.`);
        }
    } catch (error) {
        console.error('Error verifying user:', error);
        res.status(500).json({ message: 'Error verifying user' });
    }
});

app.listen(PORT, () => console.log(`Bot server listening on port ${PORT}`));

bot.login(TOKEN);

bot.once('ready', () => {
    console.log(`Logged in as ${bot.user?.tag}!`);
});

// bot.on('messageCreate', async (msg) => {
//     console.log(`Received message: ${msg.content}`); // New line
//     if (msg.content.startsWith('!verify')) {
//         const args = msg.content.split(' ');
//         const userAddress = args[1]; // Assumes user address is second argument
//         console.log(`User address: ${userAddress}`); // New line

//         if (!userAddress) {
//             msg.reply('Please provide your wallet address.');
//             return;
//         }

//         try {
//             const response = await axios.get(`${API_URL_SNAP_HODL}/getSnapShotBySnapShotIdAndAddress/${SNAP_SHOT_ID}/${userAddress}`);
//             const snapShotBalance = parseFloat(response.data.snapShotBalance);
//             console.log(`Snapshot balance: ${snapShotBalance}`); // New line

//             if (snapShotBalance > 0) {
//                 const role = msg.guild?.roles.cache.find(role => role.name === "FRM Holder");
//                 if (role) {
//                     await msg.member?.roles.add(role);
//                     msg.reply('You have been assigned the FRM Holder role.');
//                 } else {
//                     msg.reply('FRM Holder role not found.');
//                 }
//             } else {
//                 msg.reply('Your snapshot balance is zero.');
//             }

//         } catch (error) {
//             console.error('Error getting snapshot balance:', error);
//             msg.reply('An error occurred while verifying your wallet.');
//         }
//     }
// });
