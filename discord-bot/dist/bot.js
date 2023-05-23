"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const discord_js_1 = require("discord.js");
const axios_1 = __importDefault(require("axios"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
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
const bot = new discord_js_1.Client({
    intents: [discord_js_1.Intents.FLAGS.GUILDS, discord_js_1.Intents.FLAGS.GUILD_MEMBERS, discord_js_1.Intents.FLAGS.GUILD_MESSAGES]
});
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.post('/authenticate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const tokenResponse = yield axios_1.default.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: DISCORD_REDIRECT_URL,
            scope: 'identify'
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        const discordToken = tokenResponse.data.access_token;
        // Use the access token to get the user's Discord info
        const userResponse = yield axios_1.default.get('https://discord.com/api/users/@me', {
            headers: {
                authorization: `Bearer ${discordToken}`
            }
        });
        const discordUserId = userResponse.data.id;
        const user = yield bot.users.fetch(discordUserId);
        if (!user) {
            throw new Error(`Discord user not found: ${discordUserId}`);
        }
        const guild = bot.guilds.cache.get(DISCORD_SERVER_GUILD_ID);
        const member = guild === null || guild === void 0 ? void 0 : guild.members.cache.get(user.id);
        const role = guild === null || guild === void 0 ? void 0 : guild.roles.cache.find(role => role.name === "FRM Holder");
        // console.log(`Role: `, role);
        const channelId = DISCORD_SERVER_GUILD_CHANNEL_ID;
        const channel = guild === null || guild === void 0 ? void 0 : guild.channels.cache.get(channelId);
        // TODO: Continue with your existing logic
        try {
            const response = yield axios_1.default.get(`${API_URL_SNAP_HODL}/getSnapShotBySnapShotIdAndAddress/${SNAP_SHOT_ID}/${userAddress}`);
            const snapShotBalance = parseFloat(response.data.snapShotBalance);
            console.log(`Snapshot balance: ${snapShotBalance}`); // New line
            if (snapShotBalance > 0) {
                if (role && member) {
                    yield member.roles.add(role);
                    yield channel.send(`${user} has been assigned the ${role.name}`);
                }
                else {
                    yield channel.send(`Error: User ${user} not found or role "FRM Holder" not found.`);
                }
            }
            else {
                yield channel.send(`User ${user} snapshot balance is zero.`);
            }
        }
        catch (error) {
            console.error('Error getting snapshot balance:', error);
            yield channel.send(`Error occurred while verifying user ${user}'s wallet.`);
        }
    }
    catch (error) {
        console.error('Error verifying user:', error);
        res.status(500).json({ message: 'Error verifying user' });
    }
}));
app.listen(PORT, () => console.log(`Bot server listening on port ${PORT}`));
bot.login(TOKEN);
bot.once('ready', () => {
    var _a;
    console.log(`Logged in as ${(_a = bot.user) === null || _a === void 0 ? void 0 : _a.tag}!`);
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
