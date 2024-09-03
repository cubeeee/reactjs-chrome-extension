chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "proxy_info") {
        const proxy = request.data.proxy;  // Giả sử proxy là dạng "host:port"

        const [host, port] = proxy.split(':');

        const config = {
            mode: "fixed_servers",
            rules: {
                singleProxy: {
                    scheme: "http",
                    host: host,
                    port: parseInt(port)
                },
                bypassList: ["<local>"]
            }
        };

        chrome.proxy.settings.set(
            { value: config, scope: 'regular' },
            () => {
                console.log('Proxy configuration set:', config);
            }
        );

        // Xử lý lỗi nếu có lỗi khi truy cập qua proxy
        chrome.webRequest.onErrorOccurred.addListener(
            (details) => {
                console.log('Error occurred:', details.error);
                if (details.error === "net::ERR_PROXY_CONNECTION_FAILED" || details.error === "407") {
                    console.log("Proxy authentication failed or connection error, resetting to direct connection...");
                    resetProxy();  // Hủy kết nối proxy và quay lại mạng gốc
                }
            },
            { urls: ["<all_urls>"] }
        );

        sendResponse({ status: 'Proxy is set successfully' });
        return true; // Giữ cho channel mở để gửi phản hồi không đồng bộ
    }
});

// Hàm reset proxy
const resetProxy = () => {
    const config = {
        mode: "direct" // Sử dụng mạng gốc, không qua proxy
    };

    chrome.proxy.settings.set(
        { value: config, scope: 'regular' },
        () => {
            console.log('Proxy has been reset to direct connection.');
        }
    );
};
