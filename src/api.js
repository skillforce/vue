const API_KEY =
  "ce3fd966e7a1d10d65f907b20bf000552158fd3ed1bd614110baa0ac6cb57a7e";

const tickersHandlers = new Map(); //

export const tickersAPI = {
  getWholeCoinList: async () => {
    const res = await fetch(
      "https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
    );
    return await res.json();
  },
  getTickersInformation: async () => {
    if (tickersHandlers.size === 0) {
      return;
    }
    const res = await fetch(
      `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[
        ...tickersHandlers.keys()
      ].join(",")}&tsyms=USD&api_key=${API_KEY}`
    );
    const rawData = await res.json();
    const updatedPrices = Object.fromEntries(
      Object.entries(rawData).map(([key, value]) => [key, value.USD])
    );
    Object.entries(updatedPrices).forEach(([name, newPrice]) => {
      const handlers = tickersHandlers.get(name);
      handlers.forEach((fn) => fn(name, newPrice));
    });
  }
};

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
};

export const unsubscribeFromTicker = (tickerName) => {
  tickersHandlers.delete(tickerName);
};

window.ticker = tickersHandlers;
