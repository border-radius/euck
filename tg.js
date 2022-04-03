var express = require('express');
var bodyParser = require('body-parser');
var axios = require('axios');
var config = require('./config.json');

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
        console.log(resp);
    }).catch(function (err) {
        console.log(err && err.message);
    });
});

app.listen(3333);

console.log(new Date().getTime(), 'listening 3333');