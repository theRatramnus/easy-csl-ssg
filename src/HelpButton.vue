<script setup>
import { getLang, helpExistsIn } from './localization.js';
let helpWindow = null

function helpFileForLang(lang) {
  if (helpExistsIn.has(lang)) {
    return "help/" + lang + ".html"
  } else {
     return "help/en.html"
  }
  
}
async function openHelpWindow() {
  if (helpWindow) {
    helpWindow.close()
  }
  helpWindow = window.open(helpFileForLang(getLang()), '_blank');
}
</script>

<template>
<button class="help-button" @click="openHelpWindow">?</button>
</template>

<style>
.help-button {
  height: 2em;
  width: 2em;
  background: #ccc;
  font-size: 20px;
  line-height: 40px;
  text-align: center;
  border-radius: 50%;
  border: none;
  cursor: pointer;
}
</style>