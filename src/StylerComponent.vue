<script setup>
import { stylerDict } from './styler'
import HilightTextArea from './HighlightTextArea/HilightTextArea.vue';
import { computed } from 'vue';
import { getSegments } from './syntax-highlighting';
const props = defineProps(['stylerID'])

const styler = stylerDict[props.stylerID]
const code = styler.getCode()

const segments = computed(() => {
  return getSegments(code.value)
});


styler.update()
</script>

<style>
.flex-container {
  display: flex;
  flex-wrap: nowrap;
}

.flex-container > div {
  background-color: #f1f1f1;
  width: 50%;
  margin: 10px;
  padding: 25px;
  padding-top: 10px;
  text-align: left;
  border-radius: 25px;
}
.flex-container > div.output {
  padding: 25px;
}

textarea {
  width: 95%;
  height: 8em;
  padding: 0.5em;
  font-family: monospace;
  font-size: 1.2em;
  color: #444;
  border: none;
  resize: none;
  border-radius: 0.5em;
}
</style>

<template>
  <div class="flex-container">
    <div>
      <h4>{{ styler.info.name }}</h4>
      <HilightTextArea
        v-model="code"
        :initialValue="code"
        :segments="segments"
        @input="styler.update()"
      >
      </HilightTextArea>
    </div>
    <div v-html="styler.output.value" class="output"></div>
  </div>
</template>
