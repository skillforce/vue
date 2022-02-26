const API_KEY =
  "ce3fd966e7a1d10d65f907b20bf000552158fd3ed1bd614110baa0ac6cb57a7e";

const tickers = new Map(); //

export const tickersAPI = {
  getWholeCoinList: async () => {
    const res = await fetch(
      "https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
    );
    return await res.json();
  },
  getTickersInformation: async (tickers) => {
    if (tickers.size === 0) {
      return;
    }
    console.log(tickers.keys());
    const res = await fetch(
      `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[
        ...tickers.keys()
      ].join(",")}&tsyms=USD&api_key=${API_KEY}`
    );
    const rawData = await res.json();
    console.log(rawData);
    // const normalizedData = Object.fromEntries(
    //   Object.entries(rawData).map(([key, value]) => [key, value.USD])
    // );

    // return normalizedData;
  }
};

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickers.get(ticker) || [];
  tickers.set(ticker, [...subscribers, cb]);
  console.log(tickers);
};

export const unsubscribeFromTicker = (ticker, cb) => {
  const subscribers = ticker.get(ticker) || [];
  tickers.set(
    ticker,
    subscribers.filter((fn) => fn !== cb)
  );
};

window.ticker = tickers;
