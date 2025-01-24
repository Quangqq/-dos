const express = require("express");
const { exec } = require("child_process");

// Cấu hình API
const api_port = 8888; // Cổng API
const domain_lock = true; // Chỉ cho phép API hoạt động từ một miền cụ thể
const api_domain = "dos-ime7.onrender.com"; // Miền API của bạn nếu `domain_lock` là `true`

const app = express();
app.use(express.json());

// Endpoint API
app.get("/api", async (req, res) => {
    const { url, time, rate, thea, proxy } = req.query;

    // Kiểm tra các tham số cần thiết
    if (!url || !time || !rate || !thea || !proxy) {
        return res.status(400).json({ status: 500, message: "Thiếu tham số (url, time, rate, thea hoặc proxy)" });
    }

    // Kiểm tra miền (nếu domain_lock bật)
    if (domain_lock && req.hostname !== api_domain) {
        return res.status(403).json({ status: 500, message: "Yêu cầu không đến từ miền được ủy quyền" });
    }

    // Kiểm tra tính hợp lệ của tham số
    const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
    if (!urlRegex.test(url)) {
        return res.status(400).json({ status: 500, message: "URL không hợp lệ" });
    }
    if (isNaN(time) || time <= 0) {
        return res.status(400).json({ status: 500, message: "Thời gian phải là số lớn hơn 0" });
    }
    if (isNaN(rate) || rate <= 0) {
        return res.status(400).json({ status: 500, message: "Rate phải là số lớn hơn 0" });
    }
    if (isNaN(thea) || thea <= 0) {
        return res.status(400).json({ status: 500, message: "Thea phải là số lớn hơn 0" });
    }

    // Tạo lệnh chạy cookie.js
    const command = `node cookie.js ${url} ${time} ${rate} ${thea} ${proxy}`;

    console.log(`Đang chạy lệnh: ${command}`);

    // Thực thi lệnh
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Lỗi: ${error.message}`);
            return res.status(500).json({ status: 500, message: "Không thể thực thi lệnh", error: error.message });
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return res.status(500).json({ status: 500, message: "Lỗi trong quá trình chạy script", error: stderr });
        }
        console.log(`Output: ${stdout}`);
        return res.json({ status: 200, message: "Lệnh đang được thực thi", output: stdout });
    });
});

// Khởi chạy server
app.listen(api_port, () => {
    console.log(`API đang chạy trên cổng ${api_port}`);
});
