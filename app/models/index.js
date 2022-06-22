const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "dev";
const config = require(__dirname + "/../configs/sequelize.config")[env];

const Manse = require("./manse.model");
const User = require("./user.model");
const Member = require("./member.model");
const MemberManse = require("./member-manse.model");
const Group = require("./group.model");
const GroupMember = require("./group-member.model");

const db = {};
const sequelize = new Sequelize(config.database, config.username, config.password, config);
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.Manse = Manse;
db.User = User;
db.Member = Member;
db.MemberManse = MemberManse;
db.Group = Group;
db.GroupMember = GroupMember;

Manse.init(sequelize);
User.init(sequelize);
Member.init(sequelize);
MemberManse.init(sequelize);
Group.init(sequelize);
GroupMember.init(sequelize);

User.associate(db);
Member.associate(db);
MemberManse.associate(db);
Group.associate(db);
GroupMember.associate(db);

module.exports = db;
