const jwt = require("jsonwebtoken");
const { User, Hotel } = require("../models");
const { randomKey, message } = require("../utils");

const controller = {
  async login(req, res) {
    try {
      const { _id, name, email, power, type } = req.user;
      const payload = { _id, name, email, type };

      if (power === 420 && type === "admin") {
        payload.isSuperAdmin = true;
      } else if (type === "admin") {
        payload.isAdmin = true;
      } else {
        const manager = await Hotel.findOne({
          managers: _id,
          suspended: false,
          deleted: false,
        });
        if (manager) {
          payload.isManager = true;
          payload.hotel = {
            _id: manager._id,
            locationID: manager.locationID,
            name: manager.name,
            slug: manager.slug,
          };
        } else {
          const owner = await Hotel.findOne({
            owners: _id,
            suspended: false,
            deleted: false,
          });
          if (owner) {
            payload.isOwner = true;
            payload.hotel = {
              _id: owner._id,
              locationID: owner.locationID,
              name: owner.name,
              slug: owner.slug,
            };
          }
        }
      }

      const token = jwt.sign(payload, process.env.AUTH_SECRET, {
        expiresIn: "7d",
      });

      return res.json({ success: true, token });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async socialLogin(req, res) {
    try {
      delete req.user;
      const { provider, id, displayName, email, picture } = req.passportUser;
      if (provider === "google") {
        const user = await User.findOne({ email });
        if (user) {
          if (user.provider === provider && user.socialAccount) {
            const credential = { email, id, provider, key: randomKey(20) };
            return res.redirect(
              `${process.env.BASE_URL}/social-login?c=${btoa(
                JSON.stringify(credential)
              )}`
            );
          } else {
            const data = { error: true };
            return res.redirect(
              `${process.env.BASE_URL}/social-login?e=${btoa(
                JSON.stringify(data)
              )}`
            );
          }
        } else {
          await User.create({
            name: displayName,
            email,
            password: id + process.env.SOCIAL_LOGIN_PASS,
            avatar: picture,
            socialAccount: true,
            provider,
          });
          const credential = { email, id, provider, key: randomKey(20) };
          return res.redirect(
            `${process.env.BASE_URL}/social-login?c=${btoa(
              JSON.stringify(credential)
            )}`
          );
        }
      } else if (provider === "facebook") {
        const user = await User.findOne({ email: id });
        if (user) {
          if (user.provider === provider && user.socialAccount) {
            const credential = { email: id, id, provider, key: randomKey(20) };
            return res.redirect(
              `${process.env.BASE_URL}/social-login?c=${btoa(
                JSON.stringify(credential)
              )}`
            );
          } else {
            const data = { error: true };
            return res.redirect(
              `${process.env.BASE_URL}/social-login?e=${btoa(
                JSON.stringify(data)
              )}`
            );
          }
        } else {
          await User.create({
            name: displayName,
            email: id,
            password: id + process.env.SOCIAL_LOGIN_PASS,
            socialAccount: true,
            provider,
          });
          const credential = { email: id, id, provider, key: randomKey(20) };
          return res.redirect(
            `${process.env.BASE_URL}/social-login?c=${btoa(
              JSON.stringify(credential)
            )}`
          );
        }
      }
      throw new Error(`provider isn't google or facebook`);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
};

module.exports = controller;
