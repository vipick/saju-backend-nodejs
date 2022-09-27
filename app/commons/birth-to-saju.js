const { Manse, MemberManse } = require("../models");
const sajuDataService = require("./saju-data");
const moment = require("moment");
const { Op } = require("sequelize");

/**
 * 생년월일시를 사주로 변환
 */
exports.convertBirthtimeToSaju = async (member) => {
  //(1) 생년월일을 삼주(양력)로 변환
  const samju = await this.convertBirthToSamju(member.birthdayType, member.birthday, member.time);

  //(2) 생년월일시(양력) 생성
  let solarDatetime = samju.solarDate;
  solarDatetime = member.time ? solarDatetime + " " + member.time : solarDatetime + " 12:00:00";

  //(3) 순행(true), 역행(false) 판단
  const direction = await this.isRightDirection(member.gender, samju.yearSky);

  //(4) 절입시간 가져오기
  const seasonTime = await this.getSeasonStartTime(direction, solarDatetime);

  //(5) 대운수 및 대운 시작년 가져오기
  const bigFortune = await this.getBigFortuneNumber(direction, seasonTime, moment(solarDatetime));

  //(6) 시주 가져오기
  const timeJu = await this.getTimePillar(samju.daySky, member.time);

  //(7) 멤버-만세력 테이블에 대운수 및 시주 저장 & 수정
  await MemberManse.upsert({
    memberId: member.id, //key 값
    yearSky: samju.yearSky,
    yearGround: samju.yearGround,
    monthSky: samju.monthSky,
    monthGround: samju.monthGround,
    daySky: samju.daySky,
    dayGround: samju.dayGround,
    timeSky: timeJu.timeSky,
    timeGround: timeJu.timeGround,
    bigFortuneNumber: bigFortune.bigFortuneNumber,
    bigFortuneStartYear: bigFortune.bigFortuneStart,
    seasonStartTime: samju.seasonStartTime,
  });
};

/**
 * 생년월일을 삼주로 변환
 * 절입일 예외처리 : 시간 미입력시 12:00
 */
exports.convertBirthToSamju = async (birthdayType, birthday, time) => {
  // 23:30 ~ 23:59 자시에 태어난 경우 다음날로 처리
  // 1987.02.13 00:30분  (계사일주 - 임자시)
  // 1987.02.13 23:40분  (갑오일주 - 갑자시)
  const birthtime = time === null ? "12:00" : time;
  if (time >= "23:30" && time <= "23:59") {
    birthday = moment(birthday).add(1, "days").format("YYYY-MM-DD");
  }

  const condition =
    birthdayType === "SOLAR"
      ? {
          solarDate: birthday, //양력
        }
      : {
          lunarDate: birthday, //음력
        };

  const samju = await Manse.findOne({
    where: condition,
  });

  //절입일인 경우
  if (samju.season) {
    //절입시간과 생년연월시 비교
    //1987-02-04 17:47:00 이후 입춘 - 정묘년 임인월 갑신일, 이전 병인년 신축월 계미일
    //절입일이 생일보다 큰 경우는 하루 전 만세력을 가져와야 한다.
    const seasonTime = moment(samju.seasonStartTime);
    const solarDatetime = moment(birthday + " " + birthtime);
    const diff = moment.duration(solarDatetime.diff(seasonTime)).asHours(); //-5.783333333333333 소수점 출력

    if (diff < 0) {
      const manse = await Manse.findOne({
        where: {
          solarDate: moment(birthday).add(-1, "days").format("YYYY-MM-DD"),
        },
      });
      samju.yearSky = manse.yearSky;
      samju.yearGround = manse.yearGround;
      samju.monthSky = manse.monthSky;
      samju.monthGround = manse.monthGround;
      samju.daySky = manse.daySky;
      samju.dayGround = manse.dayGround;
    }
  }
  return samju;
};

/**
 * 순행(true), 역행(false) 판단 (성별, 연간)
 */
exports.isRightDirection = async (gender, yearSky) => {
  const minusPlus = await sajuDataService.getMinusPlus()[yearSky];
  //남양여음 순행, 남음여양 역행
  if ((gender === "MALE" && minusPlus === "양") || (gender === "FEMALE" && minusPlus === "음")) {
    return true;
  } else if ((gender === "FEMALE" && minusPlus === "양") || (gender === "MALE" && minusPlus === "음")) {
    return false;
  }
};

/**
 * 절입 시간 가져오기
 * 순행은 생년월일 뒤에 오는 절입 시간을 가져온다.
 * 역행은 생년월일 앞에 오는 절입 시간을 가져온다.
 * 예를 들어 2월 13일이 순행인 경우 3월 6일(경칩)을 가져온다.
 * 2월 13일이 역행인 경우 2월 4일(입춘)을 가져온다.
 */
exports.getSeasonStartTime = async (direction, solarDatetime) => {
  const condition1 = direction === true ? { [Op.gte]: solarDatetime } : { [Op.lte]: solarDatetime };
  const condition2 = direction === true ? "ASC" : "DESC";

  const manse = await Manse.findOne({
    where: {
      seasonStartTime: condition1,
    },
    order: [["solarDate", condition2]],
  });

  return moment(manse.seasonStartTime);
};

/**
 * 대운수 및 대운 시작 구하기
 */
exports.getBigFortuneNumber = async (direction, seasonStartTime, solarDatetime) => {
  const diffTime =
    direction === true
      ? moment.duration(seasonStartTime.diff(solarDatetime)).asDays() //순행
      : moment.duration(solarDatetime.diff(seasonStartTime)).asDays(); //역행

  const divider = Math.floor(diffTime / 3);
  const demainder = Math.floor(diffTime) % 3;

  let bigFortuneNumber = divider;
  if (diffTime < 4) {
    bigFortuneNumber = 1;
  }

  if (demainder === 2) {
    bigFortuneNumber += 1;
  }
  const bigFortuneStart = solarDatetime.add(bigFortuneNumber, "years").format("YYYY");

  return {
    bigFortuneNumber, //대운수
    bigFortuneStart, //대운 시작년
  };
};

/**
 * 시주 계산하기
 */
exports.getTimePillar = (daySky, time) => {
  //시간이 없는 경우 null 처리
  let timeSky = null;
  let timeGround = null;

  //시간이 있는 경우 처리
  if (time) {
    let index = null;
    const timeJuData = sajuDataService.getTimeJuData(); //시간 범위
    const timeJuData2 = sajuDataService.getTimeJuData2(); //일간 및 시간에 따른 시주

    for (const key in timeJuData) {
      const strKey = String(key);

      if (time >= timeJuData[strKey]["0"] && time <= timeJuData[strKey]["1"]) {
        index = strKey;
        break;
      } else if ((time >= "23:30" && time <= "23:59") || (time >= "00:00" && time <= "01:29")) {
        // 0 => ['23:30:00', '01:30:00'],  //자시
        index = strKey;
        break;
      }
    }
    //일간
    timeSky = timeJuData2[daySky][index][0];
    timeGround = timeJuData2[daySky][index][1];
  }

  return {
    timeSky,
    timeGround,
  };
};
