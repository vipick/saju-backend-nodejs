const jwt = require("jsonwebtoken");

/**
 * @param {*} tokenType 토큰 유형
 */
const verifyToken = (tokenType) => {
  return (req, res, next) => {
    const token = req.headers["authorization"]
      ? req.headers["authorization"].split(" ")[1] //bearer가 있는 경우
      : null;

    if (!token) {
      return res.status(401).send({
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    jwt.verify(token, tokenType, (err, decoded) => {
      if (err) {
        return res.status(401).send({
          statusCode: 401,
          message: "Unauthorized",
          error: err,
        });
      }
      req.userId = decoded.id;
      next();
    });
  };
};

const authJwt = {};
authJwt.verifyToken = verifyToken;
module.exports = authJwt;
