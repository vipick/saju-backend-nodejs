const Sequelize = require("sequelize");

module.exports = class MemberManse extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        memberId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        bigFortuneNumber: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        bigFortuneStartYear: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        seasonStartTime: {
          type: Sequelize.STRING(20),
          allowNull: true,
        },
        yearSky: {
          type: Sequelize.STRING(10),
          allowNull: false,
        },
        yearGround: {
          type: Sequelize.STRING(10),
          allowNull: false,
        },
        monthSky: {
          type: Sequelize.STRING(10),
          allowNull: false,
        },
        monthGround: {
          type: Sequelize.STRING(10),
          allowNull: false,
        },
        daySky: {
          type: Sequelize.STRING(10),
          allowNull: false,
        },
        dayGround: {
          type: Sequelize.STRING(10),
          allowNull: false,
        },
        timeSky: {
          type: Sequelize.STRING(10),
          allowNull: true,
        },
        timeGround: {
          type: Sequelize.STRING(10),
          allowNull: true,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "MemberManse",
        tableName: "member_manse",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.MemberManse.belongsTo(db.Member, { foreignKey: "memberId", targetKey: "id" });
  }
};
