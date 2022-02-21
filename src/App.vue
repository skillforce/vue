<template>
  <input v-model="ticker" v-on:keydown.enter="add" />
  <button @click="add">ADD</button>
  <template v-if="tickers.length">
    <div style="border: 2px solid grey">
      <div style="display: flex" v-for="t in tickers" :key="t.id">
        {{ t.id }} user: {{ t.title }}
        <button @click="deleteTick(t.id)">X</button>
      </div>
    </div>
  </template>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      ticker: "",
      tickers: [
        { title: "Denis", id: 1 },
        { title: "Olga", id: 2 },
        { title: "Polina", id: 3 }
      ]
    };
  },
  methods: {
    add() {
      const newTicker = {
        title: this.ticker,
        id: this.tickers.length + 1
      };
      this.ticker
        ? this.tickers.push(newTicker)
        : alert("Firstly enter any name!");
      this.ticker = null;
    },
    deleteTick(id) {
      this.tickers = this.tickers.filter((t) => t.id !== id);
    }
  }
};
</script>

<style></style>
