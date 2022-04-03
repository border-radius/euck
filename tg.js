var express = require('express');
var bodyParser = require('body-parser');
var axios = require('axios');
var config = require('./config.json');
var twilio = require('twilio')(config.twilio.sid, config.twilio.token);
var async = require('async');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.send('OK');
});

app.post('/callback', (req, res) => {
    console.log('---');
    console.log(req.body);

    res.send('OK');

    if (!req.body.Name || !req.body.Phone) {
        console.log('! no name or phone');
    }
    
    const msg = 'Новая заявка.\nИмя: ' + req.body.Name + '\nТелефон:\n`' + req.body.Phone + '`';
    
    console.log(msg);
    
    axios(config.tg + encodeURIComponent(msg)).then(function (resp) {
        console.log('TG', resp.status, resp.statusText);
    }).catch(function (err) {
        console.log('TG', err && err.message);
    });

    async.mapLimit(config.twilio.to, 1, function (to, next) {
        twilio.sendMessage({
          to: to,
          from: config.twilio.from,
          body: 'Заявка с сайта euck.ru. Имя: ' + req.body.Name + '. Телефон: ' + req.body.Phone
        }, next);
      }, function (e) {
        if (e) {
          console.log('TWILIO', e && e.message ? e.message : e);
        }

        console.log('TWILIO', 'OK');
      });
});

app.listen(3333);

console.log(new Date().getTime(), 'listening 3333');