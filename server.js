const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const moment = require("moment");
const slack = require("./app/commons/slack.js");
const router = require("./app/routes/route");
const userRouter = require("./app/routes/user.route");
const memberRouter = require("./app/routes/member.route");
const groupRouter = require("./app/routes/group.route");
const manseRouter = require("./app/routes/manse.route");

/**
 * Sequelize 설정
 */
const { sequelize } = require("./app/models");
sequelize
  .sync({ force: false })
  .then(async () => {
    process.env.NODE_ENV !== "test" ? console.log("Mysql 연결 성공") : null;
  })
  .catch(async (err) => {
    console.log(err);
    if (process.env.NODE_ENV === "prod") {
      process.env.SLACK_KEY
        ? await slack.slackMessage("#ff0000", "Mysql 연결 에러", err.message, moment().unix())
        : null;
      throw new Error("Mysql 연결 에러!");
    } else {
      throw new Error("Mysql 연결 에러!");
    }
  });

/**
 * Express 설정
 */
const app = express();
app.set("port", process.env.PORT || 3000); //포트 설정
app.use(express.json()); //Body parser : POST, PUT, PATCH 요청을 req.body에 넣어준다.
app.use(express.urlencoded({ extended: false })); //Body parser : Form 요청을 req.body에 넣어준다.

if (process.env.NODE_ENV === "prod") {
  app.use(morgan("combined")); //로그 설정
  app.use(cors("*")); //CORS 설정
} else {
  app.use(morgan("dev"));
  app.use(cors("*"));
}

/**
 * Route 설정
 */
app.use("/", router);
app.use("/users", userRouter);
app.use("/members", memberRouter);
app.use("/groups", groupRouter);
app.use("/manse", manseRouter);

/**
 * 에러 처리 설정
 */
//404 NotFound 에러 처리
app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

//500 서버 에러 처리
app.use((err, req, res, next) => {
  let requestIp = null;
  if (req.headers["x-forwarded-for"]) {
    requestIp = req.headers["x-forwarded-for"]; //client IP
  } else {
    requestIp = req.connection.remoteAddress; //로드밸런서 IP
  }

  if (process.env.NODE_ENV === "prod" && err.status !== 404) {
    const body = JSON.stringify(req.body);
    process.env.SLACK_KEY
      ? slack.slackMessage("#ff0000", "서버 에러!", `${requestIp}, ${err}:${body}`, moment().unix())
      : null;
    return res.status(500).send({
      statusCode: 500,
      message: "서버 에러!",
    });
  } else {
    return res.status(500).send({
      statusCode: 500,
      message: "서버 에러!",
      error: err,
    });
  }
});

app.listen(app.get("port"), "0.0.0.0", () => {
  console.log(app.get("port"), "번 포트에서 대기중");
});
