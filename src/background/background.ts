const API_URL = 'https://api.netproxy.io/api/rotateProxy';
var worker = null;
let apiKeyLocal = null
let countryLocal = 'all'
let typeLocal = 'all'

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
  const proxy = request.data.proxy;
  const newTab = request.data.newTab;
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
  // if (newTab === true) {
  //   chrome.tabs.query({ windowType: 'normal' }, function (tabs) {
  //     const url = 'https://netproxy.io/whoer-ip/';
  //     chrome.tabs.create({ url: url, active: true });
  //   });
  // }
  setProxy(config);
}

const sleep = (timeout) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, timeout)
  })
}

let shouldStop = false;
let currentWorker = null;
const startThreadAutoChangeProxy = async (request) => {
  try {
    const { timeRefresh, apiKey, country, type, isAutoRefresh, isConnected } = request.data;
    countryLocal = country
    typeLocal = type
    if (currentWorker) {
      console.log("Stopping current worker...");
      shouldStop = true;
      await currentWorker;
      currentWorker = null;
    }
    shouldStop = false;
    if (!isAutoRefresh && !isConnected) {
      sendMessageToPopup("autoChangeIpFailed", { error: "Auto-change proxy is disabled." }, {});
      return;
    }
    if (isAutoRefresh && timeRefresh > 0) {
      let countdown = timeRefresh;
      currentWorker = (async () => {
        while (!shouldStop) {
          await sleep(1000);
          if (countdown === 0) {
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
              countdown = timeRefresh;
            }
          }
          countdown--;
          chrome.runtime.sendMessage({
            type: 'proxy_autoChangeIp_countdown',
            data: countdown
          });
        }
        console.log("Worker stopped.");
      })();
      currentWorker.catch((error) => {
        console.error('Worker error:', error);
      });
    } else {
      shouldStop = true;
      currentWorker = null;
      console.log(`Auto-change proxy stopped.`);
    }
  } catch (ex) {
    console.error(`Error when startThreadAutoChangeProxy:`, ex);
  }
};


const stopThreadAutoChangeIp = () => {
  shouldStop = true;
  if (currentWorker) {
    console.log(`Stopping worker...`);
    currentWorker = null;
  }
};

chrome.alarms.onAlarm.addListener(async function (alarm) {
  switch (alarm.name) {
    case "refreshPage":
      break;
    default:
      break;
  }
});
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  switch (request.type) {
    case 'proxy_connect':
      redirect();
      saveConfigProxy(request);
      break;
    case "proxy_change":
      saveConfigProxy(request);
      break;
    case "proxy_disconnect":
      clearAlarm("flagLoop");
      clearAlarm("refreshPage");
      resetProxy();
      redirect();
      stopThreadAutoChangeIp();
      break;
    case "proxy_autoChangeIp":
      startThreadAutoChangeProxy(request);
      break;
    case "proxy_stopAutoChangeIp":
      stopThreadAutoChangeIp();
      break;
    case "setApiKey":
      apiKeyLocal = request.data.apiKey
      break;
    default:
      console.error('do nothing with this request');
      break;
  }
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
// redirect();


const handleFetchNewIp = async () => {
  const url = new URL(`${API_URL}/getNewProxy`);
  console.log(`apikey`, apiKeyLocal);
  let data = null
  const params = {
    apiKey: apiKeyLocal,
    country: countryLocal,
    type: typeLocal,
  };
  Object.keys(params).forEach(key => params[key] && url.searchParams.append(key, params[key]));

  let success = false;

  while (!success) {
    try {
      const response = await fetch(url.toString(), { method: 'GET' });
      const result = await response.json();
      if (result && result.data && result.data.proxy) {
        console.log("New proxy fetched:", result.data.proxy);
        await saveConfigProxy(result); // Apply the new proxy
        success = true; // Stop the loop on success
        data = result.data
      } else {
        console.error("Failed to fetch new proxy: Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching new proxy, retrying...", error);
    }

    // Delay before retrying to avoid spamming the server
    if (!success) {
      await sleep(10000); // Wait for 2 seconds before retrying
    }
  }
  return data
};


let cachedUsername = null;
let cachedPassword = null;

const initializeProxyAuth = async () => {
  const data = await handleFetchNewIp();
  if (data) {
    cachedUsername = data.username;
    cachedPassword = data.password;
  }
};

// Gọi hàm này khi bạn khởi động extension hoặc khi bạn thiết lập proxy mới
initializeProxyAuth();

chrome.webRequest.onAuthRequired.addListener(
  function (details) {
    if (cachedUsername && cachedPassword) {
      console.log("Using cached credentials for proxy authentication...");
      return {
        authCredentials: {
          username: cachedUsername,
          password: cachedPassword
        }
      };
    } else {
      console.error("No cached credentials found. Please re-fetch proxy credentials.");
      return { cancel: true };
    }
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);


chrome.webRequest.onErrorOccurred.addListener(
  async function (details) {
    if (details.error === "net::ERR_PROXY_CONNECTION_FAILED") {
      console.log("Proxy connection failed, fetching a new proxy...");
      await handleFetchNewIp(); // Fetch a new proxy
    }
  },
  { urls: ["<all_urls>"] }
);

