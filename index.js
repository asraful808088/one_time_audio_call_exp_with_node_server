require("dotenv").config();
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const path = require("path");
const { createServer } = require("./socket/socket");
createServer(server);
app.use("/", express.static(path.join(__dirname, "static")));
const PORT = process.env.PORT;
server.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`server start on ${PORT} PORT || http://localhost:${PORT}`);
  }
});
