const transporter = require('../../thirdParty/emailService');
const { mailUser } = require('../../config');

const warning = "If you don't recognize this action, please report the irregularity.";

function mailOTP({ to, code }) {
  return transporter.sendMail({
    from: mailUser,
    to,
    subject: "Wallance: One Time Password",
    text: `Use the following code to complete the action in Wallance: ${code}. ${warning}`,
    html: `
    <p>Use the following code to complete the action in Wallance:</p>
    <h1>${code}</h1>
    <p>${warning}</p>
    `
  });
}

module.exports = mailOTP;