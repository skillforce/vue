<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div class="container">
      <div class="w-full my-4"></div>
      <add-ticker @add-ticker="add" :tickers="tickers" />
      <div>
        <div>
          Filter
          <input
            v-model="filter"
            @input="page = 1"
            class="mt-1 block w-1/4 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            type="text"
          />
        </div>
        <div>
          <button
            @click="pageChangeBtn('decrement')"
            v-if="page > 1"
            class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            back
          </button>
          <button
            v-if="hasNextPage"
            @click="pageChangeBtn('increment')"
            class="my-4 ml-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            next
          </button>
        </div>
      </div>
      <template v-if="tickers.length">
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="t in paginatedTickers"
            :key="t.name"
            @click="select(t)"
            :class="{
              'border-4': selectedTicker === t,
              'bg-red-400': this.badTickers.indexOf(t.name) !== -1
            }"
            class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
          >
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ t.name }} - USD
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ formatPrice(t.price) }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              @click.stop="handleDelete(t)"
              class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              Удалить
            </button>
          </div>
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>
      <graphic-view
        v-if="selectedTicker"
        @unSelectTicker="unSelect"
        @recalculateGraphWidth="calculateMaxGraphElements"
        @mountGraphCalculate="calculateMaxGraphElements"
        :selectedTicker="selectedTicker"
        :graphElementWidth="graphElementWidth"
        :graph="graph"
      />
    </div>
  </div>
</template>

<script>
// [x] 1. Наличие в состоянии ЗАВИСИМЫХ ДАННЫХ | Критичность: 5+
// [x] 2. Запросы напрямую внутри компонента (???) | Критичность: 5
// [x] 3. При удалении остается подписка на загрузку тикера | Критичность: 5
// [x] 4. Обработка ошибок API | Критичность: 5
// [x] 5. Количество запросов | Критичность: 4
// [x] 6. При удалении тикера не изменяется localStorage | Критичность: 4
// [x] 7. Одинаковый код в watch | Критичность: 3
// [ ] 8. localStorage и анонимные вкладки | Критичность: 3
// [x] 9. График ужасно выглядит если будет много цен | Критичность: 2
// [+-] 10. Магические строки и числа (URL, 5000 миллисекунд задержки, ключ локал стораджа, количество на странице) |  Критичность: 1

// Параллельно
// [x] График сломан если везде одинаковые значения
// [x] При удалении тикера остается выбор

import { subscribeToTicker, unsubscribeFromTicker, BAD_TICKERS } from "@/api";
import AddTicker from "@/components/AddTicker.vue";
import GraphicView from "@/components/GraphicView";

export default {
  name: "App",
  components: {
    AddTicker,
    GraphicView
  },

  data() {
    return {
      filter: "",
      tickers: [],
      badTickers: BAD_TICKERS,

      selectedTicker: null,
      maxGraphElements: 1,
      graphElementWidth: 38,
      graph: [],

      page: 1
    };
  },
  async created() {
    const windowData = Object.fromEntries(
      new URL(window.location).searchParams.entries()
    );
    const VALID_KEYS = ["filter", "page"];

    VALID_KEYS.forEach((key) => {
      if (windowData[key]) {
        this[key] = windowData[key];
      }
    });
    const tickersData = localStorage.getItem("tickers");
    if (tickersData) {
      this.tickers = JSON.parse(tickersData);
      this.tickers.forEach((ticker) => {
        subscribeToTicker(ticker.name, this.updateTicker);
      });
    }
  },
  watch: {
    selectedTicker() {
      this.graph = [];
    },
    filter() {
      this.page = 1;
    },
    paginatedTickers() {
      if (this.paginatedTickers.length === 0 && this.page !== 1) {
        this.page -= 1;
      }
    },
    tickers() {
      localStorage.setItem("tickers", JSON.stringify(this.tickers));
    },
    pageStateOptions(value) {
      window.history.pushState(
        null,
        document.title,
        `${window.location.pathname}?filter=${value.filter}&page=${value.page}`
      );
    }
  },
  computed: {
    startIndex() {
      return (this.page - 1) * 6;
    },
    endIndex() {
      return this.page * 6;
    },
    hasNextPage() {
      return this.filteredTickers.length > this.endIndex;
    },
    filteredTickers() {
      return this.tickers.filter((t) =>
        t.name.includes(this.filter.toUpperCase())
      );
    },
    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
    },
    pageStateOptions() {
      return {
        page: this.page,
        filter: this.filter
      };
    }
  },
  methods: {
    unSelect() {
      this.selectedTicker = null;
    },
    add(ticker) {
      const currentTicker = {
        name: ticker
          .replace(/[^ \w]/g, "")
          .toUpperCase()
          .trim(),
        price: "-"
      };
      this.tickers = [...this.tickers, currentTicker];
      subscribeToTicker(currentTicker.name, this.updateTicker);
      this.filter = "";
    },
    updateTicker(tickerName, newPrice) {
      this.tickers
        .filter((t) => t.name === tickerName)
        .forEach((t) => {
          t.price = newPrice;
          if (t === this.selectedTicker) {
            this.graph.push(t.price);
            if (this.graph.length > this.maxGraphElements) {
              this.graph = this.graph.slice(
                this.graph.length - this.maxGraphElements
              );
            }
          }
        });
    },
    calculateMaxGraphElements(newClientWidth) {
      if (newClientWidth) {
        this.maxGraphElements = newClientWidth / this.graphElementWidth;
      }
    },
    formatPrice(price) {
      if (price === "-") {
        return price;
      }
      return price > 1 ? price?.toFixed(2) : price?.toPrecision(2);
    },
    select(ticker) {
      this.selectedTicker = ticker;
    },

    handleDelete(tickerToRemove) {
      this.tickers = this.tickers.filter((t) => t !== tickerToRemove);
      localStorage.setItem("tickers", JSON.stringify(this.tickers));
      unsubscribeFromTicker(tickerToRemove.name);
      if (this.selectedTicker === tickerToRemove) {
        this.selectedTicker = null;
      }
    },
    pageChangeBtn(method) {
      switch (method) {
        case "increment":
          this.page += 1;
          break;
        case "decrement":
          if (this.page > 1) {
            this.page -= 1;
          }
          break;
        default:
          break;
      }
    }
  }
};
</script>

<style></style>
