bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const userState = pendingUsers.get(chatId) || {};

  if (data === 'PAY_TELEBIRR') {
    userState.method = 'Telebirr';
    userState.step = 'AWAITING_RECEIPT';
    bot.sendMessage(
      chatId,
      `📲 **Kaffaltii Telebirr:**\n• Lakk. Account: **0917091612**\n• Maqaa: **Apex Forex / Gemechu Reta**\n• Gatiitii: **10,000 ETB**\n\nErga kaffaltii raawwattee booda **Transaction ID** fi **Screenshot** kaffaltii asitti ergi!`,
      { parse_mode: 'Markdown' }
    );
  } else if (data === 'PAY_MPESA') {
    userState.method = 'M-Pesa';
    userState.step = 'AWAITING_RECEIPT';
    bot.sendMessage(
      chatId,
      `💸 **Kaffaltii M-Pesa:**\n• Lakk. Account: **0717120607**\n• Maqaa: **Apex Forex / Gemechu Reta**\n• Gatiitii: **10,000 ETB**\n\nErga kaffaltii raawwattee booda **Transaction ID** fi **Screenshot** kaffaltii asitti ergi!`,
      { parse_mode: 'Markdown' }
    );
  }
});
