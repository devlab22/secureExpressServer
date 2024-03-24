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

//app.use(helmet());

app.use(cookieparser());
app.use(express.static(path.join(dirname, 'build')));
app.use(express.static(path.join(dirname, 'cert')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));

var config = {}



try {
    const rawdata = fs.readFileSync(path.join(dirname, 'config.json'));
    const data = JSON.parse(rawdata);
    config = data;
}
catch (e) {
    console.log('config file ->', e.message);
}

var corsOptions = {
    "origin": config.ORIGIN || "*",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Request-Method": "POST,GET,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "X-Requested-With,Content-Type",
    "optionsSuccessStatus": 200
};

const PORT = config.PORT || 8000;
const HOST = config.HOST || 'localhost';
const SECURE = config.SECURE || false;
const keyFilename = config.KEY || '';
const certFilename = config.CERT || '';
const passphrase = config.PASSPHRASE || '';
const connect = config.CONNECT 

app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrcElem: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: [connect],
        imgSrc: ["'self'", '*.unsplash.com', '*.google.com']
    }
}));

app.use(cors(corsOptions));

app.use('/*', (req, res, next) => {
    res.sendFile(path.join(dirname, 'build', 'index.html'));
})

if (SECURE) {
    https
        .createServer(
            {
                key: fs.readFileSync(path.join(dirname, 'cert', keyFilename)),
                cert: fs.readFileSync(path.join(dirname, 'cert', certFilename)),
                passphrase: passphrase
            },
            app
        )
        .listen(PORT, HOST, (req, res) => {
            console.log(`SSL frontend server is runing at https://${HOST}:${PORT}`)
        })
}
else {
    app.listen(PORT, HOST, (req, res) => {
        console.log(`frontend server is runing at http://${HOST}:${PORT}`)
    })
}
