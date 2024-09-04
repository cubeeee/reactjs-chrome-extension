const API_URL = 'https://api.netproxy.io/api/rotateProxy';
var worker = null;

const sendMessageToPopup = async (command, message, config) => {
  chrome.runtime.sendMessage({ command, message, config }, function (response) { });
}

const clearAlarm = (name) => {
  chrome.alarms.clear(name);
}

clearAlarm("refreshPage");

const resetProxy = () => {
  const config = {
    mode: "direct"
  };
  chrome.proxy.settings.set(
    { value: config, scope: 'regular' },
    () => {
      console.log('Proxy has been reset to direct connection.');
    }
  );
};

const saveConfigProxy = async (request) => {
  console.log(`Proxy info:`, request.data);
  const proxy = request.data.proxy;
  const [host, port] = proxy.split(':');
  if (!host || !port) {
    sendMessageToPopup("getProxyFailed", { error: "Thông tin proxy không hợp lệ!" }, {});
    return;
  }
  const config = {
    mode: "fixed_servers",
    rules: {
      singleProxy: {
        scheme: "http",
        host: host,
        port: parseInt(port)
      },
      bypassList: ["*netproxy.io, localhost ,127.0.0.1"]
    }
  };
  chrome.tabs.query({ windowType: 'normal' }, function (tabs) {
    if (tabs.length > 0) {
      const tabNeedReload = tabs.find(item => item.url && item.url.includes('http'));
      if (tabNeedReload) {
        chrome.tabs.update(tabNeedReload.id, { url: tabNeedReload.url });
      } else {
        chrome.tabs.create({ url: 'https://api.myip.com/' });
      }
    } else {
      chrome.tabs.create({ url: 'https://api.myip.com/' });
    }
  });
  setProxy(config);
}

const sleep = (timeout) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, timeout)
  })
}
let shouldStop = false;
const startThreadAutoChangeProxy = async (request) => {
  try {
    const { timeRefresh, apiKey, country, type, isAutoRefresh } = request.data;
    console.log({
      timeRefresh,
      apiKey,
      country,
      type,
      isAutoRefresh
    });
    shouldStop = false;
    if (!isAutoRefresh) {
      sendMessageToPopup("autoChangeIpFailed", { error: "Auto-change proxy is disabled." }, {});
      return;
    }
    worker = async () => {
      while (!shouldStop) {
        console.log(`Start auto change proxy...`);
        const url = new URL(`${API_URL}/getNewProxy`);
        const params = {
          apiKey,
          country: country === 'all' ? undefined : country,
          type: type === 'all' ? undefined : type,
        };
        Object.keys(params).forEach(key => params[key] && url.searchParams.append(key, params[key]));
        const response = await fetch(url.toString(), {
          method: 'GET',
        });
        const result = await response.json();
        if (result) {
          console.log(`New proxy:`, result);
          saveConfigProxy(result);
          chrome.runtime.sendMessage({
            type: 'proxy_autoChangeIp_result',
            data: result
          });
        }
        await sleep(timeRefresh * 1000);
      }
    };
    worker();
  } catch (ex) {
    console.error(ex);
  }
};

chrome.runtime.onInstalled.addListener(function () {
  console.log('onInstalled....');
  chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    console.log('request', request);
    switch (request.type) {
      case 'proxy_connect':
        redirect();
        saveConfigProxy(request);
        break;
      case "proxy_change":
        saveConfigProxy(request);
        break;
      case "proxy_disconnect":
        console.log(`Proxy disconnect`);
        clearAlarm("flagLoop");
        clearAlarm("refreshPage");
        resetProxy();
        redirect();
        break;
      case "proxy_autoChangeIp":
        startThreadAutoChangeProxy(request);
        break;
      default:
        console.error('do nothing with this request');
        break;
    }
  });
});


const setProxy = (serverConfig: {
  mode: string,
  rules: {
    singleProxy: {
      scheme: string,
      host: string,
      port: number
    },
    bypassList: string[]
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
redirect();

chrome.webRequest.onAuthRequired.addListener(function (details) {
  console.log(`details`, details);
  return { authCredentials: { username: "netproxy", password: "netproxy" } };
}, { urls: ['<all_urls>'] }, ['blocking']);
