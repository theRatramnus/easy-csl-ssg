<script setup>
import { watch } from 'vue';
import { Styler, generalSettings } from './styler';
import { currentLocalization } from './localization';
const uiTexts = currentLocalization()


// eslint-disable-next-line no-unused-vars
watch(generalSettings, (newVal) => {
    Styler.updateStyle()
})

</script>

<template>
    <h2 class="leadingText">{{ uiTexts.generalSettings }}</h2>
    <div class="flex-container">
        <div>
            <p>{{ uiTexts.styleName }}</p>
            <input type="text" v-model.lazy="generalSettings.name" />
        </div>
        
        <div>
            <p>{{ uiTexts.styleAuthor }}</p>
            <input type="text" v-model.lazy="generalSettings.author" />
        </div>

        <div>
            <p>{{ uiTexts.styleDescription }}</p>
            <input type="text" v-model.lazy="generalSettings.description" />
        </div>
        
        <div>
            <p>{{ uiTexts.etalTerm }}</p>
            <input type="text" v-model.lazy="generalSettings.etalTerm" />
        </div>
    </div>
</template>