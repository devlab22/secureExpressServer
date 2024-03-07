const express = require('express')
const https = require('https')
const path = require('path')
const fs = require('fs')
const dirname = process.cwd();
const helmet = require("helmet");
const cookieparser = require("cookie-parser");
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express()

app.use(helmet());
app.use(cookieparser());
app.use(express.static(path.join(dirname, 'build')));
app.use(express.static(path.join(dirname, 'cert')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));

var config = {}

var corsOptions = {
    "origin": "*",
    "Access-Control-Request-Method": "POST,GET,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "X-Requested-With,Content-Type",
    "optionsSuccessStatus": 200
};

try {
    const rawdata = fs.readFileSync(path.join(dirname, 'config.json'));
    const data = JSON.parse(rawdata);
    config = data;
}
catch (e) {
    console.log('config file ->', e.message);
}

const PORT = config.PORT || 8000;
const HOST = config.HOST || 'localhost';

app.use(cors(corsOptions))

app.use('/*', (req, res, next) => {
    res.sendFile(path.join(dirname, 'build', 'index.html'));
})

if(config.SECURE){
    https
    .createServer(
        {
            key: fs.readFileSync(path.join(dirname, 'cert', 'key.pem')),
            cert: fs.readFileSync(path.join(dirname, 'cert', 'cert.pem'))
        },
        app
    )
    .listen(PORT, HOST, (req, res) => {
        console.log(`SSL frontend server is runing at https://${HOST}:${PORT}`)
    })
}
else{
    app.listen(PORT, HOST, (req, res) => {
        console.log(`frontend server is runing at http://${HOST}:${PORT}`)
    })
}