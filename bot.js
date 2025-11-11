// Install these packages first:
// npm install axios node-telegram-bot-api dotenv

const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// ===== CONFIG =====
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN; // your bot token
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID; // group chat ID
const API_URL = 'https://d-group.stats.direct/rest/sms';
const USERNAME = 'thatspn';
const PASSWORD = 'Strategy';
const POLL_INTERVAL = 5000; // ms, every 5 seconds

let lastId = 0; // will store last seen OTP ID

// ===== TELEGRAM BOT =====
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// Notify group when bot is connected
bot.sendMessage(TELEGRAM_CHAT_ID, '✅ Bot Connected and Running!');

// ===== API AUTH =====
const authHash = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

// ===== FETCH OTP FUNCTION =====
async function fetchLatestOTPs() {
  try {
    let url = `${API_URL}?per-page=100`;
    if (lastId) url += `&id=${lastId}`;

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Basic ${authHash}`,
        'x-current-page': '1',
        'x-page-count': '1',
        'x-per-page': '100',
        'x-total-count': '1000'
      }
    });

    const messages = response.data; // assuming API returns array of messages

    if (messages && messages.length > 0) {
      // Sort by ID ascending so we send oldest first
      messages.sort((a, b) => a.id - b.id);

      for (const msg of messages) {
        const text = `🟢New OTP Received!\n(${msg.sender})\n${msg.sms}`;
        bot.sendMessage(TELEGRAM_CHAT_ID, text);
        lastId = msg.id; // update lastId
      }
    }
  } catch (err) {
    console.error('Error fetching OTPs:', err.message);
  }
}

// ===== START POLLING =====
setInterval(fetchLatestOTPs, POLL_INTERVAL);
