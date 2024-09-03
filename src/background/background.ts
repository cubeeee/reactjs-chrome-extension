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
       

        sendResponse({ status: 'Proxy is set successfully' });
        return true; // Giữ cho channel mở để gửi phản hồi không đồng bộ
    }
});

// Hàm set proxy
const setProxy = (serverConfig: {
    mode: 'fixed_servers',
    rules: {
        singleProxy: {
            scheme: string,
            host: string,
            port: number
        },
    }
}) => {
    chrome.action.setBadgeBackgroundColor({ color: '#D6EBDC' });
    chrome.action.setBadgeText({ text: "ON" });
    chrome.action.setBadgeTextColor({ color: '#28c76f' });
    chrome.proxy.settings.set({ value: serverConfig, scope: "regular" });
};

// Hàm mở tab mới
const redirect = () => {
    chrome.action.setBadgeBackgroundColor({ color: [162, 36, 36, 255] });
    chrome.action.setBadgeText({ text: "" });
    chrome.proxy.settings.set({ value: { mode: "direct" }, scope: "regular" });
    chrome.storage.sync.set({ tx_proxy: null });
};

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
