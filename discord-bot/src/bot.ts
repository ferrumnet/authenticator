import dotenv from 'dotenv';
import { Client, Intents, Message, Role } from "discord.js";
import axios from 'axios';

dotenv.config();

const TOKEN = process.env.BOT_TOKEN; // add your token here

console.log("Bot is starting...");

const bot = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES]
});

const SNAP_SHOT_ID = process.env.SNAP_SHOT_ID;
const API_URL = process.env.API_URL;

bot.login(TOKEN);

bot.once('ready', () => {
  console.log(`Logged in as ${bot.user?.tag}!`);
});

bot.on('messageCreate', async (msg) => {
    console.log(`Received message: ${msg.content}`); // New line
    if (msg.content.startsWith('!verify')) {
      const args = msg.content.split(' ');
      const userAddress = args[1]; // Assumes user address is second argument
      console.log(`User address: ${userAddress}`); // New line
  
      if (!userAddress) {
        msg.reply('Please provide your wallet address.');
        return;
      }
  
      try {
        const response = await axios.get(`${API_URL}/getSnapShotBySnapShotIdAndAddress/${SNAP_SHOT_ID}/${userAddress}`);
        const snapShotBalance = parseFloat(response.data.snapShotBalance);
        console.log(`Snapshot balance: ${snapShotBalance}`); // New line
  
        if (snapShotBalance > 0) {
          const role = msg.guild?.roles.cache.find(role => role.name === "FRM Holder");
          if (role) {
            await msg.member?.roles.add(role);
            msg.reply('You have been assigned the FRM Holder role.');
          } else {
            msg.reply('FRM Holder role not found.');
          }
        } else {
          msg.reply('Your snapshot balance is zero.');
        }
  
      } catch (error) {
        console.error('Error getting snapshot balance:', error);
        msg.reply('An error occurred while verifying your wallet.');
      }
    }
  });
  