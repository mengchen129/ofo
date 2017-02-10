var express = require('express');
var app = express();
var mysql = require('mysql');
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));

var mysqlConfig = require('./mysql-config.js');

var conn = mysql.createConnection(mysqlConfig);

conn.connect(function(err) {
    if (!err) {
        console.log('connect database success');
    }
});

app.get('/', function(req, res) {
    res.sendfile('index.html', {root: __dirname});
});

app.get('/total', function(req, res) {
    conn.query('select count(*) as total_count from passwords', function(err, result) {
        if (err) {
            console.log('[ERROR] - ' + err.message);
            return;
        }

        res.json({count: result[0].total_count});
    });
});

app.get('/search', function (req, res) {
    var number = req.query.number;
    if (!number) {
        res.json({password: undefined});
        return;
    }

    conn.query('select password from passwords where number = ?', [number], function(err, result) {
        if (err) {
            console.log('[ERROR] - ' + err.message);
            return;
        }

        res.json({password: result.length ? result[0].password : undefined});
    });
});

app.post('/add', function(req, res) {
    var body = req.body;
    var number = body.number;
    var password = body.password;

    conn.query('insert into passwords(number, password) values(?, ?)', [number, password], function(err, result) {
        if (err) {
            console.log('[ERROR] - ' + err.message);
            res.sendfile('fail.html', {root: __dirname});
            return;
        }

        res.sendfile('success.html', {root: __dirname});
    });
});

app.listen(8083, function () {
    console.log('Http Server started. port: 8083');
});