const API_KEY =
  "16dcff85d37ccb3f100772438e5afd5c19d8295240290b1a4c7508fccef06c69";

const tickersHandlers = new Map();

const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);
const AGGREGATE_INDEX = "5";

socket.addEventListener("message", (e) => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice
  } = JSON.parse(e.data);
  if (type !== AGGREGATE_INDEX) {
    return;
  }

  const handlers = tickersHandlers.get(currency) || [];
  if (newPrice) {
    handlers.forEach((fn) => fn(currency, newPrice));
  }
});

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
