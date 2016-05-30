'use strict';

var express = require('express');
var basicAuth = require('basic-auth');
var path = require('path');
var multer = require('multer');
var config = require('../config.json');
var router = express.Router();
var upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, next) {
      next(null, path.join(__dirname, '../public/images'));
    },
    filename: function (req, file, next) {
      next(null, 'booking.png');
    }
  })
});

function Auth (req, res, next) {
  var user = basicAuth(req);

  if (!user || user.name !== config.auth.user || user.pass !== config.auth.password) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.send(401);
  }

  next();
};

router.get('/', Auth, function (req, res) {
  res.render('booking');
});

router.post('/', Auth, upload.single('image'), function (req, res) {
  res.redirect('/#booking');
});

module.exports = router;
