const express = require("express");
const session = require("express-session");

let bodyParser = require('body-parser');

const app = express();

app.set("trust proxy", true);

app.use(bodyParser.json({
  limit: '100mb',
  extended: true
}));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET,POST,HEAD,OPTIONS");
  next();
});

app.use(
  session({
    secret: "secret-sign",
    resave: false,
    saveUninitialized: false
  })
);

app.use('/', express.static('websource'));

const appServer = app.listen(80, () => {
  const host = appServer.address().address;
  const port = appServer.address().port;
  console.log('webserver startup, listening at http://%s:%s', host, port);
});
appServer.timeout = 1000 * 60 * 5;
