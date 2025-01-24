const express = require('express');
const { exec } = require('child_process');

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

    // Chuẩn bị lệnh gọi tệp cookie.js
    const command = `node cookie.js ${field.url} ${field.time} ${field.rate} ${field.thea} ${field.proxy}`;

    try {
        const startTime = process.hrtime();

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Lỗi: ${stderr}`);
                return res.json({ status: 500, data: `Gửi yêu cầu không thành công` });
            }

            const elapsedTime = process.hrtime(startTime);
            const elapsedTimeMs = elapsedTime[0] * 1000 + elapsedTime[1] / 1000000;

            console.log(`Gửi yêu cầu thành công: ${stdout}`);

            return res.json({
                status: 200,
                message: 'Gửi yêu cầu thành công',
                elapsed_time: elapsedTimeMs.toFixed(2),
                data: {
                    url: field.url,
                    time: field.time,
                    rate: field.rate,
                    thea: field.thea,
                    proxy: field.proxy,
                }
            });
        });
    } catch (e) {
        console.error(`Lỗi khi xử lý: ${e.message}`);
        return res.json({ status: 500, data: `Gửi yêu cầu không thành công` });
    }
});

app.listen(api_port, () => console.log(`API đã chạy trên cổng ${api_port}`));
