<template>
  <div>lalalal</div>
  <!--  <section>-->
  <!--    <div class="flex">-->
  <!--      <div class="max-w-xs">-->
  <!--        <label for="wallet" class="block text-sm font-medium text-gray-700">-->
  <!--          Тикер-->
  <!--        </label>-->
  <!--        <div class="mt-1 relative rounded-md shadow-md">-->
  <!--          <input-->
  <!--            v-model="ticker"-->
  <!--            @keydown.enter="add"-->
  <!--            @keyup="hintsGenerator($event)"-->
  <!--            type="text"-->
  <!--            name="wallet"-->
  <!--            id="wallet"-->
  <!--            class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"-->
  <!--            placeholder="Например DOGE"-->
  <!--            :class="{-->
  <!--              'border-red-700 border-2 focus:ring-red-700 focus:border-red-700':-->
  <!--                validationError-->
  <!--            }"-->
  <!--          />-->
  <!--        </div>-->
  <!--        <div class="text-red-700 font-bold" v-if="validationError">-->
  <!--          {{ validationError }}-->
  <!--        </div>-->
  <!--        <template v-if="hintsList.length > 0">-->
  <!--          <div class="flex">-->
  <!--            <div-->
  <!--              class="border-2 w-1/4 rounded-lg m-1 text-center p-1.5 cursor-pointer bg-gray-700 text-white"-->
  <!--              v-for="(hint, i) in hintsList"-->
  <!--              :key="i"-->
  <!--              @click="hintsUsingHandler(hint)"-->
  <!--            >-->
  <!--              {{ hint }}-->
  <!--            </div>-->
  <!--          </div>-->
  <!--        </template>-->
  <!--      </div>-->
  <!--    </div>-->
  <!--    <add-button @click="add" />-->
  <!--  </section>-->
</template>

<script>
// import AddButton from "@/components/AddButton.vue";

export default {
  name: "AddTicker",
  components: {
    // AddButton
  }
};
</script>
