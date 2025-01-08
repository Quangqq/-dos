import socket
import subprocess

def start_server():
    host = '0.0.0.0'  # Lắng nghe trên tất cả các địa chỉ IP
    port = 4000       # Cổng mở

    # Tạo socket
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    
    try:
        # Gắn socket vào host và port
        server_socket.bind((host, port))
        server_socket.listen(5)  # Lắng nghe tối đa 5 kết nối
        print(f"Server đang chạy trên cổng {port}...")

        while True:
            client_socket, address = server_socket.accept()
            print(f"Kết nối từ: {address}")
            
            # Kích hoạt tệp long.py
            try:
                print("Kích hoạt tệp long.py...")
                subprocess.Popen(['python3', 'long.py'])
                client_socket.sendall(b"Đã kích hoạt tệp long.py\n")
            except Exception as e:
                client_socket.sendall(f"Lỗi: {e}".encode('utf-8'))
            
            client_socket.close()
    except KeyboardInterrupt:
        print("\nĐang tắt server...")
    finally:
        server_socket.close()

if __name__ == "__main__":
    start_server()
  
