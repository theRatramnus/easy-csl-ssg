<script setup>
import { reactive, watch, ref, onMounted, computed } from 'vue'
import { stylers, Styler } from './styler'
import HilightTextArea from './HighlightTextArea/HilightTextArea.vue';
import { currentLocalization } from './localization';
import { getSegments } from './syntax-highlighting';
const model = defineModel()
const settings = reactive(model.value)
const preview = ref({ ibid: 'loading', subsequent: 'loading' })
const uiTexts = currentLocalization()
function updateStylers() {
  //update all stylers with cit-prefix
  for (const styler of stylers.filter((x) => x.info.prefix === 'cit')) {
    styler.update()
  }
}
// eslint-disable-next-line no-unused-vars
watch(settings, (newVal) => {
  update()
})

function update() {
  try {
    updateStylers()
     preview.value = Styler.cslEngine.previewCitationSpecials()
  } catch (error) {
    console.error('Error loading data:', error)
  }
  
 
}

onMounted(() => {
  update()
})

const segmentsSubsequent = computed(() => {
  return getSegments(settings.subsequent)
});

const segmentsFirstNoteReferenceNumber = computed(() => {
  return getSegments(settings.firstNoteReferenceNumber)
});

</script>

<template>
  <h2>{{ uiTexts.subsequentCitations }}</h2>
  <div class="flex-container">
    <div>
      <p>{{ uiTexts.ibidTerm }}</p>
      <input type="text" v-model.lazy="settings.ibidTerm" />
    </div>
    <div class="output" v-html="preview.ibid"></div>
  </div>
  <div class="flex-container">
    <div>
      <p>{{ uiTexts.subsequentLabel }}</p>
      <HilightTextArea v-model.lazy="settings.subsequent" :initialValue="settings.subsequent" :segments="segmentsSubsequent" />
      <p>
        {{ uiTexts.abbreviateNamesSetting }}
      </p>
      <input type="checkbox" v-model.lazy="settings.abbreviateNamesSubsequent" unchecked />
      <p>
        {{uiTexts.cross_reference}}
      </p>
      <HilightTextArea v-model.lazy="settings.firstNoteReferenceNumber" :initialValue="settings.firstNoteReferenceNumber" :segments="segmentsFirstNoteReferenceNumber" />
    </div>
    <div class="output" v-html="preview.subsequent"></div>
  </div>

  
</template>

<style>
input {
  width: 100%;
}

</style>