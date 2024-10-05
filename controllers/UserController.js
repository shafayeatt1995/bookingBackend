const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User, Hotel } = require("../models");
const { paginate, message } = require("../utils");

const controller = {
  async profile(req, res) {
    try {
      const { _id } = req.user;
      const user = await User.findOne({ _id }).select("+power");
      if (user && user.power === 420 && user.type === "admin") {
        delete user._doc.power;
        return res.json({
          user: { ...user._doc, isSuperAdmin: true },
        });
      } else if (user && user.type === "admin") {
        delete user._doc.power;
        return res.json({
          success: true,
          user: { ...user._doc, isAdmin: true },
        });
      } else if (user && user.type === "user") {
        delete user._doc.power;
        const manager = await Hotel.findOne({
          managers: user._doc._id,
          suspended: false,
          deleted: false,
        });
        if (manager) {
          delete manager._doc.managers;
          delete manager._doc.owners;
          user._doc.isManager = true;
          user._doc.hotel = manager;
          return res.json({ user });
        } else {
          const owner = await Hotel.findOne({
            owners: user._doc._id,
            suspended: false,
            deleted: false,
          });
          if (owner) {
            delete owner._doc.managers;
            delete owner._doc.owners;
            user._doc.isOwner = true;
            user._doc.hotel = owner;
            return res.json({ user });
          }
        }
      }
      if (user.socialAccount) {
        delete user._doc.power;
        delete user._doc.type;
        delete user._doc.permissions;
        return res.json({ user });
      } else {
        return res
          .status(500)
          .json({ message: "Your account is deleted or suspended" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async refresh(req, res) {
    try {
      const bearer =
        req.headers.authorization || req.cookies["auth._token.cookie"];
      if (!bearer) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const token =
        bearer.split(" ")[0].toLowerCase() === "bearer"
          ? bearer.split(" ")[1]
          : null;
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const decoded = await jwt.verify(token, process.env.AUTH_SECRET);
      const { iat, exp, ...payload } = decoded;
      const refresh_token = await jwt.sign(payload, process.env.AUTH_SECRET, {
        expiresIn: "7d",
      });

      return res.json({ token: refresh_token });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async fetchUser(req, res) {
    try {
      const { page, perPage, search } = req.query;
      const matchQuery = {};
      if (search) {
        matchQuery.$or = [
          { name: { $regex: new RegExp(search, "i") } },
          { email: { $regex: new RegExp(search, "i") } },
        ];
      }

      const items = await User.aggregate([
        { $match: matchQuery },
        { $project: { password: 0 } },
        { $sort: { _id: -1 } },
        ...paginate(page, perPage),
      ]);
      return res.json({ items });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async createUser(req, res) {
    try {
      const { name, email, password } = req.body;
      await User.create({ name, email, password });
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async updateUser(req, res) {
    try {
      const { _id, name, email, password } = req.body;
      const data = { name, email };
      if (password) data.password = bcrypt.hashSync(password, 10);
      await User.updateOne({ _id }, data);
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async suspendUser(req, res) {
    try {
      const { _id } = req.body;
      await User.updateOne({ _id }, [
        { $set: { suspended: { $eq: [false, "$suspended"] } } },
      ]);
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async deleteUser(req, res) {
    try {
      const { _id } = req.query;
      await User.updateOne({ _id }, [
        { $set: { deleted: { $eq: [false, "$deleted"] } } },
      ]);
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async updateProfile(req, res) {
    try {
      const { _id } = req.user;
      const { name } = req.query;
      await User.updateOne({ _id }, { name });
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Something wrong. Please try again",
      });
    }
  },
  async updatePassword(req, res) {
    try {
      const { _id } = req.user;
      const { new: password } = req.query;
      const hashPassword = await bcrypt.hashSync(password, 10);
      await User.updateOne({ _id }, { password: hashPassword });
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Something wrong. Please try again",
      });
    }
  },
  async updateHotel(req, res) {
    try {
      const { _id } = req.user.hotel;
      const { name, slug, address, image, images, facilities, about, nid } =
        req.body;

      await Hotel.updateOne(
        { _id },
        { name, slug, address, image, images, facilities, about, nid }
      );
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async fetchActiveUsers(req, res) {
    try {
      return res.json({ activeUsers: global.activeUsers ?? 0 });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async updateToken(req, res) {
    try {
      const { token } = req.body;
      const { _id } = req.user;
      await User.findOneAndUpdate({ _id }, { token });

      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
};

module.exports = controller;
