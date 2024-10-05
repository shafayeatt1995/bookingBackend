const jwt = require("jsonwebtoken");

const isAuthenticated = async (req, res, next) => {
  try {
    const bearer =
      req.headers.authorization || req.cookies["auth._token.cookie"];
    if (bearer) {
      const token =
        bearer.split(" ")[0].toLowerCase() === "bearer"
          ? bearer.split(" ")[1]
          : null;

      const {
        _id,
        name,
        email,
        type,
        isSuperAdmin,
        isAdmin,
        isManager,
        isOwner,
        hotel,
      } = await jwt.verify(token, process.env.AUTH_SECRET);
      const payload = { _id, name, email, type };
      if (isSuperAdmin) {
        payload.isSuperAdmin = true;
      }
      if (isAdmin) {
        payload.isAdmin = true;
      }
      if (isManager) {
        payload.isManager = true;
        payload.hotel = hotel;
      } else if (isOwner) {
        payload.isOwner = true;
        payload.hotel = hotel;
      }
      req.user = payload;
      next();
    } else {
      throw new Error("Token not found");
    }
  } catch (error) {
    return res.status(401).send({ success: false, message: "Unauthorized" });
  }
};

module.exports = isAuthenticated;
