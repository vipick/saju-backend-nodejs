const Sequelize = require("sequelize");

module.exports = class GroupMember extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        groupId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        memberId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "GroupMember",
        tableName: "group_members",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.GroupMember.belongsTo(db.Group, { foreignKey: "groupId", targetKey: "id" });
    db.GroupMember.belongsTo(db.Member, { foreignKey: "memberId", sourceKey: "id" });
  }
};
