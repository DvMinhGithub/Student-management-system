require("dotenv").config();

const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const createError = require("http-errors");
const morgan = require("morgan");

const routes = require("./src/routes");
const connectDatabase = require("./src/configs/db");

const PORT = process.env.PORT || 8080;
const app = express();

app.use(morgan("tiny"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use("/", express.static("public"));
app.use(routes);

connectDatabase();

app.use((req, res, next) => {
  next(createError(404, "404 Not Found"));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
