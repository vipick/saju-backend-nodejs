const Sequelize = require("sequelize");

module.exports = class Group extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING(30),
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "Group",
        tableName: "groups",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.Group.belongsTo(db.User, { foreignKey: "userId", targetKey: "id" });
    db.Group.hasMany(db.GroupMember, { foreignKey: "groupId", sourceKey: "id", onDelete: "cascade" });
  }
};
