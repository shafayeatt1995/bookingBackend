require("dotenv").config();

const express = require("express");
const app = express();
const port = process.env.PORT || 8000;
const cookieParser = require("cookie-parser");
const compression = require("compression");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const session = require("cookie-session");
const bodyParser = require("body-parser");
const { createSocketServer } = require("./createSocketServer");
const { mongoConnect } = require("./config/database");
const mongoMiddleware = require("./middleware/mongoMiddleware");

app.use(
  cors({
    origin: [process.env.BASE_URL, "http://localhost:8080"],
    credentials: true,
  })
);
app.use(fileUpload({ limits: { fileSize: 10 * 1024 * 1024 } }));

function verifyRequest(req, res, buf, encoding) {
  req.rawBody = buf.toString(encoding);
}
app.use(bodyParser.json());
app.use(cookieParser());
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(express.urlencoded({ extended: true, verify: verifyRequest }));
app.use(compression());
app.use(express.json({ limit: "32mb", verify: verifyRequest }));
app.use(
  session({
    name: "session",
    keys: [process.env.SESSION_SECRET],
    maxAge: 24 * 60 * 60 * 1000,
  })
);

app.use("/api", mongoMiddleware, require("./routes"));

app.use((err, req, res, next) => {
  console.error(err);
  return res
    .status(500)
    .json({ error: err.message || "Internal server error" });
});

const server = createSocketServer(app);
server.listen(port, async () => {
  console.log(`Server is running at http://localhost:${port}`);
  await mongoConnect();
});
