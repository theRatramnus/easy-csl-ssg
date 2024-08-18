<script setup>
import { watch, reactive } from 'vue'
import { stylers } from './styler'
import { currentLocalization } from './localization';
const uiTexts = currentLocalization()
const model = defineModel()
const settings = reactive(model.value)
const props = defineProps(['prefix'])
const prefix = props.prefix
function updateStylersWith(prefix) {
  for (const styler of stylers.filter((x) => x.info.prefix === prefix)) {
    styler.update()
  }
}

// eslint-disable-next-line no-unused-vars
watch(settings, (newVal) => {
  updateStylersWith(prefix)
})
</script>

<template>
  <h2>{{ uiTexts.settings }}</h2>
  <div class="flex-container">
    <div>
      <h3>{{ uiTexts.nameDelimiterSetting }}</h3>
      <p>{{ uiTexts.nameDelimiterSettingTooltip }}</p>
      <input type="text" v-model.lazy="settings.authorDelimiter" />
    </div>

    <div>
      <h3>{{ uiTexts.etAlMinSetting }}</h3>
      <p>{{ uiTexts.etAlMinSettingTooltip }}</p>
      <input type="text" v-model.lazy="settings.etalMin" />
    </div>
    
    <div>
      <h3>{{ uiTexts.abbreviateNamesSetting }}</h3>
      <p>{{ uiTexts.abbreviateNamesSettingTooltip }}</p>
      <input type="checkbox" v-model="settings.abbreviateNames" unchecked />
    </div>
  </div>
</template>
