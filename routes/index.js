var express = require('express');
var config = require('../config');
var twilio = require('twilio')(config.twilio.sid, config.twilio.token);
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport(config.nodemailer.connection);
var async = require('async');
var router = express.Router();
var recaptcha = require('express-recaptcha');

recaptcha.init(config.recaptcha.site_key, config.recaptcha.secret_key);

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {
    title: 'Express',
    time: new Date().getTime(),
    captcha: recaptcha.render()
  });
});

router.get('/policy', function (req, res) {
  res.render('policy');
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

  recaptcha.verify(req, e => {
    if (e) {
      return res.render('error', {
        message: 'Кажется, вы робот или забыли нажать кнопку "Я не робот"'
      })
    }

    async.mapLimit(config.nodemailer.to, 1, function (to, next) {
      transporter.sendMail({
        from: config.nodemailer.from,
        to: to,
        replyTo: req.body.mail,
        subject: 'Обращение с сайта euck.ru от ' + req.body.name,
        text: 'Имя: ' + req.body.name + '\nE-mail: ' + req.body.mail + '\n\nТекст обращения:\n' + req.body.text
      }, next);
    }, function (e) {
      if (e) {
        return next(e);
      }

      res.render('thanks-mail');
    });
  })
});

router.use('/booking', require('./booking'));

module.exports = router;
