const express = require("express");
const router = express.Router();

//테스트
router.get("/", (req, res) => {
  return res.status(200).send(process.env.NODE_ENV + " : working!! 06-12");
});

module.exports = router;
