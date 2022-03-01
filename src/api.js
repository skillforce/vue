const API_KEY =
  "16dcff85d37ccb3f100772438e5afd5c19d8295240290b1a4c7508fccef06c69";

const tickersHandlers = new Map();
const toBTCPrice = {};

const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);
const AGGREGATE_INDEX = "5";
const BAD_INDEX = "500";
let BTC_PRICE;

socket.addEventListener(
  "message",
  () => {
    if (!tickersHandlers.get("BTC")) sendMessageToWS(subscribeOnWS("BTC"));
  },
  { once: true }
);

socket.addEventListener("message", (e) => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice,
    TOSYMBOL: toSymbol,
    LASTVOLUMETO: lastVolumeToBTC
  } = JSON.parse(e.data);

  if (toSymbol === "BTC") {
    toBTCPrice[currency] = lastVolumeToBTC;
    const handler = tickersHandlers.get(currency);
    const convertIndex = toBTCPrice[currency];
    return handler.forEach((fn) => fn(currency, BTC_PRICE * convertIndex));
  }

  if (currency === "BTC" && newPrice) {
    BTC_PRICE = newPrice;
    for (let keys in toBTCPrice) {
      if (tickersHandlers.has(keys)) {
        const updateValue = tickersHandlers.get(keys)[0];
        updateValue(keys, toBTCPrice[keys] * BTC_PRICE);
      }
    }
  }
  const handlers = tickersHandlers.get(currency) || [];

  if (type === BAD_INDEX) {
    const { PARAMETER: param } = JSON.parse(e.data);
    sendMessageToWS(currencyCheckOnWs(param));
  }

  if (type === AGGREGATE_INDEX) {
    if (newPrice) {
      handlers.forEach((fn) => fn(currency, newPrice));
    }
  }
});

const changeParams = (param) => {
  const arrParam = param.split("");
  const newParam = arrParam.splice(0, arrParam.length - 3);
  newParam.push("B", "T", "C");
  return newParam.join("");
};

export const tickersAPI = {
  getWholeCoinList: async () => {
    const res = await fetch(
      "https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
    );
    return await res.json();
  }
};

const sendMessageToWS = (message) => {
  const stringifyMessage = JSON.stringify(message);
  if (socket.readyState === socket.OPEN) {
    socket.send(stringifyMessage);
    return;
  }
  socket.addEventListener(
    "open",
    () => {
      socket.send(stringifyMessage);
    },
    { once: true }
  );
};

const subscribeOnWS = (tickerName) => {
  return {
    action: "SubAdd",
    subs: [`5~CCCAGG~${tickerName}~USD`]
  };
};

const unSubscribeOnWS = (tickerName) => {
  return {
    action: "SubRemove",
    subs: [`5~CCCAGG~${tickerName}~USD`]
  };
};

const currencyCheckOnWs = (param) => {
  return {
    action: "SubAdd",
    subs: [changeParams(param)]
  };
};

export const subscribeToTicker = (tickerName, cb) => {
  const subscribers = tickersHandlers.get(tickerName) || [];
  tickersHandlers.set(tickerName, [...subscribers, cb]);
  sendMessageToWS(subscribeOnWS(tickerName));
};

export const unsubscribeFromTicker = (tickerName) => {
  tickersHandlers.delete(tickerName);
  sendMessageToWS(unSubscribeOnWS(tickerName));
};

window.ticker = tickersHandlers;
