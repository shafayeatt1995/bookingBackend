const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const { Blob } = require("buffer");
const { Image } = require("../models");
const sharp = require("sharp");
const { paginate, utapi, randomKey } = require("../utils");

const controller = {
  async fetchImage(req, res) {
    try {
      const { _id } = req.user;
      const { page, perPage } = req.query;

      const images = await Image.aggregate([
        { $match: { userID: new ObjectId(_id) } },
        { $sort: { _id: -1 } },
        ...paginate(page, perPage),
      ]);

      return res.json({ images });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ success: false, message: "Something wrong. Please try again" });
    }
  },
  async uploadImage(req, res) {
    try {
      const { _id: userID, isSuperAdmin } = req.user;
      const imageBuffer = req.files.image.data;

      const metadata = await sharp(imageBuffer).metadata();
      const shouldResize = metadata.width > 1000 || metadata.height > 768;

      const webpBuffer = shouldResize
        ? await sharp(imageBuffer)
            .resize({
              width: 1000,
              height: 768,
              fit: sharp.fit.inside,
              withoutEnlargement: true,
            })
            .webp()
            .toBuffer()
        : await sharp(imageBuffer).webp().toBuffer();

      const filename = `${randomKey(10)}-${userID}`;
      const blob = new Blob([webpBuffer], { type: "application/octet-stream" });
      const uploadData = Object.assign(blob, { name: filename });

      const { data } = await utapi.uploadFiles(uploadData);
      const { url, size, key } = data;

      if (isSuperAdmin || (await Image.countDocuments({ userID })) < 50) {
        await Image.create({ userID, url, size, key });
        return res.json({ success: true });
      } else {
        return res.status(422).json({ success: false });
      }
    } catch (error) {
      console.error("ami anik", error);
      return res.status(500).json({
        success: false,
        message: "Something went wrong. Please try again",
      });
    }
  },
  async deleteImage(req, res) {
    try {
      const { keyList } = req.query;

      await utapi.deleteFiles(keyList);
      await Image.deleteMany({ key: { $in: keyList } });

      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ success: false, message: "Something wrong. Please try again" });
    }
  },
};

module.exports = controller;
