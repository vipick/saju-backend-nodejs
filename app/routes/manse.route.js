const authJwt = require("./verify-jwt-token");
const apiLimiter = process.env.NODE_ENV === "prod" ? require("./api-limit").limit : [];
const JWT_SECRET = process.env.JWT_SECRET;
const express = require("express");
const router = express.Router();
const manseController = require("../controllers/manse.controller.js");

//만세력 계산
router.get(
  "/members/:memberId/fortune/:bigNum?/:smallNum?",
  [apiLimiter, authJwt.verifyToken(JWT_SECRET)],
  manseController.calculate
);

module.exports = router;
