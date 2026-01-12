const { Division, District, Raw, Post } = require("../models");
const {
  translate,
  stringSlug,
  sleep,
  downloadImage,
  randomKey,
  aiGenerate,
} = require("../utils");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");
const { promises: fsPromises } = require("fs");
const axios = require("axios");

let count = 0;

const controller = {
  // async divisionDistrict(req, res) {
  //   let browser, page;
  //   try {
  //     const $ = cheerio.load(webStr);
  //     let menuData = [];

  //     browser = await puppeteer.launch({ headless: true });
  //     page = await browser.newPage();
  //     await page.goto(
  //       "https://translate.google.com/?sl=auto&tl=en&op=translate"
  //     );

  //     $("#menu-top > .menu-item").each((_, element) => {
  //       const category = $(element).children("a").text().trim();
  //       const subCategories = [];

  //       $(element)
  //         .find(".sub-menu > .menu-item")
  //         .each((_, subElement) => {
  //           const subCategory = $(subElement).children("a").text().trim();
  //           const locations = [];

  //           $(subElement)
  //             .find(".sub-menu > .menu-item a")
  //             .each((_, locationElement) => {
  //               locations.push({
  //                 name: $(locationElement).text().trim(),
  //                 link: $(locationElement).attr("href"),
  //               });
  //             });

  //           subCategories.push({
  //             subCategory,
  //             locations,
  //           });
  //         });

  //       menuData.push({
  //         category,
  //         subCategories,
  //       });
  //     });

  //     const divisions = menuData[0].subCategories.filter(({ subCategory }) =>
  //       subCategory.includes("বিভাগ")
  //     );

  //     for (const { subCategory, locations } of divisions) {
  //       const divisionName = subCategory.replace(/বিভাগ/g, "");
  //       const enDivisionName = await translate(page, divisionName);
  //       const slug = stringSlug(enDivisionName, "_");

  //       const division = await Division.create({
  //         name: enDivisionName,
  //         bnName: divisionName,
  //         slug,
  //       });

  //       for (const { name } of locations) {
  //         const enDistrict = await translate(page, name);
  //         const slug = stringSlug(enDistrict, "_");
  //         await District.create({
  //           divisionID: division._id,
  //           name: enDistrict,
  //           bnName: name,
  //           slug,
  //         });
  //         await sleep(1000);
  //       }

  //       await sleep(1000);
  //     }
  //     await page.close();

  //     return res.json({ success: true, divisions });
  //   } catch (error) {
  //     console.error(error);
  //     return res.status(500).json({ message: error.message });
  //   } finally {
  //     if (browser) await browser.close();
  //   }
  // },
  async collectPostLink(req, res) {
    let browser;
    try {
      browser = await puppeteer.launch({ headless: true });

      const vromon = await browser.newPage();
      await vromon.goto("https://vromonguide.com/");
      await vromon.waitForSelector("nav.main-pagination.number .page-numbers");

      // Extract the last page number from pagination
      const lastPageNumber = await vromon.evaluate(() => {
        const paginationLinks = document.querySelectorAll(
          "nav.main-pagination.number .page-numbers"
        );
        const lastLink = paginationLinks[paginationLinks.length - 2];
        return lastLink ? parseInt(lastLink.textContent, 10) : null;
      });

      if (!lastPageNumber) {
        throw new Error("Could not retrieve last page number");
      }

      const pageLinks = [];
      await Raw.updateMany({}, { done: false });
      for (let i = 1; i <= lastPageNumber; i++) {
        const pageUrl = `https://vromonguide.com/page/${i}`;
        pageLinks.push(pageUrl);

        const vromonPostPage = await browser.newPage();
        await vromonPostPage.setViewport({ width: 1366, height: 1080 });
        await vromonPostPage.goto(pageUrl, { waitUntil: "networkidle2" });

        // Select all col-4 elements and extract URLs
        const postUrls = await vromonPostPage.$$eval(
          ".col-4 a.image-link",
          (links) => links.map((link) => link.href)
        );

        for (const url of postUrls) {
          await Raw.updateOne(
            { url, name: "vromonPostUrl" },
            { $set: { name: "vromonPostUrl", url } },
            { upsert: true }
          );
        }

        await vromonPostPage.close();
        await sleep(2000);
      }
      await vromon.close();

      return res.json({ success: true, pageLinks });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    } finally {
      if (browser) await browser.close();
    }
  },
  async createPost(req, res) {
    let browser;
    try {
      browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(
        "https://translate.google.com/?sl=auto&tl=en&op=translate"
      );

      const pageLinks = await Raw.find({
        name: "vromonPostUrl",
        done: false,
      }).sort({ _id: -1 });

      if (pageLinks.length) {
        for (let i = 0; i <= pageLinks.length; i++) {
          const pageUrl = pageLinks[i].url;
          const vromon = await browser.newPage();
          await vromon.setViewport({ width: 1366, height: 1080 });
          await vromon.goto(pageUrl, { waitUntil: "networkidle2" });

          const imageUrl = await vromon.$eval(
            ".featured img",
            (img) => img.src
          );
          const bnDistrict = await vromon.$eval(".post-cat a", (a) =>
            a.textContent.trim()
          );
          const bnTitle = await vromon.$eval(".post-title", (h1) =>
            h1.textContent.trim()
          );

          // Extract content, split by h2 tags
          const enContent = await vromon.$$eval(
            ".post-content.description > .wprt-container",
            (containers) => {
              return containers.map((container) => {
                const sections = [];
                let currentSection = { title: "", content: [] };

                container.childNodes.forEach((node) => {
                  if (node.tagName === "H2") {
                    if (currentSection.content.length > 0) {
                      sections.push(currentSection);
                    }
                    currentSection = {
                      title: node.textContent.trim(),
                      content: [],
                    };
                  } else if (node.tagName === "P" && node.textContent.trim()) {
                    currentSection.content.push(node.textContent.trim());
                  }
                });

                // Push the last section if it has content
                if (currentSection.content.length > 0) {
                  sections.push(currentSection);
                }

                return sections;
              })[0];
            }
          );

          const image = randomKey(12) + ".jpg";
          if (imageUrl) {
            await downloadImage(imageUrl, image);
          }

          const district = await translate(page, bnDistrict);
          const title = await translate(page, bnTitle);

          let content = [];
          for (let index = 0; index < enContent.length; index++) {
            const el = enContent[index];
            const elTitle = el.title ? await translate(page, el.title) : "";
            let elContent = [];
            for (let i = 0; i < el.content.length; i++) {
              const element = el.content[i];
              const val = await translate(page, element);
              elContent.push(val);
            }
            content.push({ title: elTitle, content: elContent });
          }

          const slug = `${stringSlug(title, "-")}-${randomKey(1)}`;
          const postData = {
            image,
            title,
            slug,
            district,
            content,
            url: pageUrl,
          };

          const findDistrict = await District.findOne({ bnName: bnDistrict });
          if (findDistrict) {
            postData.district = findDistrict.name;
            postData.districtID = findDistrict._id;
          }

          await Post.create(postData);
          await Raw.updateOne({ url: pageUrl }, { done: true });

          await vromon.close();
        }
      }

      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    } finally {
      if (browser) await browser.close();
    }
  },
  async refetch(req, res) {
    let browser;
    try {
      browser = await puppeteer.launch({ headless: true });
      // const page = await browser.newPage();
      // await page.goto(
      //   "https://translate.google.com/?sl=auto&tl=en&op=translate"
      // );

      const { slug } = req.params;

      const pageLinks = await Post.find()
        .select({ _id: 1, url: 1, slug: 1 })
        .skip(386);

      if (pageLinks.length) {
        for (let i = 0; i < pageLinks.length; i++) {
          let content = [];
          const post = pageLinks[i];
          const pageUrl = pageLinks[i].url;
          const vromon = await browser.newPage();
          await vromon.setViewport({ width: 1366, height: 1080 });
          const modifiedUrl = pageUrl.replace(
            "https://vromonguide.com",
            "https://vromonguide-com.translate.goog"
          );
          const url = `${modifiedUrl}?_x_tr_sl=bn&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp`;
          await vromon.goto(url, { waitUntil: "networkidle2" });

          await vromon.evaluate(async () => {
            for (
              let i = 0;
              i < document.body.scrollHeight;
              i += Math.random() * window.innerHeight
            ) {
              window.scrollBy(0, i);
              await new Promise((r) =>
                setTimeout(r, Math.random() * 500 + 200)
              );
            }
            window.scrollTo(0, document.body.scrollHeight);
          });

          const enContent = await vromon.$$eval(
            ".post-content.description > .wprt-container",
            (containers) => {
              return containers.map((container) => {
                const sections = [];
                let currentSection = { title: "", content: [] };

                container.childNodes.forEach((node) => {
                  // Check for H2, H3, H4 titles
                  if (["H2", "H3", "H4"].includes(node.tagName)) {
                    // Push the current section if it has content
                    if (currentSection.content.length > 0) {
                      sections.push(currentSection);
                    }
                    // Start a new section with the title
                    currentSection = {
                      title: node.textContent.trim(),
                      content: [],
                    };
                  } else if (node.tagName === "P" && node.textContent.trim()) {
                    // Add paragraph text to the current section's content
                    currentSection.content.push(node.textContent.trim());
                  }
                });

                // Push the last section if it has content
                if (currentSection.content.length > 0) {
                  sections.push(currentSection);
                }

                return sections;
              })[0]; // Return the first container's result
            }
          );

          for (let index = 0; index < enContent.length; index++) {
            const el = enContent[index];
            const elTitle = el.title || "";
            let elContent = [];
            for (let i = 0; i < el.content.length; i++) {
              const val = el.content[i] || "";
              elContent.push(val);
            }
            content.push({ title: elTitle, content: elContent });
          }

          // for (let index = 0; index < enContent.length; index++) {
          //   const el = enContent[index];
          //   const elTitle = el.title ? await translate(page, el.title) : "";
          //   let elContent = [];
          //   for (let i = 0; i < el.content.length; i++) {
          //     const element = el.content[i];
          //     const val = await translate(page, element);
          //     elContent.push(val);
          //   }
          //   content.push({ title: elTitle, content: elContent });
          // }

          const postData = { content };

          count++;
          await Post.updateOne({ slug: post.slug }, postData);
          await vromon.close();
        }
      }

      return res.json({ success: true, content });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    } finally {
      if (browser) await browser.close();
    }
  },
  async refetchBN(req, res) {
    let browser;
    try {
      browser = await puppeteer.launch({ headless: true });

      const pageLinks = await Post.find()
        .select({ _id: 1, url: 1, slug: 1 })
        .skip(386);

      if (pageLinks.length) {
        for (let i = 0; i < pageLinks.length; i++) {
          let content = [];
          const post = pageLinks[i];
          const pageUrl = pageLinks[i].url;
          const vromon = await browser.newPage();
          await vromon.setViewport({ width: 1366, height: 1080 });
          const modifiedUrl = pageUrl.replace(
            "https://vromonguide.com",
            "https://vromonguide-com.translate.goog"
          );
          const url = `${modifiedUrl}?_x_tr_sl=bn&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp`;
          await vromon.goto(url, { waitUntil: "networkidle2" });

          await vromon.evaluate(async () => {
            for (
              let i = 0;
              i < document.body.scrollHeight;
              i += Math.random() * window.innerHeight
            ) {
              window.scrollBy(0, i);
              await new Promise((r) =>
                setTimeout(r, Math.random() * 500 + 200)
              );
            }
            window.scrollTo(0, document.body.scrollHeight);
          });

          const enContent = await vromon.$$eval(
            ".post-content.description > .wprt-container",
            (containers) => {
              return containers.map((container) => {
                const sections = [];
                let currentSection = { title: "", content: [] };

                container.childNodes.forEach((node) => {
                  // Check for H2, H3, H4 titles
                  if (["H2", "H3", "H4"].includes(node.tagName)) {
                    // Push the current section if it has content
                    if (currentSection.content.length > 0) {
                      sections.push(currentSection);
                    }
                    // Start a new section with the title
                    currentSection = {
                      title: node.textContent.trim(),
                      content: [],
                    };
                  } else if (node.tagName === "P" && node.textContent.trim()) {
                    // Add paragraph text to the current section's content
                    currentSection.content.push(node.textContent.trim());
                  }
                });

                // Push the last section if it has content
                if (currentSection.content.length > 0) {
                  sections.push(currentSection);
                }

                return sections;
              })[0]; // Return the first container's result
            }
          );

          for (let index = 0; index < enContent.length; index++) {
            const el = enContent[index];
            const elTitle = el.title || "";
            let elContent = [];
            for (let i = 0; i < el.content.length; i++) {
              const val = el.content[i] || "";
              elContent.push(val);
            }
            content.push({ title: elTitle, content: elContent });
          }

          // for (let index = 0; index < enContent.length; index++) {
          //   const el = enContent[index];
          //   const elTitle = el.title ? await translate(page, el.title) : "";
          //   let elContent = [];
          //   for (let i = 0; i < el.content.length; i++) {
          //     const element = el.content[i];
          //     const val = await translate(page, element);
          //     elContent.push(val);
          //   }
          //   content.push({ title: elTitle, content: elContent });
          // }

          const postData = { content };

          count++;
          await Post.updateOne({ slug: post.slug }, postData);
          await vromon.close();
        }
      }

      return res.json({ success: true, content });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    } finally {
      if (browser) await browser.close();
    }
  },
  async convertImage(req, res) {
    try {
      const directoryPath = path.join(__dirname, "../public");

      fs.readdir(directoryPath, async (err, files) => {
        if (err) {
          console.error("Unable to scan directory:", err);
          return;
        }

        const imagePromises = files.map(async (file) => {
          const filePath = path.join(directoryPath, file);
          const outputFilePath = path.join(
            directoryPath,
            `../../frontend/static/images/blog/${path.parse(file).name}.webp`
          );

          // Skip non-image files
          if (!file.match(/\.(jpg|jpeg|png)$/i)) return;

          try {
            await sharp(filePath).toFormat("webp").toFile(outputFilePath);
          } catch (error) {
            console.error(`Error converting ${file}:`, error);
          }
        });

        await Promise.all(imagePromises);
      });

      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  },
  async updatePostSlug(req, res) {
    try {
      // const { title, post } = req.body;
      // await downloadImage(title, post.slug);
      const posts = await Post.find();

      for (const post of posts) {
        const title = (post.url.match(/(?:place|abroad)\/([^\/]+)/)?.[1] || "")
          .replace(/-/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase());

        const slug = stringSlug(title);
        count++;
        await Post.updateOne({ _id: post._id }, { title: title.trim(), slug });
      }

      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  },
  async updatePostManually(req, res) {
    try {
      const { title, bnTitle, slug, content, bnContent } = req.body;

      const newSlug = stringSlug(title);
      count++;
      await Post.updateOne(
        { slug },
        { title: title.trim(), slug: newSlug, content, bnTitle, bnContent }
      );

      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  },
  async updateGo(req, res) {
    try {
      const posts = await Post.find();
      for (let post of posts) {
        let updatedContent = [];

        let updated = false;

        for (let item of post.content) {
          if (item.title?.toLowerCase().includes("night")) {
            item.title = `Where to stay`;
            updated = true;
          }
          updatedContent.push(item);
        }

        if (updated) {
          try {
            count++;
            await post.updateOne({ content: updatedContent });
          } catch (err) {
            console.error(`Update error for post ID ${post._id}:`, err);
          }
        }
      }

      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  },
  async updateGoBn(req, res) {
    try {
      const posts = await Post.find().select({ bnContent: 1 });
      const presetFood = "কোথায় খাবেন";
      const presetStay = "কোথায় থাকবেন";
      const presetVehicle = "কিভাবে যাবেন";
      const presetView = "কী কী দেখবেন";
      const presetGo = "কখন যাবেন";
      const presetGoView = "কখন যাবেন আর কী দেখবেন";
      for (let post of posts) {
        let updatedContent = [];

        let updated = false;

        for (let item of post.bnContent) {
          if (item.title?.toLowerCase().includes("কিভাবে ঘুরবেন")) {
            item.title = presetView;
            updated = true;
          }
          updatedContent.push(item);
        }

        if (updated) {
          try {
            count++;
            await post.updateOne({ bnContent: updatedContent });
          } catch (err) {
            console.error(`Update error for post ID ${post._id}:`, err);
          }
        }
      }

      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  },
  async updatePost(req, res) {
    let browser;
    try {
      browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(
        "https://translate.google.com/?sl=auto&tl=en&op=translate"
      );

      const pageLinks = await Raw.find({
        name: "vromonPostUrl",
        done: false,
      });

      if (pageLinks.length) {
        for (let i = 0; i < pageLinks.length; i++) {
          const pageUrl = pageLinks[i].url;
          const vromon = await browser.newPage();
          await vromon.setViewport({ width: 1366, height: 1080 });
          await vromon.goto(pageUrl, { waitUntil: "networkidle2" });

          const bnTitle = await vromon.$eval(".post-title", (h1) =>
            h1.textContent.trim()
          );

          // Extract content, split by h2 tags
          const enContent = await vromon.$$eval(
            ".post-content.description > .wprt-container",
            (containers) => {
              return containers.map((container) => {
                const sections = [];
                let currentSection = { title: "", content: [] };

                container.childNodes.forEach((node) => {
                  if (node.tagName === "H2") {
                    if (currentSection.content.length > 0) {
                      sections.push(currentSection);
                    }
                    currentSection = {
                      title: node.textContent.trim(),
                      content: [],
                    };
                  } else if (node.tagName === "P" && node.textContent.trim()) {
                    currentSection.content.push(node.textContent.trim());
                  }
                });

                // Push the last section if it has content
                if (currentSection.content.length > 0) {
                  sections.push(currentSection);
                }

                return sections;
              })[0];
            }
          );

          const title = await translate(page, bnTitle);

          let content = [];
          for (let index = 0; index < enContent.length; index++) {
            const el = enContent[index];
            const elTitle = el.title ? await translate(page, el.title) : "";
            let elContent = [];
            for (let i = 0; i < el.content.length; i++) {
              const element = el.content[i];
              const val = await translate(page, element);
              elContent.push(val);
            }
            content.push({ title: elTitle, content: elContent });
          }

          const postData = {
            title,
            content,
          };

          await Post.updateOne({ url: pageUrl }, postData, { upsert: true });
          await Raw.updateOne({ url: pageUrl }, { done: true });
          count++;

          await vromon.close();
        }
      }

      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    } finally {
      if (browser) await browser.close();
    }
  },
  async changeImageName(req, res) {
    try {
      // Fetch all posts
      const posts = await Post.find().exec();
      // Use the updated path for the blog images directory
      const blogDir = path.resolve(
        __dirname,
        "../../frontend/static/images/blog"
      );

      // Process each post
      for (const post of posts) {
        const oldImagePath = path.join(blogDir, post.image);
        const newImageName = `${post.slug}${path.extname(post.image)}`;
        const newImagePath = path.join(blogDir, newImageName);

        try {
          // Check if the image file exists
          await fsPromises.access(oldImagePath);

          // Rename the image file
          await fsPromises.rename(oldImagePath, newImagePath);

          // Update the post image field
          post.image = newImageName;
          await post.save(); // Save the updated post
        } catch (err) {
          console.error(`Error processing ${post.slug}: ${err.message}`);
        }
      }

      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  },
  async collectCholozaiPost(req, res) {
    try {
      const { data } = await axios.get("https://www.cholozai.com/sitemap.xml");
      const links = [
        ...data.matchAll(
          /<loc>(https:\/\/cholozai\.com\/location\/[^<]*)<\/loc>/g
        ),
      ].map(async (m) => {
        const name = "cholozaiPost";
        const url = m[1];
        await Raw.updateOne({ name, url }, { name, url }, { upsert: true });
        count++;
        return url;
      });

      return res.json({ success: true, links });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  },
  async createBnPost(req, res) {
    let browser;
    try {
      browser = await puppeteer.launch({ headless: true });

      const pageLinks = await Post.find();

      if (pageLinks.length) {
        for (let i = 0; i < pageLinks.length; i++) {
          const post = pageLinks[i];
          const page = await browser.newPage();
          await page.setViewport({ width: 1366, height: 1080 });

          const url = `https://cholozai-com.translate.goog/location/${post.slug}?_x_tr_sl=en&_x_tr_tl=bn&_x_tr_hl=en&_x_tr_pto=wapp`;
          await page.goto(url, { waitUntil: "networkidle2" });

          // Scroll to load the entire page
          await page.evaluate(async () => {
            for (
              let i = 0;
              i < document.body.scrollHeight;
              i += Math.random() * window.innerHeight
            ) {
              window.scrollBy(0, i);
              await new Promise((r) =>
                setTimeout(r, Math.random() * 500 + 200)
              );
            }
            window.scrollTo(0, document.body.scrollHeight);
          });

          // Extract title, subtitle, and content from the page
          const postData = await page.evaluate(() => {
            const bnTitle =
              document
                .querySelector(
                  "h1.text-3xl.md\\:text-4xl.font-bold.tracking-tight.dark\\:text-white.lg\\:leading-snug.capitalize"
                )
                ?.textContent.trim() || "";

            const bnContent = [
              ...document.querySelectorAll(".mb-7.relative"),
            ].map((section) => {
              const title =
                section
                  .querySelector("h2.text-2xl.font-bold.mb-2.tracking-tight")
                  ?.textContent.trim() || "";
              const content = [
                ...section.querySelectorAll("article div[value]"),
              ].map((div) => div.textContent.trim());
              return { title, content };
            });

            return { bnTitle, bnContent };
          });

          count++;

          await Post.updateOne({ slug: post.slug }, { $set: postData });
          await page.close();
        }
      }

      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    } finally {
      if (browser) await browser.close();
    }
  },
  async uploadImage(req, res) {
    try {
      const { url, img, post } = req.body;
      const { image } = await Post.findOne({ _id: post._id });

      if (!image) {
        return res.status(400).json({ message: "image is required" });
      }

      let buffer;
      if (img) {
        const base64Data = img.replace(/^data:image\/\w+;base64,/, "");
        if (!base64Data) {
          return res.status(400).json({ message: "Invalid base64 image data" });
        }
        buffer = Buffer.from(base64Data, "base64");
      } else {
        const response = await axios({ url, responseType: "arraybuffer" });
        buffer = Buffer.from(response.data, "binary");
      }
      const imageBuffer = await sharp(buffer)
        .resize({
          width: 1300,
          // height: 420,
          fit: sharp.fit.inside,
          withoutEnlargement: true,
        })
        .toBuffer();

      const watermarkPath = path.join(
        __dirname,
        "../../frontend/static/watermark.png"
      );
      const watermarkBuffer = await sharp(watermarkPath)
        .resize(160, 65)
        .toBuffer();

      const watermarkedBuffer = await sharp(imageBuffer)
        .composite([{ input: watermarkBuffer, gravity: "northeast" }])
        .webp()
        .toBuffer();

      const filePath = path.join(
        __dirname,
        "../../frontend/static/images/location",
        image
      );
      fs.writeFileSync(filePath, watermarkedBuffer);

      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  },
  async createRedirect(req, res) {
    try {
      const posts = await Post.find().select({ slug: 1 });
      return res.json({ success: true, posts });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  },
  async replaceText(req, res) {
    try {
      const { texts, post } = req.body;
      let convert = [];
      if (texts.length > 0) {
        for (let i = 0; i < texts.length; i++) {
          const text = texts[i];
          const findPost = await Post.findOne({ _id: post._id });
          if (findPost) {
            const prompt = `"${text}" make this content modify in same language and anti plagiarism and human readable and use easy word. Do not add extra text just reply me the only answer.`;
            let generate = await aiGenerate(prompt);
            if (generate) {
              generate = generate.replace(/"/g, "");
              const replaceText = (arr) =>
                arr.map(({ title, content }) => ({
                  title: title.replace(new RegExp(text, "g"), generate),
                  content: content.map((str) =>
                    str.replace(new RegExp(text, "g"), generate)
                  ),
                }));

              findPost.content = replaceText(findPost.content);
              findPost.bnContent = replaceText(findPost.bnContent);

              await findPost.save();
              convert.push({ text, generate });
              count++;
            }
          }
        }
      }
      count = 0;
      return res.json({ success: true, convert });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  },
  async replaceQuote(req, res) {
    try {
      const posts = await Post.find().select({ content: 1, bnContent: 1 });
      if (posts) {
        for (let i = 0; i < posts.length; i++) {
          const findPost = posts[i];
          const replaceText = (arr) =>
            arr.map(({ title, content }) => ({
              title: title.replace(new RegExp(`"`, "g"), ""),
              content: content.map((str) =>
                str.replace(new RegExp(`"`, "g"), "")
              ),
            }));

          findPost.content = replaceText(findPost.content);
          findPost.bnContent = replaceText(findPost.bnContent);

          await findPost.save();
          count++;
        }
      }
      count = 0;
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  },
  async updateTitle(req, res) {
    let browser;
    try {
      let postData = {};
      browser = await puppeteer.launch({ headless: true });
      const posts = await Post.find()
        .select({
          // content: 1,
          bnContent: 1,
          url: 1,
        })
        .skip(2)
        .limit(10000);
      if (posts) {
        for (let i = 0; i < posts.length; i++) {
          let content = [];
          const post = posts[i];
          const pageUrl = posts[i].url;
          const vromon = await browser.newPage();
          await vromon.setViewport({ width: 1366, height: 1080 });
          await vromon.goto(pageUrl, { waitUntil: "networkidle2" });

          await vromon.evaluate(async () => {
            for (
              let i = 0;
              i < document.body.scrollHeight;
              i += Math.random() * window.innerHeight
            ) {
              window.scrollBy(0, i);
              await new Promise((r) =>
                setTimeout(r, Math.random() * 500 + 200)
              );
            }
            window.scrollTo(0, document.body.scrollHeight);
          });

          const enContent = await vromon.$$eval(
            ".post-content.description > .wprt-container",
            (containers) => {
              return containers.map((container) => {
                const sections = [];
                let currentSection = { title: "", content: [] };

                container.childNodes.forEach((node) => {
                  // Check for H2, H3, H4 titles
                  if (["H2", "H3", "H4"].includes(node.tagName)) {
                    // Push the current section if it has content
                    if (currentSection.content.length > 0) {
                      sections.push(currentSection);
                    }
                    // Start a new section with the title
                    currentSection = {
                      title: node.textContent.trim(),
                      content: [],
                    };
                  } else if (node.tagName === "P" && node.textContent.trim()) {
                    // Add paragraph text to the current section's content
                    currentSection.content.push(node.textContent.trim());
                  }
                });

                // Push the last section if it has content
                if (currentSection.content.length > 0) {
                  sections.push(currentSection);
                }

                return sections;
              })[0]; // Return the first container's result
            }
          );

          for (let index = 0; index < enContent.length; index++) {
            const el = enContent[index];
            const elTitle = el.title || "";
            let elContent = [];
            for (let i = 0; i < el.content.length; i++) {
              const val = el.content[i] || "";
              elContent.push(val);
            }
            content.push({ title: elTitle, content: elContent });
          }

          postData = { content };
          const newContent = post.bnContent.map((data, i) => ({
            ...data,
            title: content[i].title || "",
          }));

          count++;
          await Post.updateOne({ _id: post._id }, { bnContent: newContent });
          await vromon.close();
        }
      }
      count = 0;
      return res.json({ success: true, postData });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    } finally {
      if (browser) await browser.close();
    }
  },
};

module.exports = controller;
