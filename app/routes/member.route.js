const authJwt = require("./verify-jwt-token");
const apiLimiter = process.env.NODE_ENV === "prod" ? require("./api-limit").limit : [];
const JWT_SECRET = process.env.JWT_SECRET;
const express = require("express");
const router = express.Router();
const memberController = require("../controllers/member.controller.js");
const { body, query, param } = require("express-validator");

/**
 * [멤버]
 */

//멤버 추가
router.post(
  "/",
  [
    apiLimiter,
    authJwt.verifyToken(JWT_SECRET),
    body("nickname").not().isEmpty().isString().isLength({ min: 2, max: 30 }),
    body("gender").not().isEmpty().isString().isIn(["MALE", "FEMALE"]),
    body("birthdayType").not().isEmpty().isString().isIn(["SOLAR", "LUNAR"]),
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
  memberController.addMember
);

//멤버 리스트
router.get(
  "/",
  [
    apiLimiter,
    authJwt.verifyToken(JWT_SECRET),
    query("page").not().isEmpty().isInt(),
    query("size").not().isEmpty().isInt(),
  ],
  memberController.getMembers
);

//멤버 삭제
router.delete(
  "/:id",
  [apiLimiter, authJwt.verifyToken(JWT_SECRET), param("id").not().isEmpty().isInt()],
  memberController.deleteMember
);

module.exports = router;
