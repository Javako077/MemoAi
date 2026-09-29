/**
 * Dispatch WhatsApp Alert (supports Twilio integration or webhook)
 * @param {string} phone 
 * @param {string} message 
 */
const sendWhatsAppAlert = async (phone, message) => {
  console.log(`\n[WHATSAPP ALERT to ${phone}]: ${message}\n`);
  // Optional Twilio setup:
  // if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  //   const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  //   await twilio.messages.create({
  //     body: message,
  //     from: process.env.TWILIO_PHONE_NUMBER || 'whatsapp:+14155238886',
  //     to: `whatsapp:${phone}`
  //   });
  // }
};

module.exports = {
  sendWhatsAppAlert,
};
