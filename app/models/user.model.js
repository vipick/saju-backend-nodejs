const Sequelize = require("sequelize");

module.exports = class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        email: {
          type: Sequelize.STRING(100),
          allowNull: false,
          unique: {
            args: true,
            msg: "Email already in use!",
          },
        },
        password: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "User",
        tableName: "users",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.User.hasMany(db.Member, { foreignKey: "userId", soruceKey: "id", onDelete: "cascade" });
    db.User.hasMany(db.Group, { foreignKey: "userId", soruceKey: "id", onDelete: "cascade" });
  }
};
