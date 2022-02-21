<template>
  <input v-model="ticker" v-on:keydown.enter="add" />
  <button @click="add">ADD</button>
  <template v-if="tickers.length">
    <div class="userList">
      <div
        style="display: flex"
        v-for="t in tickers"
        :key="t.id"
        @click="selChange(t)"
        :class="{ activeUser: sel?.title === t.title }"
      >
        {{ t.id }} Currency: {{ t.title }}
        <button @click.stop="deleteTick(t.id)">X</button>
      </div>
    </div>
  </template>
  <div v-if="sel">
    <div>{{ sel.title }} : {{ sel.price }}</div>
    <button @click="sel = null">X</button>
    <div>
      History
      <div v-for="(bar, i) in graph" :key="i">
        {{ bar.time }} : {{ bar.value }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      ticker: "",
      tickers: [],
      sel: null,
      graph: []
    };
  },
  methods: {
    add() {
      const newTicker = {
        title: this.ticker,
        id: this.tickers.length + 1,
        price: "---"
      };
      this.ticker
        ? this.tickers.push(newTicker)
        : alert("Firstly enter any name!");
      this.ticker = null;
      setInterval(async () => {
        const f = await fetch(
          `https://min-api.cryptocompare.com/data/price?fsym=${newTicker.title}&tsyms=USD`
        );
        const res = await f.json();
        this.tickers.find((t) => t.id === newTicker.id).price =
          res.USD > 1 ? res.USD.toFixed(2) : res.USD.toPrecision(2);
        if (this.sel?.id === newTicker.id) {
          this.graph = [...this.graph, { time: new Date(), value: res.USD }];
        }
      }, 3000);
    },
    deleteTick(id) {
      this.tickers = this.tickers.filter((t) => t.id !== id);
    },
    selChange(newCurrency) {
      this.graph = [];
      this.sel = newCurrency;
    }
  }
};
</script>

<style src="./app.css"></style>
