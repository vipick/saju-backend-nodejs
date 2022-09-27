require("dotenv").config();

module.exports = {
  dev: {
    database: process.env.DEV_DB_DATABASE,
    host: process.env.DEV_DB_HOST,
    username: process.env.DEV_DB_USERNAME,
    password: process.env.DEV_DB_PASSWORD,
    port: process.env.DEV_DB_PORT,
    dialect: "mysql",
    logging: false,
    dialectOptions: {
      dateStrings: true,
      typeCast: true,
    },
    timezone: "+09:00",
  },
  prod: {
    database: process.env.PROD_DB_DATABASE,
    host: process.env.PROD_DB_HOST,
    username: process.env.PROD_DB_USERNAME,
    password: process.env.PROD_DB_PASSWORD,
    // replication: {
    //   write: {
    //     host: process.env.PROD_DB_WRITER_HOST,
    //     username: process.env.PROD_DB_USERNAME,
    //     password: process.env.PROD_DB_PASSWORD,
    //   },
    //   read: [
    //     {
    //       host: process.env.PROD_DB_READER_HOST,
    //       username: process.env.PROD_DB_USERNAME,
    //       password: process.env.PROD_DB_PASSWORD,
    //     },
    //   ],
    // },
    port: 3306,
    dialect: "mysql",
    logging: false,
    dialectOptions: {
      dateStrings: true,
      typeCast: true,
    },
    timezone: "+09:00",
  },
};
