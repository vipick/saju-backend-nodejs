const RateLimit = require("express-rate-limit");

exports.limit = RateLimit({
  windowMs: 60 * 1000, //1분 동안
  max: 30, //최대 30회 요청
  delayMs: 0,
  handler(req, res) {
    res.status(this.statusCode).json({
      statusCode: this.statusCode,
      message: "Request has been blocked",
    });
  },
});
