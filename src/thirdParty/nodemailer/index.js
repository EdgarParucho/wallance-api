const nodemailer = require('nodemailer');
const { mailHost, mailPort, mailUser, mailPass } = require('../../config');

const transporter = nodemailer.createTransport({
  host: mailHost,
  secure: true,
  port: mailPort,
  auth: { user: mailUser, pass: mailPass },
});

module.exports = transporter;