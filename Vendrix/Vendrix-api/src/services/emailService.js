const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { ses } = require('../config/aws');
const { logger } = require('../utils/logger');

const sendEmail = async ({ to, subject, html, text }) => {
  const params = {
    Destination: { ToAddresses: Array.isArray(to) ? to : [to] },
    Message: {
      Body: {
        Html: { Charset: 'UTF-8', Data: html },
        ...(text && { Text: { Charset: 'UTF-8', Data: text } }),
      },
      Subject: { Charset: 'UTF-8', Data: subject },
    },
    Source: process.env.SES_FROM_EMAIL,
  };

  try {
    const result = await ses.send(new SendEmailCommand(params));
    logger.info(`Email sent to ${to}: ${result.MessageId}`);
    return result;
  } catch (err) {
    logger.error(`Email send failed: ${err.message}`);
    throw err;
  }
};

module.exports = { sendEmail };
