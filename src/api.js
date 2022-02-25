const API_KEY =
  "ce3fd966e7a1d10d65f907b20bf000552158fd3ed1bd614110baa0ac6cb57a7e";

export const tickersAPI = {
  getWholeCoinList: async () => {
    const res = await fetch(
      "https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
    );
    return await res.json();
  },
  getTickersInformation: async (tickers) => {
    const res = await fetch(
      `https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=${tickers.join(
        ","
      )}&api_key=${API_KEY}`
    );
    const rawData = await res.json();
    const normalizedData = Object.fromEntries(
      Object.entries(rawData).map(([key, value]) => [key, 1 / value])
    );
    return normalizedData;
  }
};
