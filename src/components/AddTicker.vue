<template>
  <div v-if="loadingStatus === 'loading'">Processing...</div>
  <section v-if="loadingStatus === 'success'">
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700">
          Тикер
        </label>
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model="ticker"
            @keydown.enter="add"
            @keyup="hintsGenerator($event)"
            type="text"
            name="wallet"
            id="wallet"
            class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="Например DOGE"
            :class="{
              'border-red-700 border-2 focus:ring-red-700 focus:border-red-700':
                validationError
            }"
          />
        </div>
        <div class="text-red-700 font-bold" v-if="validationError">
          {{ validationError }}
        </div>
        <template v-if="hintsList.length > 0">
          <div class="flex">
            <div
              class="border-2 w-1/4 rounded-lg m-1 text-center p-1.5 cursor-pointer bg-gray-700 text-white"
              v-for="(hint, i) in hintsList"
              :key="i"
              @click="hintsUsingHandler(hint)"
            >
              {{ hint }}
            </div>
          </div>
        </template>
      </div>
    </div>
    <add-button @click="add" />
  </section>
</template>

<script>
import AddButton from "@/components/AddButton.vue";
import { tickersAPI } from "@/api";

export default {
  name: "AddTicker",
  components: {
    AddButton
  },
  data() {
    return {
      loadingStatus: "idle",
      kindOfTickers: [],
      ticker: "",
      hintsList: [],
      validationError: ""
    };
  },
  props: {
    tickers: {
      type: Array,
      required: true,
      default() {
        return [];
      }
    }
  },
  async created() {
    this.loadingStatus = "loading";
    try {
      const coinList = await tickersAPI.getWholeCoinList();
      const { Data } = await coinList;
      let correctTickersFullNameList = [];
      for (let t in Data) {
        // eslint-disable-next-line no-prototype-builtins
        if (Data.hasOwnProperty(t)) {
          correctTickersFullNameList.push(Data[t].FullName);
        }
      }
      this.kindOfTickers = correctTickersFullNameList;
      this.loadingStatus = "success";
    } catch (e) {
      this.loadingStatus = "error";
    }
  },
  methods: {
    hintsGenerator(e) {
      if (this.ticker === "") {
        this.hintsList = [];
      }
      if (e.code !== "Enter") {
        this.validationError = "";
      }
      if (/^[a-zA-Z0-9_.-]*$/.test(this.ticker) && this.ticker) {
        const hintsArr = this.kindOfTickers.filter(
          (t) => t.indexOf(this.ticker.toUpperCase()) !== -1
        );
        this.hintsList = hintsArr
          .splice(0, 4)
          .map((t) => t.match(/\((.*?)\)/)[1]);
      }
    },
    hintsUsingHandler(hint) {
      this.ticker = hint;
      this.$emit("add-ticker", this.ticker);
      this.ticker = "";
      this.hintsList = [];
    },
    add() {
      if (
        this.tickers.filter(
          (t) => t.name.toUpperCase() === this.ticker.toUpperCase()
        ).length > 0
      ) {
        this.validationError = "This coin is already in exist";
      } else {
        debugger;
        this.$emit("add-ticker", this.ticker);
        this.ticker = "";
        this.hintsList = [];
      }
    }
  }
};
</script>
