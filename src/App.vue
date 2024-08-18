<script setup>
import { ref, onMounted } from 'vue'
import {
  stylers as rawStylers,
  createStylers,
  getStyle,
  adoptCitationFromBibStylers,
  getStylerIds,
  bibSettings,
  citSettings,
  citSpecials,
  generalSettings,
  packageInfo,
  loadInfo,
} from './styler'
import StylerComponent from './StylerComponent.vue'
//import XmlViewer from './XmlViewer/XmlViewer.vue'
import StylerSettings from './StylerSettings.vue'
import CitationSpecials from './CitationSpecials.vue'
import GeneralSettings from './GeneralSettings.vue'
import { currentLocalization } from './localization'
import HelpButton from './HelpButton.vue'

const uiTexts = currentLocalization()

const isLoading = ref(true)
const stylers = ref(null)
const loadFile = ref(null)
let style

async function loadData() {
  try {
    // Create the models
    await createStylers()
    // Load the data
    stylers.value = rawStylers
    style = getStyle()
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    isLoading.value = false // Set loading to false once data is loaded
  }
}

onMounted(() => {
  loadData()
})

function downloadFile(filename, text) {
  const element = document.createElement('a')
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
  element.setAttribute('download', filename)

  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

function saveCode(){
  downloadFile('csl.json', JSON.stringify(packageInfo()))
}

function loadCode(file) {
  const reader = new FileReader();
  reader.readAsText(file, "UTF-8");
  reader.onload = function (evt) {
    const info = JSON.parse(evt.target.result)
    loadInfo(info)
  }
}

</script>

<template>
  <div>
    <!-- Skeleton view -->
    <div v-if="isLoading" class="skeleton-view">
      <p>Loading...</p>
    </div>

    <!-- Actual content view -->
    <div v-else class="content-view">
      <div class="hStack">
        <h1>{{ uiTexts.appTitle }}</h1>
        <HelpButton></HelpButton>
      </div>

      <div class="hStack">
        <h2>{{ uiTexts.bibliography }}</h2>
      </div>
      <div v-for="id in getStylerIds('bib')" :key="id">
        <StylerComponent :stylerID="id"></StylerComponent>
      </div>
      <StylerSettings v-model="bibSettings" :prefix="'bib'" />
      <hr class="solid">
      <div class="hStack">
        <h2>{{ uiTexts.citation }}</h2>
        <button @click="adoptCitationFromBibStylers()">{{ uiTexts.sameAsBibliographyButton}}</button>
      </div>
      <div v-for="id in getStylerIds('cit')" :key="id">
        <StylerComponent :stylerID="id"></StylerComponent>
      </div>
      <StylerSettings v-model="citSettings" :prefix="'cit'"></StylerSettings>
      <CitationSpecials v-model="citSpecials"></CitationSpecials>
      <hr class="solid">
      <GeneralSettings v-model="generalSettings" ></GeneralSettings>
      <hr/>
      <div class="hStack">
        <div>
          <h2 class="leadingText">{{ uiTexts.downloadHeading }}</h2>
          <div class="hStack">
            <button class="download-button" @click="downloadFile('style.csl', style)">{{ uiTexts.exportButton }}</button>
            <button class="download-button" @click="saveCode()">{{ uiTexts.saveButton }}</button>
          </div>
          <hr/>
          <h2 class="leadingText">{{ uiTexts.openHeading }}</h2>
          <div class="hStack flex-start">
            <button class="download-button" @click="loadCode(loadFile)" v-if="loadFile">{{ uiTexts.loadButton }}</button>
            <input type="file" @change="loadFile = $event.target.files[0]" />
          </div>
          <hr/>
          <div>
            <h2 class="leadingText">{{ uiTexts.contributeHeading }}</h2>
            <a class="github-link leadingText" href="https://github.com/theRatramnus/easy-csl-ssg">
                <span> GitHub </span>
                <svg viewBox="2 0 16 16" width="20" height="16" aria-hidden="true"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path></svg>
              </a>
          </div>
        </div>
        <div>
          <p>{{ uiTexts.kofiGreeting }}</p>
          <iframe id='kofiframe' src='https://ko-fi.com/ludwigpatzold/?hidefeed=true&widget=true&embed=true&preview=true' class="kofi-widget" height='650' title='ludwigpatzold'></iframe>
        </div>
      </div>
      </div>
  </div>
</template>

<style>
.github-link {
    display: block;
    text-decoration: none;
    background: none;
    border: 0;
    color: var(--bs-nav-link-color);
}

.kofi-widget{
  min-width: 285px;
  max-width: 550px;
  width: 100vw;
  border:none;
}

.download-button {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  text-decoration: none;
  color: #ffffff;
  font-size: 18px;
  border-radius: 5px;
  width: 200px;
  height: 40px;
  transition: 0.3s;
  background-color: #000000;
}

.download-button:hover {
  opacity: .7;
}
/*! normalize.css v8.0.1 | MIT License | github.com/necolas/normalize.css */

/* Document
   ========================================================================== */

/**
 * 1. Correct the line height in all browsers.
 * 2. Prevent adjustments of font size after orientation changes in iOS.
 */

html {
  line-height: 1.15; /* 1 */
  -webkit-text-size-adjust: 100%; /* 2 */
}

/* Sections
   ========================================================================== */

/**
 * Remove the margin in all browsers.
 */

body {
  margin: 10;
  font-family: Arial, Helvetica, sans-serif;
}

/**
 * Render the `main` element consistently in IE.
 */

main {
  display: block;
}

/**
 * Correct the font size and margin on `h1` elements within `section` and
 * `article` contexts in Chrome, Firefox, and Safari.
 */

h1 {
  font-size: 2em;
  margin: 0.67em 0;
}

/* Grouping content
   ========================================================================== */

/**
 * 1. Add the correct box sizing in Firefox.
 * 2. Show the overflow in Edge and IE.
 */

hr {
  box-sizing: content-box; /* 1 */
  height: 0; /* 1 */
  overflow: visible; /* 2 */
}

/**
 * 1. Correct the inheritance and scaling of font size in all browsers.
 * 2. Correct the odd `em` font sizing in all browsers.
 */

pre {
  font-family: monospace, monospace; /* 1 */
  font-size: 1em; /* 2 */
}

/* Text-level semantics
   ========================================================================== */

/**
 * Remove the gray background on active links in IE 10.
 */

a {
  background-color: transparent;
}

/**
 * 1. Remove the bottom border in Chrome 57-
 * 2. Add the correct text decoration in Chrome, Edge, IE, Opera, and Safari.
 */

abbr[title] {
  border-bottom: none; /* 1 */
  text-decoration: underline; /* 2 */
  text-decoration: underline dotted; /* 2 */
}

/**
 * Add the correct font weight in Chrome, Edge, and Safari.
 */

b,
strong {
  font-weight: bolder;
}

/**
 * 1. Correct the inheritance and scaling of font size in all browsers.
 * 2. Correct the odd `em` font sizing in all browsers.
 */

code,
kbd,
samp {
  font-family: monospace, monospace; /* 1 */
  font-size: 1em; /* 2 */
}

/**
 * Add the correct font size in all browsers.
 */

small {
  font-size: 80%;
}

/**
 * Prevent `sub` and `sup` elements from affecting the line height in
 * all browsers.
 */

sub,
sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

sub {
  bottom: -0.25em;
}

sup {
  top: -0.5em;
}

/* Embedded content
   ========================================================================== */

/**
 * Remove the border on images inside links in IE 10.
 */

img {
  border-style: none;
}

/* Forms
   ========================================================================== */

/**
 * 1. Change the font styles in all browsers.
 * 2. Remove the margin in Firefox and Safari.
 */

button,
input,
optgroup,
select,
textarea {
  font-family: inherit; /* 1 */
  font-size: 100%; /* 1 */
  line-height: 1.15; /* 1 */
  margin: 0; /* 2 */
}

/**
 * Show the overflow in IE.
 * 1. Show the overflow in Edge.
 */

button,
input {
  /* 1 */
  overflow: visible;
}

/**
 * Remove the inheritance of text transform in Edge, Firefox, and IE.
 * 1. Remove the inheritance of text transform in Firefox.
 */

button,
select {
  /* 1 */
  text-transform: none;
}

/**
 * Correct the inability to style clickable types in iOS and Safari.
 */

button,
[type='button'],
[type='reset'],
[type='submit'] {
  -webkit-appearance: button;
}

/**
 * Remove the inner border and padding in Firefox.
 */

button::-moz-focus-inner,
[type='button']::-moz-focus-inner,
[type='reset']::-moz-focus-inner,
[type='submit']::-moz-focus-inner {
  border-style: none;
  padding: 0;
}

/**
 * Restore the focus styles unset by the previous rule.
 */

button:-moz-focusring,
[type='button']:-moz-focusring,
[type='reset']:-moz-focusring,
[type='submit']:-moz-focusring {
  outline: 1px dotted ButtonText;
}

/**
 * Correct the padding in Firefox.
 */

fieldset {
  padding: 0.35em 0.75em 0.625em;
}

/**
 * 1. Correct the text wrapping in Edge and IE.
 * 2. Correct the color inheritance from `fieldset` elements in IE.
 * 3. Remove the padding so developers are not caught out when they zero out
 *    `fieldset` elements in all browsers.
 */

legend {
  box-sizing: border-box; /* 1 */
  color: inherit; /* 2 */
  display: table; /* 1 */
  max-width: 100%; /* 1 */
  padding: 0; /* 3 */
  white-space: normal; /* 1 */
}

/**
 * Add the correct vertical alignment in Chrome, Firefox, and Opera.
 */

progress {
  vertical-align: baseline;
}

/**
 * Remove the default vertical scrollbar in IE 10+.
 */

textarea {
  overflow: auto;
}

/**
 * 1. Add the correct box sizing in IE 10.
 * 2. Remove the padding in IE 10.
 */

[type='checkbox'],
[type='radio'] {
  box-sizing: border-box; /* 1 */
  padding: 0; /* 2 */
}

/**
 * Correct the cursor style of increment and decrement buttons in Chrome.
 */

[type='number']::-webkit-inner-spin-button,
[type='number']::-webkit-outer-spin-button {
  height: auto;
}

/**
 * 1. Correct the odd appearance in Chrome and Safari.
 * 2. Correct the outline style in Safari.
 */

[type='search'] {
  -webkit-appearance: textfield; /* 1 */
  outline-offset: -2px; /* 2 */
}

/**
 * Remove the inner padding in Chrome and Safari on macOS.
 */

[type='search']::-webkit-search-decoration {
  -webkit-appearance: none;
}

/**
 * 1. Correct the inability to style clickable types in iOS and Safari.
 * 2. Change font properties to `inherit` in Safari.
 */

::-webkit-file-upload-button {
  -webkit-appearance: button; /* 1 */
  font: inherit; /* 2 */
}

/* Interactive
   ========================================================================== */

/*
 * Add the correct display in Edge, IE 10+, and Firefox.
 */

details {
  display: block;
}

/*
 * Add the correct display in all browsers.
 */

summary {
  display: list-item;
}

/* Misc
   ========================================================================== */

/**
 * Add the correct display in IE 10+.
 */

template {
  display: none;
}

/**
 * Add the correct display in IE 10.
 */

[hidden] {
  display: none;
}

.hStack {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}
.hStack > * {
  margin: 10px;
}

.leadingText{
  text-align: start !important;
}

/* Rounded border */
hr.rounded {
  border-top: 8px solid #bbb;
  border-radius: 5px;
}

/* Solid border */
hr.solid {
  color: inherit;
}
</style>
