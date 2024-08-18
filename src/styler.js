import { citables } from './citables'
import { CSLEngine } from './csl-engine'
import { CSLCreator } from './csl-creator'
import { ref } from 'vue'
import { currentLocalization } from './localization'

const localization = currentLocalization()

export const STYLER_DEFAULTS = localization.stylerDefaults

export const STYLER_DESCRIPTIONS = localization.stylerDescriptions
const createStylerInfo = (type, prefix) => {
  return { type, prefix, id: prefix + '-' + type, name: STYLER_DESCRIPTIONS[type] }
}
const createInfos = (type) => {
  return Object.keys(STYLER_DEFAULTS).map((name) => {
    return createStylerInfo(name, type)
  })
}

export const generalSettings = localization.generalSettingsDefaults

export let bibSettings = {
  authorDelimiter: ', ',
  etalMin: 4,
  abbreviateNames: false
}
export let citSettings = {
  authorDelimiter: ', ',
  etalMin: 4,
  abbreviateNames: false
}
export let citSpecials = localization.citSpecialDefaults

export class Styler {
  static cslEngine = null
  static style = ref(null)
  static async createEngine() {
    const engine = await CSLEngine.build('de-DE', citables)
    Styler.cslEngine = engine
    Styler.style.value = engine.sytle
    return engine
  }
  constructor(info) {
    if (!Styler.cslEngine) {
      throw new Error('CSLEngine not initialized')
    }
    this.info = info
    this.output = ref('')
    this.code = ref(null)
    this.code.value = STYLER_DEFAULTS[info.type]
  }

  getCode() {
    return this.code
  }

  update() {
    const style = Styler.updateStyle()
    if (Styler.cslEngine) {
      Styler.cslEngine.updateStyle(style)
      switch (this.info.prefix) {
        case 'bib':
          this.output.value = Styler.cslEngine.previewBibliographyForType(this.info.type)
          break
        case 'cit':
          this.output.value = Styler.cslEngine.previewCitationForType(this.info.type)
          break
        default:
          this.output.value = 'prefix not found'
          break
      }
    }
  }

  static updateStyle() {
    const newStyle = generateStyle()
    Styler.style.value = newStyle
    return newStyle
  }
}

const styler_infos = createInfos('bib').concat(createInfos('cit'))

export let stylerDict = {}
export let stylers = []
export async function createStylers() {
  const engine = await Styler.createEngine()
  for (const info of styler_infos) {
    const newStyler = new Styler(info)
    stylerDict[info.id] = newStyler
    stylers.push(newStyler)
  }
  return engine
}

export function getStyle() {
  return Styler.style
}

export function getBibStylers() {
  return stylers.filter((x) => x.info.prefix === 'bib')
}

export function getCitStylers() {
  return stylers.filter((x) => x.info.prefix === 'cit')
}

export function getStylerIds(prefix) {
  return styler_infos.filter((x) => x.prefix === prefix).map((x) => x.id)
}

export function adoptCitationFromBibStylers() {
  //console.log('adoptCitationFromBibStylers()')
  const bibStylers = getBibStylers()
  const citStylers = getCitStylers()
  //console.log('bibStylers:', bibStylers)
  //console.log('citStylers:', citStylers)
  for (let i = 0; i < citStylers.length; i++) {
    //console.log(`Copying code from bibStylers[${i}] to citStylers[${i}]`)
    citStylers[i].code.value = bibStylers[i].code.value
    citStylers[i].update()
    //console.log(`citStylers[${i}].code:`, citStylers[i].code)
  }
}

const cslCreator = new CSLCreator(localization.cslDictionary)

function createGeneralInfo(title, name, summary) {
  return {
    title,
    name,
    summary
  }
}

function fetchStyleInfos() {
  const types = Object.keys(STYLER_DEFAULTS)
  const prefixes = ['bib', 'cit']

  let infos = {}

  for (const prefix of prefixes) {
    let info = {}
    for (const type of types) {
      const id = prefix + '-' + type
      const styler = stylerDict[id]
      const code = styler.code.value

      info[type] = code
    }
    infos[prefix] = info
  }
  return infos
}

function extractStyleInfos(infos) {
  for (const prefix of Object.keys(infos)) {
    const info = infos[prefix]
    for (const type of Object.keys(info)) {
      const id = prefix + '-' + type
      const styler = stylerDict[id]
      if (styler) {
        styler.code.value = info[type]
        
        styler.update()
      }
    }
  }
}

function generateStyle() {
  const info = packageInfo()

  const style = cslCreator.createStyle(info)

  return style
}

export function packageInfo() {
  const infos = fetchStyleInfos()

  const generalInfo = createGeneralInfo(generalSettings.name, generalSettings.author, generalSettings.description)

  Styler.cslEngine.locale.updateTerm('etal', generalSettings.etalTerm)
  Styler.cslEngine.updateTerm('ibid', citSpecials.ibidTerm)
  const locale = Styler.cslEngine.locale.getLocaleUpdates()

  const citInfoContent = {
    regular: infos.cit,
    special: citSpecials
  }

  const citInfo = {
    content: citInfoContent,
    settings: citSettings
  }

  const bibInfo = {
    content: infos.bib,
    settings: bibSettings
  }

  const info = {
    general: generalInfo,
    citation: citInfo,
    bibliography: bibInfo,
    locale: locale
  }
  return info
}


export function loadInfo(info) {
  extractStyleInfos({cit: info.citation.content.regular, bib: info.bibliography.content})

  Styler.cslEngine.locale.updateTerm('etal', info.general.etalTerm)
  Styler.cslEngine.updateTerm('ibid', info.citation.content.special.ibidTerm)

  generalSettings.name = info.general.title
  generalSettings.author = info.general.name
  generalSettings.description = info.general.summary

  citSpecials = info.citation.content.special

  citSettings = info.citation.settings

  bibSettings = info.bibliography.settings
}

