require('dotenv').config();
const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(cors());
app.use(express.json());

// Telegram Bot Credentials
const BOT_TOKEN = process.env.BOT_TOKEN || '8736595383:AAF33rpE_kS9ikG7n_AF2lLyv9zAVs7Bkrg';
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// In-memory verification storage
const pendingUsers = new Map();
const verifiedCodes = new Map();

console.log('🚀 Apex Forex Telegram Bot Server Starting...');

// Telegram Bot Workflow
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `👋 **Baga gara Apex Forex Academy Bot nagaan dhufte!**\n\nVIP Masterclass (Price Action + SMC) banachuuf kaffaltii raawwachuu fi Email kee mirkaneessuun barbaachisaadha.\n\nMaaloo **Email** kee nuu ergi:`,
    { parse_mode: 'Markdown' }
  );
  pendingUsers.set(chatId, { step: 'AWAITING_EMAIL' });
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '/start') return;

  const userState = pendingUsers.get(chatId);

  if (userState && userState.step === 'AWAITING_EMAIL') {
    if (!text || !text.includes('@')) {
      return bot.sendMessage(chatId, '❌ Maaloo Email sirrii ta’e ergi!');
    }

    userState.email = text.trim();
    userState.step = 'AWAITING_PAYMENT_METHOD';

    const opts = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📱 Telebirr', callback_data: 'PAY_TELEBIRR' }],
          [{ text: '💸 M-Pesa', callback_data: 'PAY_MPESA' }]
        ]
      }
    };

    bot.sendMessage(chatId, `✅ Email: *\${userState.email}* galmeeffameera.\n\nMaaloo karaa kaffaltii filadhu:`, { parse_mode: 'Markdown', ...opts });
  }
});

bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const userState = pendingUsers.get(chatId) || {};

  if (data === 'PAY_TELEBIRR') {
    userState.method = 'Telebirr';
    userState.step = 'AWAITING_RECEIPT';
    bot.sendMessage(
      chatId,
      `📲 **Kaffaltii Telebirr:**\n• Lakk. Account: **0911XXXXXX**\n• Maqaa: **Apex Forex / Gemechu Reta**\n• Gatiitii: **1,500 ETB**\n\nErga kaffaltii raawwattee booda **Transaction ID** fi **Screenshot** kaffaltii asitti ergi!`,
      { parse_mode: 'Markdown' }
    );
  } else if (data === 'PAY_MPESA') {
    userState.method = 'M-Pesa';
    userState.step = 'AWAITING_RECEIPT';
    bot.sendMessage(
      chatId,
      `💸 **Kaffaltii M-Pesa:**\n• Lakk. Account: **0711XXXXXX**\n• Maqaa: **Apex Forex / Gemechu Reta**\n• Gatiitii: **1,500 ETB**\n\nErga kaffaltii raawwattee booda **Transaction ID** fi **Screenshot** kaffaltii asitti ergi!`,
      { parse_mode: 'Markdown' }
    );
  }
});

bot.on('photo', (msg) => {
  const chatId = msg.chat.id;
  const userState = pendingUsers.get(chatId);

  if (userState && userState.step === 'AWAITING_RECEIPT') {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verifiedCodes.set(code, { email: userState.email, verified: false });

    if (ADMIN_CHAT_ID) {
      bot.sendPhoto(ADMIN_CHAT_ID, msg.photo[msg.photo.length - 1].file_id, {
        caption: `🚨 **KAFFALTII HAARAA!**\n\n• Email: ${userState.email}\n• Method: ${userState.method}\n• Verification Code: \`${code}\``,
        parse_mode: 'Markdown'
      });
    }

    bot.sendMessage(
      chatId,
      `🎉 **Kaffaltiin kee galmaa'ee jira!**\n\nKoodiin Mirkaneessa (Verification Code) kee:\n👉 \`\${code}\`\n\nKoodii kana websiitii irratti galchuun VIP Access banadhu!`,
      { parse_mode: 'Markdown' }
    );
  }
});

// REST API for Website Verification
app.post('/api/verify-code', (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: 'Code required!' });
  }

  const record = verifiedCodes.get(code.trim());

  if (record) {
    record.verified = true;
    return res.json({ success: true, message: 'Verification successful!' });
  } else {
    return res.status(400).json({ success: false, message: 'Koodiin sirrii miti!' });
  }
});

app.get('/', (req, res) => {
  res.send('Apex Forex Backend Server is active and running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
