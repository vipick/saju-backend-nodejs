const { IncomingWebhook } = require("@slack/client");
const webhook = new IncomingWebhook(process.env.SLACK_KEY);
/**
 * Slack에 에러 메시지 전송
 * @param {*} color
 * @param {*} text
 * @param {*} title
 * @param {*} time
 */
exports.slackMessage = async (color, text, title, time) => {
  await webhook.send({
    attachments: [
      {
        color: color,
        text: text,
        fields: [
          {
            title: title,
            short: false,
          },
        ],
        ts: time,
      },
    ],
  });
};
