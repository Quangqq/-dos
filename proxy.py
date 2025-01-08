import requests
from threading import Thread
from os import system, name
from time import sleep

# Danh sách chứa proxy
proxies = []
proxies_checked = []

# Lấy địa chỉ IP của bạn
myip = requests.get('http://ipinfo.io/json').json()['ip']

# Hàm kiểm tra proxy
def check(p):
    proxy = {
        'http': f'http://{p}',
        'https': f'https://{p}',
    }
    try:
        r = requests.get('http://ipinfo.io/json', proxies=proxy, timeout=5).json()
        if r['ip'] != myip:  # Proxy trả về IP khác
            proxies_checked.append(p)
    except:
        pass  # Bỏ qua lỗi

# Hàm lấy proxy từ API
def get(api):
    try:
        r = requests.get(api, timeout=5)
        proxies.extend(r.text.strip().split('\n'))
    except:
        pass  # Bỏ qua lỗi khi lấy proxy

# Danh sách API proxy
http_api = [
    "https://api.proxyscrape.com/?request=displayproxies&proxytype=http",
    "https://www.proxy-list.download/api/v1/get?type=http",
    "https://api.openproxylist.xyz/http.txt",
    "http://alexa.lr2b.com/proxylist.txt",
    "https://multiproxy.org/txt_all/proxy.txt",
    "https://api.proxyscrape.com/v2/?request=getproxies&protocol=http",
    "https://openproxylist.xyz/http.txt",
    "https://proxyspace.pro/http.txt",
    "https://proxyspace.pro/https.txt",
    "https://rootjazz.com/proxies/proxies.txt",
    "https://www.proxy-list.download/api/v1/get?type=https",
    "https://api.proxyscrape.com/v2/?request=getproxies&protocol=socks5&timeout=10000&country=all&simplified=true",
    "https://www.proxy-list.download/api/v1/get?type=socks5",
    "https://www.proxyscan.io/download?type=socks5",
    "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks5.txt",
    "https://raw.githubusercontent.com/hookzof/socks5_list/master/proxy.txt",
    "https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/socks5.txt",
    "https://raw.githubusercontent.com/jetkai/proxy-list/main/online-proxies/txt/proxies-socks5.txt",
    "https://api.openproxylist.xyz/socks5.txt",
    "https://api.proxyscrape.com/v2/?request=getproxies&protocol=socks5",
    "https://openproxylist.xyz/socks5.txt",
    "https://proxyspace.pro/socks5.txt",
    "https://raw.githubusercontent.com/B4RC0DE-TM/proxy-list/main/SOCKS5.txt",
    "https://raw.githubusercontent.com/manuGMG/proxy-365/main/SOCKS5.txt",
    "https://raw.githubusercontent.com/mmpx12/proxy-list/master/socks5.txt",
    "https://raw.githubusercontent.com/roosterkid/openproxylist/main/SOCKS5_RAW.txt",
    "https://raw.githubusercontent.com/saschazesiger/Free-Proxies/master/proxies/socks5.txt",
    "https://raw.githubusercontent.com/jetkai/proxy-list/main/online-proxies/txt/proxies-http.txt",
    "https://raw.githubusercontent.com/shiftytr/proxy-list/master/proxy.txt",
    "https://raw.githubusercontent.com/almroot/proxylist/master/list.txt",
    "https://raw.githubusercontent.com/opsxcq/proxy-list/master/list.txt",
    "https://proxy-spider.com/api/proxies.example.txt",
    "https://raw.githubusercontent.com/mmpx12/proxy-list/master/http.txt",
    "https://raw.githubusercontent.com/mmpx12/proxy-list/master/https.txt",
    "https://raw.githubusercontent.com/RX4096/proxy-list/main/online/http.txt",
    "https://raw.githubusercontent.com/RX4096/proxy-list/main/online/https.txt",
    "https://raw.githubusercontent.com/saschazesiger/Free-Proxies/master/proxies/http.txt",
    "https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/http.txt",
    "https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/https.txt",
    "https://rootjazz.com/proxies/proxies.txt",
]

# Lấy proxy từ tất cả các API
for api in http_api:
    get(api)

# Xóa màn hình console
if name == 'nt':  # Windows
    system('cls')
else:  # Linux/Mac
    system('clear')

# Kiểm tra proxy
threads = []
for proxy in proxies:
    t = Thread(target=check, args=(proxy,))
    t.start()
    threads.append(t)

# Chờ tất cả các luồng kết thúc
for t in threads:
    t.join()

# Lưu các proxy hoạt động vào file
with open('proxy.txt', 'w') as f:
    for proxy in proxies_checked:
        f.write(proxy + '\n')
