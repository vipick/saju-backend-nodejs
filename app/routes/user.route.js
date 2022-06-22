const authJwt = require("./verify-jwt-token");
const apiLimiter = process.env.NODE_ENV === "prod" ? require("./api-limit").limit : [];
const JWT_SECRET = process.env.JWT_SECRET;
const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller.js");
const { body } = require("express-validator");

/**
 * [회원]
 */

//회원가입
router.post(
  "/signup",
  [
    apiLimiter,
    body("email").not().isEmpty().isEmail(),
    body("password").not().isEmpty().isLength({ min: 4, max: 100 }),
    body("type").not().isIn(["USER", "MEMBER"]),
    body("nickname").not().isEmpty().isLength({ min: 2, max: 30 }),
    body("gender").not().isEmpty().isIn(["MALE", "FEMALE"]),
    body("birthdayType").not().isEmpty().isIn(["SOLAR", "LUNAR"]),
    body("birthday")
      .not()
      .isEmpty()
      .isLength({ min: 8, max: 8 })
      .isInt()
      .matches(/^(19[0-9][0-9]|20\d{2}|2100)(0[0-9]|1[0-2])(0[1-9]|[1-2][0-9]|3[0-1])$/),
    body("time")
      .optional()
      .isLength({ min: 0, max: 4 })
      .matches(/(0[0-9]|1[0-9]|2[0-3])(0[0-9]|[1-5][0-9])$/),
  ],
  userController.signup
);

//로그인
router.post(
  "/signin",
  [
    apiLimiter,
    body("email").not().isEmpty().isEmail(),
    body("password").not().isEmpty().isLength({ min: 4, max: 100 }),
  ],
  userController.signin
);

//내정보 가져오기
router.get("/me", [apiLimiter, authJwt.verifyToken(JWT_SECRET)], userController.me);

module.exports = router;
