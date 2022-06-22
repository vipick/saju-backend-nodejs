const { Member, MemberManse } = require("../models");
const formatService = require("../commons/format.js");
const { validationResult } = require("express-validator");

/**
 * 만세력 계산
 */
exports.calculate = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const result = errors.array();
    return res.status(400).send({
      statusCode: 400,
      message: "잘못된 요청값 입니다.",
      error: result,
    });
  }

  const userId = req.params.userId ? req.params.userId : req.userId;
  const memberId = req.params.memberId;
  const bigNum = req.params.bigNum;
  const smallNum = req.params.smallNum;

  try {
    const member = await Member.findOne({
      where: { userId: userId, id: memberId },
      attributes: ["id", "nickname", "gender", "birthdayType", "birthday", "time", "createdAt"],
      include: [
        {
          model: MemberManse,
          attributes: [
            "id",
            "bigFortuneNumber",
            "bigFortuneStartYear",
            "seasonStartTime",
            "yearSky",
            "yearGround",
            "monthSky",
            "monthGround",
            "daySky",
            "dayGround",
            "timeSky",
            "timeGround",
          ],
        },
      ],
    });

    if (!member) {
      return res.status(403).send({
        statusCode: 403,
        message: "해당 멤버에 대한 접근 권한이 없습니다.",
      });
    }

    const member1 = member.dataValues;
    const memberManse1 = member1.MemberManse;
    const manse = await formatService.convertMemberToManse(member1, memberManse1, bigNum, smallNum);

    return res.status(200).send({
      statusCode: 200,
      message: "만세력 가져오기 성공",
      data: manse,
    });
  } catch (err) {
    next(`${req.method} ${req.url} : ` + err);
  }
};
