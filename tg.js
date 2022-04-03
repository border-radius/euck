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
    const msg = 'Новая заявка.\nИмя: ' + req.body.name + '\nТелефон:\n`' + req.body.phone + '`';
    
    console.log('---');
    console.log(msg);
    
    axios(config.tg + msg).then(function (resp) {
        console.log(resp);
    }).catch(function (err) {
        console.log(err);
    });
});

app.listen(3333);

console.log(new Date().getTime(), 'listening 3333');