const { Post, District, Division } = require("../models");
const {
  message,
  paginate,
  startDate,
  objectID,
  randomDate,
} = require("../utils");
const perPage = 24;
const subtractDays = (date, days) =>
  startDate(new Date(date.getTime() - days * 24 * 60 * 60 * 1000));

const controller = {
  async fetchPostCount(req, res) {
    try {
      const count = await Post.countDocuments();
      const pages = Math.round(count / 18);

      return res.json({ pages });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async fetchPosts(req, res) {
    try {
      const { page } = req.params;

      const posts = await Post.aggregate([
        ...paginate(page, perPage),
        { $project: { url: 0 } },
      ]);

      return res.json({ posts });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async fetchPost(req, res) {
    try {
      const { slug } = req.params;

      const post = await Post.findOne({ slug });
      const district = await District.findOne({
        _id: objectID(post.districtID),
      });
      const division = await Division.findOne({
        _id: objectID(district?.divisionID),
      });

      const related = await Post.aggregate([
        { $match: { districtID: post.districtID, _id: { $ne: post._id } } },
        { $sample: { size: 3 } },
      ]);

      return res.json({ post, related, division });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async fetchDistrictPost(req, res) {
    try {
      const { name, page } = req.params;
      const posts = await Post.aggregate([
        { $match: { district: name } },
        ...paginate(page, perPage),
        { $project: { url: 0 } },
      ]);

      return res.json({ posts });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async fetchDivisionPost(req, res) {
    try {
      const { slug, page } = req.params;
      const division = await Division.findOne({ slug });
      const districts = await District.find({
        divisionID: objectID(division._id),
      });
      const district = districts.map(({ _id }) => _id);

      const posts = await Post.aggregate([
        { $match: { districtID: { $in: district } } },
        ...paginate(page, perPage),
        { $project: { url: 0 } },
      ]);

      return res.json({ posts });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async updatePostDate(req, res) {
    try {
      let count = 0;
      const twoMonthAgo = subtractDays(new Date(), 30);
      const posts = await Post.find({});
      for (const post of posts) {
        console.log(++count);
        const postDate = randomDate(twoMonthAgo, new Date());
        await Post.updateOne({ _id: post._id }, { postDate });
      }

      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
};

module.exports = controller;
