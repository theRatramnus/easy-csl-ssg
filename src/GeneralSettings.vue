<script setup>
import { reactive, watch } from 'vue';
import { Styler } from './styler';
import { currentLocalization } from './localization';
const uiTexts = currentLocalization()
const model = defineModel()
const settings = reactive(model.value)

watch(settings, (newVal) => {
    Styler.updateStyle()
})
</script>

<template>
    <h2 class="leadingText">{{ uiTexts.generalSettings }}</h2>
    <div class="flex-container">
        <div>
            <p>{{ uiTexts.styleName }}</p>
            <input type="text" v-model.lazy="settings.name" />
        </div>
        
        <div>
            <p>{{ uiTexts.styleAuthor }}</p>
            <input type="text" v-model.lazy="settings.author" />
        </div>

        <div>
            <p>{{ uiTexts.styleDescription }}</p>
            <input type="text" v-model.lazy="settings.description" />
        </div>
        
        <div>
            <p>{{ uiTexts.etalTerm }}</p>
            <input type="text" v-model.lazy="settings.etalTerm" />
        </div>
    </div>
</template>