const express = require("express");
const router = express.Router();
const {
  fetchUser,
  createUser,
  updateUser,
  deleteUser,
  suspendUser,
  fetchActiveUsers,
} = require("../../controllers/UserController");
const { validation } = require("../../validation");
const { userCreateVal, userUpdateVal } = require("../../validation/user");

router.get("/", fetchUser);
router.post("/", userCreateVal, validation, createUser);
router.patch("/", userUpdateVal, validation, updateUser);
router.delete("/", deleteUser);
router.put("/", suspendUser);
router.get("/active-user", fetchActiveUsers);

module.exports = router;
