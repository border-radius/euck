var express = require('express');
var config = require('../config');
var twilio = require('twilio')(config.twilio.sid, config.twilio.token);
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport(config.nodemailer.connection);
var async = require('async');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.post('/callback', function (req, res, next) {
  if (!req.body.name || !req.body.phone) {
    return next(new Error('Не указано имя или телефон.'));
  }

  async.mapLimit(config.twilio.to, 1, function (to, next) {
    twilio.sendMessage({
      to: to,
      from: config.twilio.from,
      body: 'Заявка с сайта euck.ru. Имя: ' + req.body.name + '. Телефон: ' + req.body.phone
    }, next);
  }, function (e) {
    if (e) {
      return next(e);
    }

    res.render('thanks-phone');
  })
});

router.post('/feedback', function (req, res, next) {
  if (!req.body.name || !req.body.mail || !req.body.text) {
    return next(new Error('Не указано имя, e-mail или текст сообщения.'));
  }

  transporter.sendMail({
    from: config.nodemailer.from,
    to: config.nodemailer.to,
    replyTo: req.body.mail,
    subject: 'Обращение с сайта euck.ru от ' + req.body.name,
    text: 'Имя: ' + req.body.name + '\nE-mail: ' + req.body.mail + '\n\nТекст обращения:\n' + req.body.text
  }, function (e) {
    if (e) {
      return next(e);
    }

    res.render('thanks-mail');
  });
});


module.exports = router;
