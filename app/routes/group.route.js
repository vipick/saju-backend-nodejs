const authJwt = require("./verify-jwt-token");
const apiLimiter = process.env.NODE_ENV === "prod" ? require("./api-limit").limit : [];
const JWT_SECRET = process.env.JWT_SECRET;
const express = require("express");
const router = express.Router();
const groupController = require("../controllers/group.controller.js");
const groupMemberController = require("../controllers/group-member.controller.js");
const { body, query, param } = require("express-validator");

/**
 * [그룹]
 */

//그룹 추가
router.post(
  "/",
  [apiLimiter, authJwt.verifyToken(JWT_SECRET), body("name").not().isEmpty().isString().isLength({ min: 2, max: 30 })],
  groupController.addGroup
);

//그룹 리스트
router.get(
  "/",
  [
    apiLimiter,
    authJwt.verifyToken(JWT_SECRET),
    query("page").not().isEmpty().isInt(),
    query("size").not().isEmpty().isInt(),
  ],
  groupController.getGroups
);

//그룹 수정
router.patch(
  "/:id",
  [
    apiLimiter,
    authJwt.verifyToken(JWT_SECRET),
    param("id").not().isEmpty().isInt(),
    body("name").not().isEmpty().isString().isLength({ min: 2, max: 30 }),
  ],
  groupController.updateGroup
);

//그룹 삭제
router.delete(
  "/:id",
  [apiLimiter, authJwt.verifyToken(JWT_SECRET), param("id").not().isEmpty().isInt()],
  groupController.deleteGroup
);

//그룹명 리스트
router.get("/names", [apiLimiter, authJwt.verifyToken(JWT_SECRET)], groupController.getGroupNames);

/**
 * [그룹 멤버]
 */
//그룹에 멤버 추가
router.post(
  "/:groupId/members/:memberId",
  [
    apiLimiter,
    authJwt.verifyToken(JWT_SECRET),
    param("groupId").not().isEmpty().isInt(),
    param("memberId").not().isEmpty().isInt(),
  ],
  groupMemberController.addMemberToGroup
);

//그룹별 멤버 리스트
router.get(
  "/:groupId/members",
  [
    apiLimiter,
    authJwt.verifyToken(JWT_SECRET),
    param("groupId").not().isEmpty().isInt(),
    query("page").not().isEmpty().isInt(),
    query("size").not().isEmpty().isInt(),
  ],
  groupMemberController.getGroupMemberList
);

//그룹에서 멤버 제거
router.delete(
  "/:groupId/members/:memberId",
  [
    apiLimiter,
    authJwt.verifyToken(JWT_SECRET),
    param("groupId").not().isEmpty().isInt(),
    param("memberId").not().isEmpty().isInt(),
  ],
  groupMemberController.removeMemberFromGroup
);

module.exports = router;
