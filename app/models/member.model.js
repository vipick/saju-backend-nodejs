const Sequelize = require("sequelize");

module.exports = class Member extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        type: {
          type: Sequelize.STRING(6),
          allowNull: false,
        },
        nickname: {
          type: Sequelize.STRING(30),
          allowNull: false,
        },
        gender: {
          type: Sequelize.STRING(6),
          allowNull: false,
        },
        birthdayType: {
          type: Sequelize.STRING(5),
          allowNull: false,
        },
        birthday: {
          type: Sequelize.DATEONLY,
          allowNull: false,
        },
        time: {
          type: Sequelize.STRING(10),
          allowNull: true,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "Member",
        tableName: "members",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.Member.belongsTo(db.User, { foreignKey: "userId", targetKey: "id" });
    db.Member.hasMany(db.GroupMember, { foreignKey: "memberId", sourceKey: "id", onDelete: "cascade" });
    db.Member.hasOne(db.MemberManse, { foreignKey: "memberId", sourceKey: "id", onDelete: "cascade" });
  }
};
