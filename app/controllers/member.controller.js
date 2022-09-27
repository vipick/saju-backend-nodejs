const { Member, MemberManse, Sequelize } = require("../models");
const SajuService = require("../commons/birth-to-saju.js");
const { validationResult } = require("express-validator");

/**
 * 멤버 추가
 */
exports.addMember = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const result = errors.array();
    return res.status(400).send({
      statusCode: 400,
      message: "잘못된 요청값 입니다.",
      error: result,
    });
  }

  const nickname = req.body.nickname;
  const gender = req.body.gender;
  const birthdayType = req.body.birthdayType;
  const birthday = await String(req.body.birthday).replace(/(\d{4})(\d{2})(\d{2})/g, "$1-$2-$3");
  const time = req.body.time ? String(req.body.time).replace(/(\d{2})(\d{2})/g, "$1:$2") : null;
  const userId = req.userId;

  try {
    const member = await Member.create({
      userId,
      nickname,
      gender,
      birthday,
      birthdayType,
      time,
      type: "MEMBER",
    });

    //생년월일시를 사주로 변환
    await SajuService.convertBirthtimeToSaju(member);

    return res.status(201).send({
      statusCode: 201,
      message: "멤버 추가 성공",
    });
  } catch (err) {
    next(`${req.method} ${req.url} : ` + err);
  }
};

const getPagination = (page, size) => {
  const limit = size ? +size : 10;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

const getPagingData = async (data, page, limit) => {
  const { count: totalItems, rows: memberList } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, totalPages, currentPage, memberList };
};

/**
 * 멤버 리스트
 */
exports.getMembers = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const result = errors.array();
    return res.status(400).send({
      statusCode: 400,
      message: "잘못된 요청값 입니다.",
      error: result,
    });
  }

  const page = req.query.page !== "NaN" ? req.query.page : 0;
  const size = req.query.size;
  const { limit, offset } = getPagination(page, size);
  const userId = req.userId;

  try {
    const result = await Member.findAndCountAll({
      where: { userId: userId },
      order: [["createdAt", "DESC"]],
      attributes: [
        "id",
        "type",
        "nickname",
        "birthday",
        "birthdayType",
        "gender",
        "time",
        [
          Sequelize.literal("(SELECT YEAR(CURRENT_DATE) - YEAR(birthday) + 1 FROM members where id = Member.id)"),
          "age", //나이
        ],
        "createdAt",
      ],
      limit,
      offset,
    });
    const response = await getPagingData(result, page, limit);

    return res.status(200).send({
      statusCode: 200,
      message: "멤버 리스트 성공",
      data: response,
    });
  } catch (err) {
    next(`${req.method} ${req.url} : ` + err);
  }
};

/**
 * 멤버 삭제
 */
exports.deleteMember = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const result = errors.array();
    return res.status(400).send({
      statusCode: 400,
      message: "잘못된 요청값 입니다.",
      error: result,
    });
  }

  const userId = req.userId;
  const memberId = req.params.id;

  try {
    const member = await Member.findOne({
      where: { userId: userId, id: memberId },
    });

    if (!member) {
      return res.status(403).send({
        statusCode: 403,
        message: "해당 멤버의 삭제 권한이 없습니다.",
      });
    }

    if (member && member.type === "USER") {
      return res.status(403).send({
        statusCode: 403,
        message: "본인에 대한 삭제 권한이 없습니다.",
      });
    }

    await MemberManse.destroy({
      where: { memberId: memberId },
    });

    await Member.destroy({
      where: { id: memberId },
    });

    return res.status(200).send({
      statusCode: 200,
      message: "멤버 삭제 성공",
    });
  } catch (err) {
    next(`${req.method} ${req.url} : ` + err);
  }
};
