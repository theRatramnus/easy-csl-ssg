import * as CSL from 'citeproc'

async function fetchTextFileContents(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.text() // Assuming the file is in text format
    return data
  } catch (error) {
    console.error('Error fetching the file:', error)
  }
}

export class CSLEngine {
  constructor(citationData, locale, sytle) {
    this.sytle = sytle
    this.locale = locale
    this.allItemIDs = []
    this.typeLookup = {}
    this.citations = {}
    this.updateItems(citationData)
    this.citeproc = new CSL.Engine(this, this.sytle)
  }
  updateItems(citationData) {
    this.allItemIDs = []
    this.typeLookup = {}
    this.citations = {}
    for (var i = 0, ilen = citationData.length; i < ilen; i++) {
      var item = citationData[i]
      if (!item.issued) continue
      if (item.URL) delete item.URL
      var id = item.id
      this.citations[id] = item
      this.allItemIDs.push(id)
      this.typeLookup[item.type] = id
    }
  }
  // lang is not used; managed differently
  // eslint-disable-next-line no-unused-vars
  retrieveLocale(lang) {
    return this.locale.locale
  }
  retrieveItem(id) {
    return this.citations[id]
  }
  updateStyle(style) {
    this.sytle = style
    this.citeproc = new CSL.Engine(this, this.sytle, this.locale.lang, this.locale.lang)
  }
  resetCiteproc() {
    this.citeproc = new CSL.Engine(this, this.sytle, this.locale.lang, this.locale.lang)
  }
  static async build(lang, citationData) {
    const style = await fetchTextFileContents(
      'https://raw.githubusercontent.com/citation-style-language/styles/master/chicago-fullnote-bibliography.csl'
    )
    const locale = await Locale.build(lang)
    return new CSLEngine(citationData, locale, style)
  }
  createBibliography(itemIDs) {
    this.citeproc.updateItems(itemIDs)
    return this.citeproc.makeBibliography()
  }
  createCitation(itemID) {
    this.citeproc.updateItems([itemID])
    const citation = {
      properties: {
        noteIndex: 0
      },
      citationItems: [
        {
          id: itemID
        }
      ]
    }
    return this.citeproc.processCitationCluster(citation, [] /*citationsPre*/, [] /*citationsPost*/)
  }
  previewBibliographyForType(type) {
    if (!this.typeLookup[type]) return 'type not found'
    const bibliography = this.createBibliography([this.typeLookup[type]])
    //console.log('created bibliography for', type, bibliography[0])
    return bibliography[1][0]
  }
  previewCitationForType(type) {
    if (!this.typeLookup[type]) return 'type not found'
    const result = this.createCitation(this.typeLookup[type])
    const citation = result[1][0][1]
    //console.log('created citation for', type, citation)
    return citation
  }
  previewCitationSpecials() {
    if (this.allItemIDs.length < 2) return 'not enough items'
    const createCitation = (id, noteIndex) => {
      return {
        properties: {
          noteIndex
        },
        citationItems: [
          {
            id
          }
        ]
      }
    }
    const item1 = this.allItemIDs[0]
    const item2 = this.allItemIDs[1]

    const rawCitations = []

    // base citation
    rawCitations.push(createCitation(item1, 1))
    // demonstrate ibid
    rawCitations.push(createCitation(item1, 2))
    // demonstrate subsequent
    rawCitations.push(createCitation(item2, 3))
    rawCitations.push(createCitation(item1, 4))

    const result = this.citeproc.rebuildProcessorState(rawCitations)
    //console.warn(result)

    // clean up
    const preview = {
      ibid: result[1][2],
      subsequent: result[3][2]
    }
    this.resetCiteproc()

    return preview
  }
  updateTerm(term, newValue) {
    this.locale.updateTerm(term, newValue)
  }
}

class Locale {
  constructor(lang, locale) {
    this.lang = lang
    this.locale = locale
    this.updatedTerms = {}
  }
  static async build(lang) {
    const locale = await fetchTextFileContents(
      `https://raw.githubusercontent.com/citation-style-language/locales/4fa753374e7998a2fa53edbfed13ed480095a484/locales-${lang}.xml`
    )
    return new Locale(lang, locale)
  }

  updateTerm(term, newValue) {
    // Parse the XML string into a DOM object
    var parser = new DOMParser()
    var xmlDoc = parser.parseFromString(this.locale, 'application/xml')

    // Find the <term name="et-al"> element
    var etAlTerm = xmlDoc.querySelector(`term[name="${term}"]`)

    // Check if the element exists
    if (etAlTerm) {
      // Update the value of the element
      etAlTerm.textContent = newValue
    }

    // Serialize the DOM object back to a string
    var serializer = new XMLSerializer()
    var updatedXmlString = serializer.serializeToString(xmlDoc)

    this.locale = updatedXmlString

    this.updatedTerms[term] = newValue

  }

  getLocaleUpdates() {
    return this.updatedTerms
  }

}

// eslint-disable-next-line no-unused-vars
const test = async () => {
  console.log('Fetching style...')
  const style = await fetchTextFileContents(
    'https://raw.githubusercontent.com/citation-style-language/styles/master/chicago-fullnote-bibliography.csl'
  )
  console.log('Style fetched.')
  console.log('Building engine...')
  const engine = await CSLEngine.build('de-DE', {} /*items*/, style)
  console.log('Engine built.')
  console.log('Creating bibliography...')
  const bibliography = engine.previewType('article-newspaper')
  console.log('Bibliography created.')
  console.log('Printing bibliography...')
  console.log(bibliography)
  console.log('Bibliography printed.')
}
