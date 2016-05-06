var express = require('express');
var config = require('../config');
var twilio = require('twilio')(config.twilio.sid, config.twilio.token);
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport(config.nodemailer.connection);

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.post('/callback', function (req, res, next) {
  twilio.sendMessage({
    to: config.twilio.to,
    from: config.twilio.from,
    body: 'Заявка с сайта euck.ru. Имя: ' + req.body.name + '. Телефон: ' + req.body.phone
  }, function (e) {
    if (e) {
      return next(e);
    }

    res.render('thanks-phone');
  })
});

router.post('/feedback', function (req, res, next) {
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
