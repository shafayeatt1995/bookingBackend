const isSuperAdmin = async (req, res, next) => {
  try {
    const { isSuperAdmin } = req.user;
    if (isSuperAdmin) {
      next();
    } else {
      res.status(403).send({ success: false, message: "Access denied" });
    }
  } catch (err) {
    res
      .status(500)
      .send({ success: false, message: "Something wrong. Please try again" });
  }
};

module.exports = isSuperAdmin;
