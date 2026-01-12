const isOM = async (req, res, next) => {
  try {
    const { isOwner } = req.user;
    if (isOwner) {
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

module.exports = isOM;
