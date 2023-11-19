const transporter = require('../../thirdParty/emailService');
const { mailUser } = require('../../config');

const disclaimer = "If you don't recognize this action, please report the irregularity.";

function mailOTP({ to, code }) {
  return transporter.sendMail({
    from: mailUser,
    to,
    subject: "Wallance OTP",
    text: `Use the following code to complete the action on Wallance: ${code}. ${disclaimer}`,
    html: `
    <p>Use this code to complete the action on Wallance.</p>
    <h1>${code}</h1>
    <p>${disclaimer}</p>
    `
  });
}

module.exports = mailOTP;