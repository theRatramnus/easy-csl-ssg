var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { ViteSSG } from "vite-ssg/single-page";
import { ref, useSSRContext, mergeProps, resolveComponent, computed, unref, isRef, defineComponent, watch, mergeModels, useModel, reactive, onMounted } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain } from "vue/server-renderer";
import * as CSL from "citeproc";
import * as convert from "xml-js";
import { v4 } from "uuid";
const citables = [
  {
    id: "http://zotero.org/users/12253141/items/3667AIJ7",
    type: "book",
    "collection-title": "Grundlagen der Welterklärung",
    edition: "12., überarbeitete Auflage",
    "event-place": "Tübingen",
    publisher: "Vandenhoeck & Ruprecht",
    "publisher-place": "Tübingen",
    title: "Das beste Buch der Welt. Eine Einführung in 23 Kapiteln",
    "title-short": "Das beste Buch",
    volume: "23",
    author: [
      {
        family: "Patzold",
        given: "Ludwig"
      }
    ],
    issued: {
      "date-parts": [["2023"]]
    }
  },
  {
    id: "http://zotero.org/users/12253141/items/MX5MSYTL",
    type: "chapter",
    "collection-title": "Einführungen in den Unsinn",
    "container-title": "Große Widerlegungen der Weltgeschichte. Studien zu Nonsens",
    edition: "45. unveränderte Auflage",
    "event-place": "New York",
    page: "23–67",
    publisher: "De Gruyter",
    "publisher-place": "New York",
    title: "Das beste Kapitel der Welt. Eine Widerlegung von allem",
    "title-short": "Das beste Kapitel",
    volume: "12",
    author: [
      {
        family: "Müller",
        given: "Franz"
      }
    ],
    editor: [
      {
        family: "Max",
        given: "Mustermann"
      }
    ],
    issued: {
      "date-parts": [["2021"]]
    }
  },
  {
    id: "http://zotero.org/users/12253141/items/5BC6NWIT",
    type: "article-journal",
    "container-title": "Viking Studies",
    page: "23–45",
    title: "Die Wikinger bei Wikingen. Studien zu einem Massengrab",
    "title-short": "Die Wikinger",
    volume: "26",
    author: [
      {
        family: "Wickie",
        given: "Willibald"
      }
    ],
    issued: {
      "date-parts": [["2019"]]
    }
  },
  {
    id: "http://zotero.org/users/12253141/items/MSA45HBC",
    type: "article-newspaper",
    "container-title": "MGH SS rer. Germ. N.S.",
    volume: 9,
    "event-place": "Hannover",
    "publisher-place": "Hannover",
    title: "Chronicon",
    author: [
      {
        family: "Thietmar",
        given: ""
      }
    ],
    contributor: [
      {
        family: "Holtzmann",
        given: "Robert"
      }
    ],
    issued: {
      "date-parts": [["1939"]]
    }
  },
  {
    id: "http://zotero.org/users/12253141/items/EUMYFUEA",
    type: "entry-encyclopedia",
    "container-title": "Lexikon des Mittelalters",
    "event-place": "Zürich",
    page: "1012–1014",
    publisher: "Artemis",
    "publisher-place": "Zürich",
    title: "Blödsinn",
    volume: "3",
    author: [
      {
        family: "Walkes",
        given: "Otto"
      }
    ],
    issued: {
      "date-parts": [["1996"]]
    }
  }
];
async function fetchTextFileContents(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.text();
    return data;
  } catch (error) {
    console.error("Error fetching the file:", error);
  }
}
class CSLEngine {
  constructor(citationData, locale, sytle) {
    this.sytle = sytle;
    this.locale = locale;
    this.allItemIDs = [];
    this.typeLookup = {};
    this.citations = {};
    this.updateItems(citationData);
    this.citeproc = new CSL.Engine(this, this.sytle);
  }
  updateItems(citationData) {
    this.allItemIDs = [];
    this.typeLookup = {};
    this.citations = {};
    for (var i = 0, ilen = citationData.length; i < ilen; i++) {
      var item = citationData[i];
      if (!item.issued) continue;
      if (item.URL) delete item.URL;
      var id = item.id;
      this.citations[id] = item;
      this.allItemIDs.push(id);
      this.typeLookup[item.type] = id;
    }
  }
  // lang is not used; managed differently
  // eslint-disable-next-line no-unused-vars
  retrieveLocale(lang) {
    return this.locale.locale;
  }
  retrieveItem(id) {
    return this.citations[id];
  }
  updateStyle(style) {
    this.sytle = style;
    this.citeproc = new CSL.Engine(this, this.sytle, this.locale.lang, this.locale.lang);
  }
  resetCiteproc() {
    this.citeproc = new CSL.Engine(this, this.sytle, this.locale.lang, this.locale.lang);
  }
  static async build(lang, citationData) {
    const style = await fetchTextFileContents(
      "https://raw.githubusercontent.com/citation-style-language/styles/master/chicago-fullnote-bibliography.csl"
    );
    const locale = await Locale.build(lang);
    return new CSLEngine(citationData, locale, style);
  }
  createBibliography(itemIDs) {
    this.citeproc.updateItems(itemIDs);
    return this.citeproc.makeBibliography();
  }
  createCitation(itemID) {
    this.citeproc.updateItems([itemID]);
    const citation = {
      properties: {
        noteIndex: 0
      },
      citationItems: [
        {
          id: itemID
        }
      ]
    };
    return this.citeproc.processCitationCluster(
      citation,
      [],
      []
      /*citationsPost*/
    );
  }
  previewBibliographyForType(type) {
    if (!this.typeLookup[type]) return "type not found";
    const bibliography = this.createBibliography([this.typeLookup[type]]);
    return bibliography[1][0];
  }
  previewCitationForType(type) {
    if (!this.typeLookup[type]) return "type not found";
    const result = this.createCitation(this.typeLookup[type]);
    const citation = result[1][0][1];
    return citation;
  }
  previewCitationSpecials() {
    if (this.allItemIDs.length < 2) return "not enough items";
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
      };
    };
    const item1 = this.allItemIDs[0];
    const item2 = this.allItemIDs[1];
    const rawCitations = [];
    rawCitations.push(createCitation(item1, 1));
    rawCitations.push(createCitation(item1, 2));
    rawCitations.push(createCitation(item2, 3));
    rawCitations.push(createCitation(item1, 4));
    const result = this.citeproc.rebuildProcessorState(rawCitations);
    const preview = {
      ibid: result[1][2],
      subsequent: result[3][2]
    };
    this.resetCiteproc();
    return preview;
  }
  updateTerm(term, newValue) {
    this.locale.updateTerm(term, newValue);
  }
}
class Locale {
  constructor(lang, locale) {
    this.lang = lang;
    this.locale = locale;
    this.updatedTerms = {};
  }
  static async build(lang) {
    const locale = await fetchTextFileContents(
      `https://raw.githubusercontent.com/citation-style-language/locales/4fa753374e7998a2fa53edbfed13ed480095a484/locales-${lang}.xml`
    );
    return new Locale(lang, locale);
  }
  updateTerm(term, newValue) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(this.locale, "application/xml");
    var etAlTerm = xmlDoc.querySelector(`term[name="${term}"]`);
    if (etAlTerm) {
      etAlTerm.textContent = newValue;
    }
    var serializer = new XMLSerializer();
    var updatedXmlString = serializer.serializeToString(xmlDoc);
    this.locale = updatedXmlString;
    this.updatedTerms[term] = newValue;
  }
  getLocaleUpdates() {
    return this.updatedTerms;
  }
}
function wrapCSLPart(part, content) {
  return `<${part}><layout>${content}</layout></${part}>`;
}
function getCurrentXMLTimestamp() {
  const now = /* @__PURE__ */ new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const hours = String(now.getUTCHours()).padStart(2, "0");
  const minutes = String(now.getUTCMinutes()).padStart(2, "0");
  const seconds = String(now.getUTCSeconds()).padStart(2, "0");
  const timestamp = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+00:00`;
  return timestamp;
}
class CSLCreator {
  constructor(cslDictionary) {
    this.nameDelimiter = ", ";
    this.et_al_min = 3;
    this.abbreviateNames = true;
    this.cslDictionary = cslDictionary;
  }
  setCreatorParameters(info) {
    this.nameDelimiter = info.authorDelimiter;
    this.et_al_min = info.etalMin;
    this.abbreviateNames = info.abbreviateNames;
  }
  parsePlaceholdersAndText(text) {
    const regex = /([{][^{}]*[}]|[[][^[\]]*[\]]|[<][^<>]*[>])|([^{}<>[\]]+)/g;
    const matches = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match[1]) {
        let type;
        let content = match[1].slice(1, -1);
        switch (match[1][0]) {
          case "{":
            type = "facultative";
            matches.push({ content: this.parseNestedPlaceholders(content), styling: null, type });
            break;
          case "[":
            type = "group";
            matches.push({ content: this.parseNestedPlaceholders(content), styling: null, type });
            break;
          case "<":
            type = "variable";
            matches.push(this.createPlaceholderObject(this.evaluateStyling(content), type));
            break;
          default:
            type = "unknown";
            matches.push({ content, type });
        }
      } else if (match[2]) {
        matches.push({ content: match[2], type: "text", styling: null });
        if (match[2].includes("<")) {
          console.warn("Found < in ", match[2]);
        }
      }
    }
    return matches;
  }
  evaluateStyling(input) {
    const regex = /\(..?\)/g;
    const stylings = input.match(regex);
    const content = input.split("(")[0];
    let result = "";
    if (stylings) {
      for (const found of stylings) {
        switch (found) {
          case "(sc)":
            result += 'font-variant="small-caps" ';
            break;
          case "(i)":
            result += 'font-style="italic" ';
            break;
          case "(b)":
            result += 'font-weight="bold" ';
            break;
        }
      }
    }
    return { styling: result, content };
  }
  createPlaceholderObject(object, type) {
    return { ...object, type };
  }
  parseNestedPlaceholders(content) {
    const nestedRegex = /([{][^{}]*[}]|[[][^[\]]*[\]]|[<][^<>]*[>])/g;
    const results = [];
    let nestedMatch;
    let lastIndex = 0;
    while ((nestedMatch = nestedRegex.exec(content)) !== null) {
      if (nestedMatch.index > lastIndex) {
        results.push({ content: content.substring(lastIndex, nestedMatch.index), type: "text" });
      }
      if (nestedMatch[0].charAt(0) === "<") {
        results.push(
          this.createPlaceholderObject(
            this.evaluateStyling(nestedMatch[0].slice(1, -1)),
            "variable"
          )
        );
        lastIndex = nestedMatch.index + nestedMatch[0].length;
      } else if (nestedMatch[0].charAt(0) === "[") {
        results.push({
          content: this.parseNestedPlaceholders(nestedMatch[0].slice(1, -1)),
          styling: null,
          type: "group"
        });
      } else {
        results.push({ content: content.substring(lastIndex, nestedMatch.index), type: "text" });
      }
    }
    if (lastIndex < content.length) {
      const textCandidate = content.substring(lastIndex);
      if (!textCandidate.includes("<")) {
        results.push({ content: textCandidate, type: "text", styling: null });
      } else {
        const newCandidate = textCandidate.split("]")[1];
        if (!newCandidate.includes("<")) {
          results.push({ content: newCandidate, type: "text", styling: null });
        }
      }
    }
    return results.length ? results : content;
  }
  // Example usage
  /*const inputString = "[Autor<Vorname(i)(b)(sc)><Name>], <Titel(sc)>{ (<Reihentitel(b)>, }{<Bd.-Nr.>)}, <Ort(i)>: <Verlagsname>, {<Auflage>, }<Jahr>";
  const placeholders = parsePlaceholdersAndText(inputString);
  console.log(JSON.stringify({ placeholders }));*/
  createTextCSLBlock(placeholder) {
    return `<text value="${placeholder.content}"/>`;
  }
  // Create CSL block for a variable placeholder
  createVariableCSLBlock(placeholder) {
    let variableInfo = this.cslDictionary[placeholder.content];
    if (typeof variableInfo === "string") {
      return `<text variable="${variableInfo}" ${placeholder.styling ? placeholder.styling : ""} />`;
    } else if (variableInfo.type === "date") {
      return `<date ${variableInfo.content} />`;
    } else if (variableInfo.type === "variable") {
      return `<text ${variableInfo.content} />`;
    }
  }
  // Create CSL block based on placeholder type
  createCSLBlock(placeholder) {
    let result = "";
    switch (placeholder.type) {
      case "text":
        result += this.createTextCSLBlock(placeholder);
        break;
      case "variable":
        result += this.createVariableCSLBlock(placeholder);
        break;
      case "group":
        result += this.createCSLGroupBlock(placeholder);
        break;
      case "facultative":
        result += `<choose><if variable="${this.determineIfVariable(placeholder.content)}" match="any">${placeholder.content.reduce(
          (accumulator, currentValue) => accumulator + this.createCSLBlock(currentValue),
          ""
        )}</if></choose>`;
        break;
    }
    result += "\n";
    return result;
  }
  determineIfVariable(content) {
    const variable = content.find((el) => el.type === "variable");
    if (variable) {
      const dictKey = variable.content;
      let dictEntry = this.cslDictionary[dictKey];
      if (!(typeof dictEntry === "string")) {
        return dictEntry.variable;
      }
      return dictEntry;
    } else {
      const name = content.find((el) => el.type === "group");
      const dictKey = name.content[0].content;
      const dictEntry = this.cslDictionary[dictKey];
      return dictEntry.name;
    }
  }
  // Create CSL group block for group placeholders
  createCSLGroupBlock(placeholder) {
    const nachvorvorname = placeholder.content[1].content === "Name";
    let result;
    try {
      result = `<names variable="${this.cslDictionary[placeholder.content[0].content].name}">
`;
      result += `<name delimiter="${this.nameDelimiter}" et-al-min="${this.et_al_min}" et-al-use-first="${1}" ${nachvorvorname ? 'name-as-sort-order="first"' : ""} ${this.abbreviateNames ? `initialize-with=". "` : ""} ${placeholder.content.length > 2 ? "" : `form="short"`} >
`;
      for (const part of placeholder.content.slice(1)) {
        result += `<name-part name="${this.cslDictionary[part.content].namePart}" ${part.styling ? part.styling : ""} />
`;
      }
      result += "</name>\n</names>\n";
    } catch (error) {
      result = "<!-- ERROR: " + error + " -->\n";
      console.error(result);
    }
    return result;
  }
  // Create CSL representation for all placeholders
  createCSL(text) {
    const placeholders = this.parsePlaceholdersAndText(text);
    let result = "";
    for (let placeholder of placeholders) {
      if (placeholder.type === "group") {
        result += this.createCSLGroupBlock(placeholder);
      } else {
        result += this.createCSLBlock(placeholder);
      }
    }
    return result;
  }
  createStyle(info) {
    let text = this.createRawStyle(info);
    const convertOptions = { compact: false, spaces: 4 };
    var jsonRepresentation = convert.xml2json(text, convertOptions);
    text = convert.json2xml(jsonRepresentation, convertOptions);
    return text;
  }
  createTypeChooser(info) {
    let result = "";
    const types = Object.keys(info);
    for (const type of types) {
      result += `<choose><if type="${type}" match="any">${this.createCSL(info[type])}</if></choose>`;
    }
    return result;
  }
  createCitation(info) {
    const citInfo = info.special;
    const firstPositionCSL = this.createTypeChooser(info.regular);
    this.abbreviateNames = citInfo.abbreviateNamesSubsequent;
    const subsequentCSL = this.createCSL(citInfo.subsequent);
    const firstReferenceNoteNumberCSL = this.createCSL(citInfo.firstNoteReferenceNumber);
    const special = `
    <choose>
        <if match="any" position="ibid">
          <text term="ibid"/>
        </if>
        
        <else>
          <choose>
            <if match="any" position="subsequent">
             ${subsequentCSL}
            </if>
          </choose>
          <choose>
            <if variable="first-reference-note-number">
            ${firstReferenceNoteNumberCSL}
            </if>
        </choose>
        </else>
    </choose>
`;
    const content = `<choose><if match="all" position="first">` + firstPositionCSL + "</if></choose>" + special;
    return wrapCSLPart("citation", content);
  }
  createStyleHead(info) {
    return `
  <?xml version="1.0" encoding="utf-8"?>
<style xmlns="http://purl.org/net/xbiblio/csl" class="note" version="1.0" demote-non-dropping-particle="never" default-locale="de">
  <info>
    <title>${info.title}</title>
    <id>${v4()}</id>
    <author>
      <name>${info.name}</name>
    </author>
    <contributor>
      <name>Ludwig Patzold</name>
    </contributor>
    <summary>${info.summary}</summary>
    <updated>${getCurrentXMLTimestamp()}</updated>
    <category citation-format="note"/>
  </info>`;
  }
  bundleLocaleUpdates(updatedTerms) {
    let result = "<locale><terms>";
    result += Object.keys(updatedTerms).reduce((accumulator, currentValue) => accumulator + `<term name="${currentValue}">${updatedTerms[currentValue]}</term>`, "");
    result += "</terms></locale>";
    return result;
  }
  createRawStyle(info) {
    let result = "";
    result += this.createStyleHead(info.general);
    result += this.bundleLocaleUpdates(info.locale);
    this.setCreatorParameters(info.bibliography.settings);
    result += wrapCSLPart("bibliography", this.createTypeChooser(info.bibliography.content));
    this.setCreatorParameters(info.citation.settings);
    result += this.createCitation(info.citation.content);
    result += "</style>";
    return result;
  }
}
const en = {
  appTitle: "CSL Style Generator",
  bibliography: "Bibliography",
  settings: "Settings",
  nameDelimiterSetting: "name delimiter",
  nameDelimiterSettingTooltip: "in case there are multiple names",
  etAlMinSetting: "et al. min",
  etAlMinSettingTooltip: "minimum number of authors to use et al.",
  abbreviateNamesSetting: "abbreviate names",
  abbreviateNamesSettingTooltip: "e.g. J. Doe",
  citation: "Citation",
  sameAsBibliographyButton: "same as bibliography",
  subsequentCitations: "Subsequent Citations",
  ibidTerm: "ibid. term",
  subsequentLabel: "subsequent occurence",
  cross_reference: "cross-reference",
  generalSettings: "General Settings",
  styleName: "style name",
  styleAuthor: "your name",
  styleDescription: "description",
  etalTerm: "et al. term",
  downloadHeading: "Save Your Work",
  openHeading: "Open",
  saveButton: "Save",
  loadButton: "Load",
  exportButton: "Export",
  viewerHeading: "View Style",
  stylerDefaults: {
    book: "[author<given><family(sc)>], <title(i)>{ (<collection>}{, <volumeNumber>)}, <place>: <publisher>, {<edition>, }<year>",
    chapter: "[author<given><family(sc)>], <title>, in: [editor<given><family>] (Hg.), <volumeTitle(i)>{ (<collection>}{, <volumeNumber>)}, <place>: <publisher>, {<edition>, }<year>, S. <pages>",
    "article-journal": "[author<given><family(sc)>], <title>, in: <journal(i)> <volumeNumber> (<year>), S. <pages>",
    "entry-encyclopedia": `[author<given><family(sc)>], Art. <title>, in: <encyclopedia(i)> <volumeNumber> (<year>), Sp. <pages>`,
    "article-newspaper": "{[author<family>], }<title>, ed. [contributor<given><family(sc)>] (<journal> <volumeNumber>), <place> <year>{, S. <pages>}"
  },
  citSpecialDefaults: {
    ibidTerm: "ibid.",
    firstNoteReferenceNumber: " (see <footnote>)",
    subsequent: "[author<family(sc)>], <shortTitle>",
    abbreviateNamesSubsequent: false
  },
  stylerDescriptions: {
    book: "Book",
    chapter: "Chapter",
    "article-journal": "Journal article",
    "entry-encyclopedia": "Encyclopedia entry",
    "article-newspaper": "Newspaper article"
  },
  cslDictionary: {
    year: {
      type: "date",
      content: 'date-parts="year" form="text" variable="issued"',
      variable: "issued"
    },
    author: {
      type: "name",
      name: "author"
    },
    editor: {
      type: "name",
      name: "editor"
    },
    contributor: { type: "name", name: "contributor" },
    given: { type: "namePart", namePart: "given" },
    family: { type: "namePart", namePart: "family" },
    title: "title",
    volumeTitle: "container-title",
    journal: "container-title",
    encyclopedia: "container-title",
    collection: "collection-title",
    volumeNumber: "volume",
    place: "publisher-place",
    publisher: "publisher",
    edition: "edition",
    pages: "page",
    shortTitle: {
      type: "variable",
      content: `variable="title" form="short"`
    },
    footnote: "first-reference-note-number"
  },
  generalSettingsDefaults: {
    etalTerm: "et al.",
    name: "style",
    author: "John Doe",
    description: "description"
  }
};
const de = {
  appTitle: "CSL-Stil-Generator",
  bibliography: "Bibliographie",
  settings: "Einstellungen",
  nameDelimiterSetting: "Trennzeichen für Namen",
  nameDelimiterSettingTooltip: "falls es mehrere Namen gibt",
  etAlMinSetting: '"et al."-min',
  etAlMinSettingTooltip: 'Mindestanzahl von Namen für "et al."',
  abbreviateNamesSetting: "Vornamen abkürzen",
  abbreviateNamesSettingTooltip: "mit Punkt, z. B. M. Mustermann",
  citation: "Fußnoten",
  sameAsBibliographyButton: 'von "Bibliographie" übernehmen',
  subsequentCitations: "Kurzzitate",
  ibidTerm: "ibid.-Form",
  subsequentLabel: "Form des Kurzzitats",
  cross_reference: "Querverweis",
  generalSettings: "Informationen zum Stil",
  styleName: "Name des Stils",
  styleAuthor: "Ihr Name",
  styleDescription: "Beschreibung des Stils",
  etalTerm: "et al.-Form",
  downloadHeading: "Sichern",
  saveButton: "Speichern",
  loadButton: "Laden",
  exportButton: "Exportieren",
  viewerHeading: "Ansehen",
  openHeading: "Öffnen",
  stylerDefaults: {
    book: "[Autor<Vorname><Name(sc)>], <Titel(i)>{ (<Reihentitel>}{, <Bd.-Nr.>)}, <Ort>: <Verlagsname>, {<Auflage>, }<Jahr>",
    chapter: "[Autor<Vorname><Name(sc)>], <Titel>, in: [Herausgeber<Vorname><Name>] (Hg.), <Bandtitel(i)>{ (<Reihentitel>}{, <Bd.-Nr.>)}, <Ort>: <Verlagsname>, {<Auflage>, }<Jahr>, S. <Seitenzahlen>",
    "article-journal": "[Autor<Vorname><Name(sc)>], <Titel>, in: <Zeitschrift(i)> <Bd.-Nr.> (<Jahr>), S. <Seitenzahlen>",
    "entry-encyclopedia": `[Autor<Vorname><Name(sc)>], Art. <Titel>, in: <Lexikon(i)> <Bd.-Nr.> (<Jahr>), Sp. <Seitenzahlen>`,
    "article-newspaper": "{[Autor<Name>], }<Titel>, ed. [Editor<Vorname><Name(sc)>] (<Zeitschrift> <Bd.-Nr.>), <Ort> <Jahr>{, S. <Seitenzahlen>}"
  },
  stylerDescriptions: {
    book: "Buch",
    chapter: "Aufsatz in einem Sammelband",
    "article-journal": "Zeitschriftenartikel",
    "entry-encyclopedia": "Lexikoneintrag",
    "article-newspaper": "Zeitungsartikel"
  },
  citSpecialDefaults: {
    ibidTerm: "ibid.",
    firstNoteReferenceNumber: " (wie Anm. <FN>)",
    subsequent: "[Autor<Name(sc)>], <Kurztitel>",
    abbreviateNamesSubsequent: false
  },
  cslDictionary: {
    Jahr: {
      type: "date",
      content: 'date-parts="year" form="text" variable="issued"',
      variable: "issued"
    },
    Autor: { type: "name", name: "author" },
    Herausgeber: { type: "name", name: "editor" },
    Vorname: { type: "namePart", namePart: "given" },
    Name: { type: "namePart", namePart: "family" },
    Titel: "title",
    Bandtitel: "container-title",
    Zeitschrift: "container-title",
    Lexikon: "container-title",
    Reihentitel: "collection-title",
    "Bd.-Nr.": "volume",
    Ort: "publisher-place",
    Verlagsname: "publisher",
    Auflage: "edition",
    Seitenzahlen: "page",
    Editor: { type: "name", name: "contributor" },
    Kurztitel: {
      type: "variable",
      content: `variable="title" form="short"`
    },
    FN: "first-reference-note-number"
  },
  generalSettingsDefaults: {
    etalTerm: "et al.",
    name: "Stil",
    author: "Max Mustermann",
    description: "Beschreibung"
  }
};
const languages = {
  "de-DE": de,
  en
};
function getLang() {
  if (navigator.languages != void 0)
    return navigator.languages[0];
  return navigator.language;
}
const currentLocalization = () => {
  return languages[getLang()] || en;
};
function getLocalizedCSLTerms() {
  const dict = currentLocalization().cslDictionary;
  const terms2 = Object.keys(dict);
  const nameTerms = [];
  const variableTerms = [];
  const namePartTerms = [];
  for (const term of terms2) {
    if (dict[term].name) {
      nameTerms.push(term);
    } else if (dict[term].namePart) {
      namePartTerms.push(term);
    } else {
      variableTerms.push(term);
    }
  }
  return { nameTerms, namePartTerms, variableTerms };
}
const localization = currentLocalization();
const STYLER_DEFAULTS = localization.stylerDefaults;
const STYLER_DESCRIPTIONS = localization.stylerDescriptions;
const createStylerInfo = (type, prefix) => {
  return { type, prefix, id: prefix + "-" + type, name: STYLER_DESCRIPTIONS[type] };
};
const createInfos = (type) => {
  return Object.keys(STYLER_DEFAULTS).map((name) => {
    return createStylerInfo(name, type);
  });
};
const generalSettings = localization.generalSettingsDefaults;
let bibSettings = {
  authorDelimiter: ", ",
  etalMin: 4,
  abbreviateNames: false
};
let citSettings = {
  authorDelimiter: ", ",
  etalMin: 4,
  abbreviateNames: false
};
let citSpecials = localization.citSpecialDefaults;
const _Styler = class _Styler {
  static async createEngine() {
    const engine = await CSLEngine.build("de-DE", citables);
    _Styler.cslEngine = engine;
    _Styler.style.value = engine.sytle;
    return engine;
  }
  constructor(info) {
    if (!_Styler.cslEngine) {
      throw new Error("CSLEngine not initialized");
    }
    this.info = info;
    this.output = ref("");
    this.code = ref(null);
    this.code.value = STYLER_DEFAULTS[info.type];
  }
  getCode() {
    return this.code;
  }
  update() {
    const style = _Styler.updateStyle();
    if (_Styler.cslEngine) {
      _Styler.cslEngine.updateStyle(style);
      switch (this.info.prefix) {
        case "bib":
          this.output.value = _Styler.cslEngine.previewBibliographyForType(this.info.type);
          break;
        case "cit":
          this.output.value = _Styler.cslEngine.previewCitationForType(this.info.type);
          break;
        default:
          this.output.value = "prefix not found";
          break;
      }
    }
  }
  static updateStyle() {
    const newStyle = generateStyle();
    _Styler.style.value = newStyle;
    return newStyle;
  }
};
__publicField(_Styler, "cslEngine", null);
__publicField(_Styler, "style", ref(null));
let Styler = _Styler;
const styler_infos = createInfos("bib").concat(createInfos("cit"));
let stylerDict = {};
let stylers = [];
async function createStylers() {
  const engine = await Styler.createEngine();
  for (const info of styler_infos) {
    const newStyler = new Styler(info);
    stylerDict[info.id] = newStyler;
    stylers.push(newStyler);
  }
  return engine;
}
function getStyle() {
  return Styler.style;
}
function getStylerIds(prefix) {
  return styler_infos.filter((x) => x.prefix === prefix).map((x) => x.id);
}
const cslCreator = new CSLCreator(localization.cslDictionary);
function createGeneralInfo(title, name, summary) {
  return {
    title,
    name,
    summary
  };
}
function fetchStyleInfos() {
  const types = Object.keys(STYLER_DEFAULTS);
  const prefixes = ["bib", "cit"];
  let infos = {};
  for (const prefix of prefixes) {
    let info = {};
    for (const type of types) {
      const id = prefix + "-" + type;
      const styler = stylerDict[id];
      const code = styler.code.value;
      info[type] = code;
    }
    infos[prefix] = info;
  }
  return infos;
}
function generateStyle() {
  const info = packageInfo();
  const style = cslCreator.createStyle(info);
  return style;
}
function packageInfo() {
  const infos = fetchStyleInfos();
  const generalInfo = createGeneralInfo(generalSettings.name, generalSettings.author, generalSettings.description);
  Styler.cslEngine.locale.updateTerm("etal", generalSettings.etalTerm);
  Styler.cslEngine.updateTerm("ibid", citSpecials.ibidTerm);
  const locale = Styler.cslEngine.locale.getLocaleUpdates();
  const citInfoContent = {
    regular: infos.cit,
    special: citSpecials
  };
  const citInfo = {
    content: citInfoContent,
    settings: citSettings
  };
  const bibInfo = {
    content: infos.bib,
    settings: bibSettings
  };
  const info = {
    general: generalInfo,
    citation: citInfo,
    bibliography: bibInfo,
    locale
  };
  return info;
}
const rt = {
  createNode: function() {
    return createNode();
  },
  cloneNode: function(node) {
    const dest = createNode();
    cloneNode(node, dest);
    return dest;
  },
  collectRanges: function(node) {
    const buffer = [];
    collectRanges(node, buffer, 0);
    return buffer;
  },
  addRanges: function(node, values, sorted) {
    addRanges(node, values, sorted || false);
  },
  addRange: function(node, value) {
    addRange(node, value);
  },
  compareRanges: function(a, b) {
    return compareRanges(a, b);
  },
  createRange: function(value) {
    return createRange(value);
  }
};
function createNode(value) {
  return { value: value || null, children: [] };
}
function createRange(value) {
  if ("length" in value && "end" in value)
    return { ...value };
  if ("length" in value)
    return {
      start: value.start,
      end: value.start + value.length,
      length: value.length,
      tag: value.tag || {}
    };
  return {
    start: value.start,
    end: value.end,
    length: value.end - value.start,
    tag: value.tag || {}
  };
}
function findParentNode(node, value) {
  for (let i = 0; i < node.children.length; i++) {
    const c = node.children[i];
    if (!c.value)
      continue;
    if (c.value.start <= value.start && c.value.end >= value.end) {
      if (c.children.length === 0) return c;
      for (let j = 0; j < c.children.length; j++) {
        const n = findParentNode(c.children[j], value);
        if (n) return n;
      }
      return c;
    }
  }
  if (!node.value || node.value.start <= value.start && node.value.end >= value.end)
    return node;
  return null;
}
function addRanges(node, values, sorted) {
  if (!sorted)
    values.sort(compareRanges);
  for (let i = 0; i < values.length; i++)
    addRange(node, values[i]);
}
function addRange(node, value) {
  const parent = findParentNode(node, value);
  if (!parent)
    return;
  for (let i = 0; i < parent.children.length; i++) {
    const sibling = parent.children[i];
    if (!sibling.value)
      continue;
    if (sibling.value.end <= value.start) continue;
    if (sibling.value.start >= value.end) {
      parent.children.splice(i, 0, createNode(value));
    } else if (sibling.value.start >= value.start && sibling.value.end <= value.end) {
      let firstPart = createRange({
        start: value.start,
        end: sibling.value.start,
        tag: value.tag
      });
      let secondPart = createRange({
        start: sibling.value.start,
        length: sibling.value.length,
        tag: value.tag
      });
      let thirdPart = createRange({
        start: sibling.value.end,
        end: value.end,
        tag: value.tag
      });
      if (firstPart.length > 0) addRange(parent, firstPart);
      addRange(sibling, secondPart);
      if (thirdPart.length > 0) addRange(parent, thirdPart);
    } else if (sibling.value.start <= value.start && sibling.value.end >= value.end) {
      const part = {
        value,
        children: sibling.children
      };
      sibling.children = [part];
    } else if (sibling.value.start <= value.start) {
      let firstPart = createRange({
        start: value.start,
        end: sibling.value.end,
        tag: value.tag
      });
      let secondPart = createRange({
        start: sibling.value.end,
        end: value.end,
        tag: value.tag
      });
      if (firstPart.length > 0) addRange(sibling, firstPart);
      if (secondPart.length > 0) addRange(parent, secondPart);
    } else if (sibling.value.end >= value.end) {
      let firstPart = createRange({
        start: value.start,
        end: sibling.value.start,
        tag: value.tag
      });
      let secondPart = createRange({
        start: sibling.value.start,
        end: value.end,
        tag: value.tag
      });
      if (firstPart.length > 0) addRange(parent, firstPart);
      if (secondPart.length > 0) addRange(sibling, secondPart);
    } else {
      throw new Error("Unknown relationship with sibling and current node");
    }
    return;
  }
  parent.children.push(createNode(value));
}
function collectRanges(node, buffer, index) {
  if (node.value !== null) {
    const value = {
      ...node.value
    };
    value.tag = value.tag || {};
    value.tag = { ...value.tag };
    value.tag.nodeIndex = index;
    buffer.push(value);
  }
  for (let i = 0; i < node.children.length; i++)
    collectRanges(node.children[i], buffer, i);
}
function cloneNode(source, dest) {
  dest.value = source.value ? createRange(source.value) : null;
  dest.children = [];
  for (let i = 0; i < source.children.length; i++) {
    const target = createNode();
    cloneNode(source.children[i], target);
    dest.children.push(target);
  }
}
function compareRanges(a, b) {
  if (a.start < b.start) return -1;
  if (a.start > b.start) return 1;
  if (a.length > b.length) return -1;
  if (a.length < b.length) return 1;
  return 0;
}
function selectionEquals(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.start === b.start && a.end === b.end && a.direction === b.direction;
}
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_main$j = {
  name: "RawHighlightTextArea",
  inheritAttrs: false,
  props: {
    value: { default: "", type: String },
    initialValue: { default: "NOTHINGGGGGG", type: String },
    //[{ start: 0, length: 5, tag: { class: "identifier" }}, ...]
    segments: {
      default: function() {
        return [];
      },
      type: Array
    },
    // {start: 0, end: 2, direction: "forward"}
    selection: {
      default: function() {
        return { start: 0, end: 0, direction: "forward" };
      },
      type: Object
    },
    autoHeight: {
      default: false,
      type: Boolean
    }
  },
  data: function() {
    return {
      input: this.value || "hmmmmmmmm",
      backgroundJobInterval: -1,
      selectedRange: { start: 0, end: 0, direction: "forward" },
      hasFocus: false
    };
  },
  computed: {
    containerClasses: function() {
      var list = [];
      list.push(this.hasFocus ? "hta-focus" : "hta-blur");
      return list;
    },
    sortedSegments: function() {
      const segments = this.segments.map((x) => rt.createRange(x));
      segments.sort((a, b) => rt.compareRanges(a, b));
      return segments;
    },
    segmentTree: function() {
      const root = rt.createNode();
      rt.addRanges(root, this.sortedSegments, true);
      return root;
    },
    hilights: function() {
      const selection = this.selectedRange;
      const root = rt.cloneNode(this.segmentTree);
      rt.addRange(
        root,
        rt.createRange({
          start: selection.start,
          end: selection.end,
          tag: { class: "hta-selection" }
        })
      );
      return rt.collectRanges(root);
    },
    html: function() {
      return generateHtml(this.input, this.hilights);
    }
  },
  watch: {
    value: function(v) {
      this.input = v || "h00000000000";
    },
    initialValue: function(v) {
      this.input = v || "aaaaaaahhhhhhhh";
    },
    selection: {
      handler: function(r) {
        if (!r) return;
        r.start = +r.start;
        r.end = +r.end;
        r.direction = r.direction || "forward";
        this.select(r);
      },
      deep: true
    },
    html: function() {
      const self = this;
      this.$nextTick(function() {
        self.syncScroll();
      });
    },
    hasFocus: function(v) {
      this.$emit(v ? "focus" : "blur");
    }
  },
  methods: {
    onContainerScroll: function() {
      this.$refs.container.scrollLeft = 0;
    },
    onInputScroll: function() {
      this.syncScroll();
    },
    onTextInput: function() {
      this.$emit("input", this.$refs.input.value);
      if (this.autoHeight) this.fitHeight();
    },
    focus: function() {
      this.$refs.input.focus();
    },
    select: function(range) {
      if (!range) return;
      const input = this.$refs.input;
      input.setSelectionRange(range.start, range.end, range.direction);
      this.selectedRange = {
        start: range.start,
        end: range.end,
        direction: range.direction
      };
      this.$nextTick(() => this.scrollToRevealSelection());
    },
    scrollToRevealSelection: function() {
      const input = this.$refs.input;
      if (!input) return;
      const background = this.$refs.background;
      if (!background) return;
      const selection = background.querySelector(".hta-selection");
      if (!selection) return;
      let st = selection.offsetTop;
      if (st >= input.scrollTop && st <= input.scrollTop + input.clientHeight)
        return;
      st = Math.max(0, Math.min(st, input.scrollHeight - input.clientHeight));
      input.scrollTop = st;
    },
    updateSelection: function() {
      const input = this.$refs.input;
      if (!input) return;
      const range = {
        start: input.selectionStart || 0,
        end: input.selectionEnd || 0,
        direction: input.selectionDirection || "forward"
      };
      const selection = this.selectedRange;
      if (!selectionEquals(range, selection)) {
        this.$emit("update:selection", range);
      }
    },
    fitHeight: function() {
      const self = this;
      this.$nextTick(function() {
        const input = self.$refs.input;
        const container = self.$refs.container;
        if (!input || !container) return;
        container.style.height = 0;
        container.style.height = input.scrollHeight + "px";
        this.syncSize();
      });
    },
    syncScroll: function() {
      const self = this;
      this.$nextTick(function() {
        const s = self.$refs.input;
        const d = self.$refs.background;
        d.scrollTop = s.scrollTop;
        const left = s.scrollLeft;
        if (left > 0) {
          d.style.transform = "translateX(" + -left + "px)";
        } else {
          d.style.transform = "";
        }
      });
    },
    syncSize: function() {
      const self = this;
      this.$nextTick(function() {
        const input = self.$refs.input;
        const container = self.$refs.container;
        const background = self.$refs.background;
        if (!input || !container || !background) return;
        if (input.clientHeight != container.clientHeight)
          input.style.height = container.clientHeight + "px";
        if (input.clientWidth != container.clientWidth)
          input.style.width = container.clientWidth + "px";
        if (background.clientHeight != container.clientHeight)
          background.style.height = container.clientHeight + "px";
        if (background.clientWidth != container.clientWidth)
          background.style.width = container.clientWidth + "px";
      });
    },
    backgroundJob: function() {
      this.syncSize();
      this.updateSelection();
    }
  },
  created: function() {
    this.input = this.value || "h111111111111";
  },
  mounted: function() {
    this.input = this.value || this.initialValue;
    const self = this;
    this.backgroundJobInterval = setInterval(function() {
      self.backgroundJob();
    }, 300);
  },
  destroyed: function() {
    if (this.backgroundJobInterval >= 0)
      clearInterval(this.backgroundJobInterval);
  }
};
function generateHtml(input, hilights) {
  if (input.length == 0) return "";
  if (input.charAt(input.length - 1) === "\n") input = input + "\n";
  const open = [];
  const elements = [];
  let hi = 0;
  let textStart = 0;
  for (let i = 0; i < input.length; i++) {
    while (open.length) {
      let h = open[open.length - 1];
      if (h.end > i) break;
      pushTextPart(i);
      elements.push("</span>");
      open.pop();
    }
    for (; hi < hilights.length; hi++) {
      const h = hilights[hi];
      if (h.start > i) break;
      pushTextPart(i);
      elements.push("<span class='hta-highlight ");
      const cls = h.tag && h.tag.class;
      if (cls) elements.push(cls);
      const ni = h.tag && h.tag.nodeIndex;
      if (typeof ni === "number") {
        elements.push(ni % 2 ? " hta-highlight-color" : " hta-highlight-color");
      }
      elements.push("'>");
      if (h.end === h.start) {
        elements.push("</span>");
      } else {
        open.push(h);
      }
    }
  }
  pushTextPart(input.length);
  while (open.length) {
    elements.push("</span>");
    open.pop();
  }
  return elements.join("");
  function pushTextPart(index) {
    if (index <= textStart) return;
    const part = input.substring(textStart, index);
    elements.push(htmlEncode(part));
    textStart = index;
  }
  function htmlEncode(text) {
    const span = document.createElement("span");
    span.textContent = text;
    return span.innerHTML;
  }
}
function _sfc_ssrRender$d(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(mergeProps({
    ref: "container",
    class: ["hta-container", $options.containerClasses]
  }, _attrs))}><div class="hta-background"><div class="hta-highlights hta-text">${$options.html ?? ""}</div></div><textarea${ssrRenderAttrs(mergeProps({ ref: "input" }, _ctx.$attrs, {
    class: "hta-input hta-text",
    autocomplete: "off",
    autocorrect: "off",
    autocapitalize: "off",
    spellcheck: "false"
  }), "textarea")}>${ssrInterpolate(_ctx.input)}</textarea></div>`);
}
const _sfc_setup$j = _sfc_main$j.setup;
_sfc_main$j.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/HighlightTextArea/RawHilightTextArea.vue");
  return _sfc_setup$j ? _sfc_setup$j(props, ctx) : void 0;
};
const RawHighlightTextArea = /* @__PURE__ */ _export_sfc(_sfc_main$j, [["ssrRender", _sfc_ssrRender$d]]);
const _sfc_main$i = {
  name: "HighlightTextArea",
  inheritAttrs: false,
  components: { RawHighlightTextArea },
  props: {
    value: { default: "", type: String },
    initialValue: { default: "hiiiiiii", type: String },
    //[{ start: 0, length: 5, tag: { class: "identifier" }}, ...]
    segments: {
      default: function() {
        return [];
      },
      type: Array
    },
    // {start: 0, end: 2, direction: "forward"}
    selection: {
      default: function() {
        return { start: 0, end: 0, direction: "forward" };
      },
      type: Object
    },
    autoHeight: {
      default: false,
      type: Boolean
    }
  },
  data: function() {
    return {
      hasFocus: false
    };
  },
  methods: {
    onFocus: function() {
      this.hasFocus = true;
      this.$emit("focus");
    },
    onBlur: function() {
      this.hasFocus = false;
      this.$emit("blur");
    },
    onInput: function(value) {
      this.$emit("input", value);
    },
    focus: function() {
      this.$refs.input.focus();
    }
  }
};
function _sfc_ssrRender$c(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_RawHighlightTextArea = resolveComponent("RawHighlightTextArea");
  _push(`<div${ssrRenderAttrs(mergeProps({
    class: ["hta-border", { "hta-border-focus": _ctx.hasFocus }]
  }, _attrs))}>`);
  _push(ssrRenderComponent(_component_RawHighlightTextArea, mergeProps({ ref: "input" }, _ctx.$attrs, {
    value: $props.value,
    initialValue: $props.initialValue,
    segments: $props.segments,
    selection: $props.selection,
    autoHeight: $props.autoHeight,
    onInput: $options.onInput,
    onFocus: $options.onFocus,
    onBlur: $options.onBlur,
    "onUpdate:selection": ($event) => _ctx.$emit("update:selection", $event)
  }), null, _parent));
  _push(`</div>`);
}
const _sfc_setup$i = _sfc_main$i.setup;
_sfc_main$i.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/HighlightTextArea/HilightTextArea.vue");
  return _sfc_setup$i ? _sfc_setup$i(props, ctx) : void 0;
};
const HilightTextArea = /* @__PURE__ */ _export_sfc(_sfc_main$i, [["ssrRender", _sfc_ssrRender$c]]);
function getSegments(text) {
  const patterns = [
    { regex: namesRegex, class: "blue" },
    // Square brackets
    { regex: variableRegex, class: "green" },
    // Angle brackets
    { regex: /\(sc\)|\(i\)|\(b\)/g, class: "red" },
    // Parentheses
    { regex: /\{([^}]+)\}/g, class: "orange" }
    // Curly brackets
  ];
  let allMatches = [];
  patterns.forEach((pattern) => {
    let matches = [...text.matchAll(pattern.regex)];
    matches.forEach((m) => {
      allMatches.push({
        start: m.index,
        end: m.index + m[0].length,
        tag: { class: pattern.class }
      });
    });
  });
  return allMatches;
}
const terms = getLocalizedCSLTerms();
const variableRegex = new RegExp(createRegexFrom("<", ">", terms.variableTerms), "g");
const namesRegex = new RegExp(createNamesRegex(terms.nameTerms, terms.namePartTerms), "g");
function createRegexFrom(openingBracket, closingBracket, terms2) {
  const regexForTerms = terms2.reduce((accumulator, currentValue) => {
    return accumulator + currentValue + "|";
  }, "");
  const stylings = "\\(sc\\)|\\(i\\)|\\(b\\)";
  const regexString = `\\${openingBracket}(${regexForTerms.substring(0, regexForTerms.length - 1)})(${stylings})?\\${closingBracket}`;
  return regexString;
}
function createNamesRegex(nameTerms, namePartTerms) {
  let regexString = "\\[";
  let nameTermsString = "(" + nameTerms.reduce((accumulator, currentValue) => {
    return accumulator + currentValue + "|";
  }, "");
  nameTermsString = nameTermsString.substring(0, nameTermsString.length - 1) + ")";
  regexString += nameTermsString;
  regexString += "(" + createRegexFrom("<", ">", namePartTerms) + ")+";
  regexString += "\\]";
  return regexString;
}
const _sfc_main$h = {
  __name: "StylerComponent",
  __ssrInlineRender: true,
  props: ["stylerID"],
  setup(__props) {
    const props = __props;
    const styler = stylerDict[props.stylerID];
    const code = styler.getCode();
    const segments = computed(() => {
      return getSegments(code.value);
    });
    styler.update();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex-container" }, _attrs))}><div class="blog-post"><h4>${ssrInterpolate(unref(styler).info.name)}</h4>`);
      _push(ssrRenderComponent(HilightTextArea, {
        modelValue: unref(code),
        "onUpdate:modelValue": ($event) => isRef(code) ? code.value = $event : null,
        initialValue: unref(code),
        segments: segments.value,
        onInput: ($event) => unref(styler).update()
      }, null, _parent));
      _push(`</div><div class="output">${unref(styler).output.value ?? ""}</div></div>`);
    };
  }
};
const _sfc_setup$h = _sfc_main$h.setup;
_sfc_main$h.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/StylerComponent.vue");
  return _sfc_setup$h ? _sfc_setup$h(props, ctx) : void 0;
};
const _sfc_main$g = defineComponent({
  props: {
    name: String,
    closing: Boolean
  },
  setup(props, { emit }) {
    const onClick = () => {
      emit("click");
    };
    return {
      onClick
    };
  },
  emits: ["click"]
});
function _sfc_ssrRender$b(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<span${ssrRenderAttrs(_attrs)} data-v-946fd11e>`);
  if (_ctx.closing) {
    _push(`<span class="bracket" data-v-946fd11e>/</span>`);
  } else {
    _push(`<!---->`);
  }
  _push(`<span class="element-name" data-v-946fd11e>${ssrInterpolate(_ctx.name)}</span></span>`);
}
const _sfc_setup$g = _sfc_main$g.setup;
_sfc_main$g.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/XmlViewer/XmlElementName.vue");
  return _sfc_setup$g ? _sfc_setup$g(props, ctx) : void 0;
};
const XmlElementName = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["ssrRender", _sfc_ssrRender$b], ["__scopeId", "data-v-946fd11e"]]);
const _sfc_main$f = defineComponent({
  props: {
    node: null
  },
  setup(props) {
    const content = computed(() => props.node.textContent);
    return {
      content
    };
  }
});
function _sfc_ssrRender$a(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)} data-v-1f0a9f6f><div class="content" data-v-1f0a9f6f>${ssrInterpolate(_ctx.content)}</div></div>`);
}
const _sfc_setup$f = _sfc_main$f.setup;
_sfc_main$f.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/XmlViewer/XmlElementContent.vue");
  return _sfc_setup$f ? _sfc_setup$f(props, ctx) : void 0;
};
const XmlElementContent = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["ssrRender", _sfc_ssrRender$a], ["__scopeId", "data-v-1f0a9f6f"]]);
const _sfc_main$e = defineComponent({
  props: {
    name: String
  }
});
function _sfc_ssrRender$9(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<span${ssrRenderAttrs(_attrs)} data-v-84f62d24><span class="attribute-name" data-v-84f62d24>${ssrInterpolate(_ctx.name)}</span></span>`);
}
const _sfc_setup$e = _sfc_main$e.setup;
_sfc_main$e.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/XmlViewer/XmlAttributeName.vue");
  return _sfc_setup$e ? _sfc_setup$e(props, ctx) : void 0;
};
const XmlAttributeName = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["ssrRender", _sfc_ssrRender$9], ["__scopeId", "data-v-84f62d24"]]);
const _sfc_main$d = defineComponent({
  props: {
    value: String
  }
});
function _sfc_ssrRender$8(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<span${ssrRenderAttrs(_attrs)} data-v-e1b8b638><span class="attribute-value" data-v-e1b8b638>${ssrInterpolate(_ctx.value)}</span></span>`);
}
const _sfc_setup$d = _sfc_main$d.setup;
_sfc_main$d.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/XmlViewer/XmlAttributeValue.vue");
  return _sfc_setup$d ? _sfc_setup$d(props, ctx) : void 0;
};
const XmlAttributeValue = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["ssrRender", _sfc_ssrRender$8], ["__scopeId", "data-v-e1b8b638"]]);
const _sfc_main$c = defineComponent({
  name: "XmlElement",
  components: {
    XmlAttributeName,
    XmlAttributeValue
  },
  props: {
    attribute: Attr
  },
  setup(props) {
    const name = computed(() => props.attribute.name);
    const value = computed(() => props.attribute.value);
    return {
      name,
      value
    };
  }
});
function _sfc_ssrRender$7(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_XmlAttributeName = resolveComponent("XmlAttributeName");
  const _component_XmlAttributeValue = resolveComponent("XmlAttributeValue");
  _push(`<span${ssrRenderAttrs(_attrs)} data-v-f54aa108>`);
  _push(ssrRenderComponent(_component_XmlAttributeName, {
    name: _ctx.name,
    class: "margin-left-sm"
  }, null, _parent));
  _push(`<span class="no-margin-padding assignment" data-v-f54aa108>=</span><span class="no-margin-padding quote" data-v-f54aa108>&quot;</span>`);
  _push(ssrRenderComponent(_component_XmlAttributeValue, {
    value: _ctx.value,
    class: "no-margin-padding"
  }, null, _parent));
  _push(`<span class="no-margin-padding quote" data-v-f54aa108>&quot;</span></span>`);
}
const _sfc_setup$c = _sfc_main$c.setup;
_sfc_main$c.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/XmlViewer/XmlAttribute.vue");
  return _sfc_setup$c ? _sfc_setup$c(props, ctx) : void 0;
};
const XmlAttribute = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["ssrRender", _sfc_ssrRender$7], ["__scopeId", "data-v-f54aa108"]]);
const _sfc_main$b = defineComponent({
  name: "XmlElement",
  components: {
    XmlAttribute
  },
  props: {
    attributes: Array
  }
});
function _sfc_ssrRender$6(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_XmlAttribute = resolveComponent("XmlAttribute");
  _push(`<span${ssrRenderAttrs(_attrs)}><!--[-->`);
  ssrRenderList(_ctx.attributes, (attribute, index) => {
    _push(ssrRenderComponent(_component_XmlAttribute, {
      key: index,
      attribute
    }, null, _parent));
  });
  _push(`<!--]--></span>`);
}
const _sfc_setup$b = _sfc_main$b.setup;
_sfc_main$b.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/XmlViewer/XmlAttributeLine.vue");
  return _sfc_setup$b ? _sfc_setup$b(props, ctx) : void 0;
};
const XmlAttributeLine = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["ssrRender", _sfc_ssrRender$6]]);
const _sfc_main$a = defineComponent({
  props: {
    cdataSection: Text
  },
  setup(props) {
    const content = computed(() => props.cdataSection.textContent);
    return {
      content
    };
  }
});
function _sfc_ssrRender$5(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)} data-v-4e471db6><div class="content" data-v-4e471db6><span data-v-4e471db6>&lt;![CDATA[</span><pre class="inline no-margin-padding" data-v-4e471db6>${ssrInterpolate(_ctx.content)}</pre><span data-v-4e471db6>]]&gt;</span></div></div>`);
}
const _sfc_setup$a = _sfc_main$a.setup;
_sfc_main$a.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/XmlViewer/XmlCDataSection.vue");
  return _sfc_setup$a ? _sfc_setup$a(props, ctx) : void 0;
};
const XmlCDataSection = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["ssrRender", _sfc_ssrRender$5], ["__scopeId", "data-v-4e471db6"]]);
const _sfc_main$9 = defineComponent({
  props: {
    remark: Comment
  },
  setup(props) {
    const content = computed(() => props.remark.textContent);
    return {
      content
    };
  }
});
function _sfc_ssrRender$4(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)} data-v-5db6b91e><div class="content" data-v-5db6b91e> &lt;!-- <pre class="inline no-margin-padding" data-v-5db6b91e>${ssrInterpolate(_ctx.content)}</pre> --&gt; </div></div>`);
}
const _sfc_setup$9 = _sfc_main$9.setup;
_sfc_main$9.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/XmlViewer/XmlRemark.vue");
  return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
const XmlRemark = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["ssrRender", _sfc_ssrRender$4], ["__scopeId", "data-v-5db6b91e"]]);
const _sfc_main$8 = {
  name: "CaretDown"
};
function _sfc_ssrRender$3(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<svg${ssrRenderAttrs(mergeProps({
    width: "1em",
    height: "1em",
    viewBox: "0 0 24 24"
  }, _attrs))}><path fill="currentColor" d="m11.998 17l7-8h-14z"></path></svg>`);
}
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/XmlViewer/CaretDown.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const CaretDown = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["ssrRender", _sfc_ssrRender$3]]);
const _sfc_main$7 = {
  name: "CaretRight"
};
function _sfc_ssrRender$2(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<svg${ssrRenderAttrs(mergeProps({
    width: "1em",
    height: "1em",
    viewBox: "0 0 24 24"
  }, _attrs))}><path fill="currentColor" d="m9 19l8-7l-8-7z"></path></svg>`);
}
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/XmlViewer/CaretRight.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const CaretRight = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["ssrRender", _sfc_ssrRender$2]]);
const _sfc_main$6 = defineComponent({
  name: "XmlElement",
  components: {
    XmlElementName,
    XmlElementContent,
    XmlAttributeLine,
    XmlCDataSection,
    XmlRemark,
    CaretDown,
    CaretRight
  },
  props: {
    node: Element,
    collapsed: Boolean = false
  },
  setup(props) {
    const collapsed = ref(props.collapsed);
    const name = computed(() => props.node.nodeName);
    const childNodes = computed(() => Array.from(props.node.childNodes));
    const childElements = computed(() => childNodes.value && childNodes.value.filter((x) => x.nodeType === 1));
    const childContents = computed(() => childNodes.value && childNodes.value.filter((x) => x.nodeType === 3));
    const cdataSections = computed(() => childNodes.value && childNodes.value.filter((x) => x.nodeType === 4));
    const remarks = computed(() => childNodes.value && childNodes.value.filter((x) => x.nodeType === 8));
    const attributes = computed(() => props.node.attributes && Array.from(props.node.attributes) || []);
    const selfClosing = !childElements.value.length && !childContents.value.length && !cdataSections.value.length && !remarks.value.length;
    const toggleCollapsed = () => {
      collapsed.value = !collapsed.value;
    };
    return {
      name,
      childElements,
      childContents,
      attributes,
      cdataSections,
      remarks,
      selfClosing,
      collapsed,
      toggleCollapsed
    };
  }
});
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_CaretDown = resolveComponent("CaretDown");
  const _component_CaretRight = resolveComponent("CaretRight");
  const _component_XmlElementName = resolveComponent("XmlElementName");
  const _component_XmlAttributeLine = resolveComponent("XmlAttributeLine");
  const _component_XmlElement = resolveComponent("XmlElement", true);
  const _component_XmlElementContent = resolveComponent("XmlElementContent");
  const _component_XmlCDataSection = resolveComponent("XmlCDataSection");
  const _component_XmlRemark = resolveComponent("XmlRemark");
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "xml-element" }, _attrs))} data-v-4bc8ab8e><div data-v-4bc8ab8e>`);
  if (!_ctx.selfClosing) {
    _push(`<!--[-->`);
    if (!_ctx.collapsed) {
      _push(ssrRenderComponent(_component_CaretDown, {
        class: "caret",
        onClick: _ctx.toggleCollapsed
      }, null, _parent));
    } else {
      _push(ssrRenderComponent(_component_CaretRight, {
        class: "caret",
        onClick: _ctx.toggleCollapsed
      }, null, _parent));
    }
    _push(`<!--]-->`);
  } else {
    _push(`<!---->`);
  }
  _push(`<span class="bracket" data-v-4bc8ab8e>&lt;</span>`);
  _push(ssrRenderComponent(_component_XmlElementName, {
    class: "clickable",
    name: _ctx.name,
    onClick: _ctx.toggleCollapsed
  }, null, _parent));
  if (!_ctx.collapsed) {
    _push(ssrRenderComponent(_component_XmlAttributeLine, { attributes: _ctx.attributes }, null, _parent));
  } else {
    _push(`<!---->`);
  }
  if (_ctx.selfClosing && !_ctx.collapsed) {
    _push(`<span class="bracket" data-v-4bc8ab8e> /</span>`);
  } else {
    _push(`<!---->`);
  }
  if (_ctx.selfClosing && _ctx.collapsed) {
    _push(`<span class="dots" data-v-4bc8ab8e> ...</span>`);
  } else {
    _push(`<!---->`);
  }
  _push(`<span class="bracket" data-v-4bc8ab8e>&gt;</span></div>`);
  if (!_ctx.collapsed) {
    _push(`<div class="child-elements" data-v-4bc8ab8e><div data-v-4bc8ab8e><!--[-->`);
    ssrRenderList(_ctx.childElements, (childElement, index) => {
      _push(ssrRenderComponent(_component_XmlElement, {
        key: `e${index}`,
        node: childElement
      }, null, _parent));
    });
    _push(`<!--]--><!--[-->`);
    ssrRenderList(_ctx.childContents, (childContent, index) => {
      _push(ssrRenderComponent(_component_XmlElementContent, {
        key: `t${index}`,
        node: childContent
      }, null, _parent));
    });
    _push(`<!--]--><!--[-->`);
    ssrRenderList(_ctx.cdataSections, (cdataSection, index) => {
      _push(ssrRenderComponent(_component_XmlCDataSection, {
        key: `c${index}`,
        cdataSection
      }, null, _parent));
    });
    _push(`<!--]--><!--[-->`);
    ssrRenderList(_ctx.remarks, (remark, index) => {
      _push(ssrRenderComponent(_component_XmlRemark, {
        key: `r${index}`,
        remark
      }, null, _parent));
    });
    _push(`<!--]--></div></div>`);
  } else {
    _push(`<!---->`);
  }
  if (!_ctx.selfClosing && !_ctx.collapsed) {
    _push(`<div data-v-4bc8ab8e><span class="bracket" data-v-4bc8ab8e>&lt;</span>`);
    _push(ssrRenderComponent(_component_XmlElementName, {
      name: _ctx.name,
      closing: true
    }, null, _parent));
    _push(`<span class="bracket" data-v-4bc8ab8e>&gt;</span></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
}
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/XmlViewer/XmlElement.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const XmlElement = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["ssrRender", _sfc_ssrRender$1], ["__scopeId", "data-v-4bc8ab8e"]]);
const _sfc_main$5 = defineComponent({
  components: {
    XmlElement
  },
  props: {
    xml: String,
    theme: {
      type: String,
      default: "light"
    }
  },
  setup(props) {
    const parser = new DOMParser();
    const rootNode = ref();
    const parseDocument = (xml) => {
      const xmlDoc = parser.parseFromString(xml, "text/xml");
      const rootElement = xmlDoc.childNodes[0];
      rootNode.value = rootElement;
    };
    watch(() => props.xml, (value) => {
      parseDocument(value);
    });
    parseDocument(props.xml);
    return {
      rootNode
    };
  }
});
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_XmlElement = resolveComponent("XmlElement");
  _push(`<div${ssrRenderAttrs(mergeProps({ class: _ctx.theme }, _attrs))}>`);
  _push(ssrRenderComponent(_component_XmlElement, {
    node: _ctx.rootNode,
    collapsed: true
  }, null, _parent));
  _push(`</div>`);
}
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/XmlViewer/XmlViewer.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const XmlViewer = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["ssrRender", _sfc_ssrRender]]);
const _sfc_main$4 = {
  __name: "StylerSettings",
  __ssrInlineRender: true,
  props: /* @__PURE__ */ mergeModels(["prefix"], {
    "modelValue": {},
    "modelModifiers": {}
  }),
  emits: ["update:modelValue"],
  setup(__props) {
    const uiTexts = currentLocalization();
    const model = useModel(__props, "modelValue");
    const settings = reactive(model.value);
    const props = __props;
    const prefix = props.prefix;
    function updateStylersWith(prefix2) {
      for (const styler of stylers.filter((x) => x.info.prefix === prefix2)) {
        styler.update();
      }
    }
    watch(settings, (newVal) => {
      updateStylersWith(prefix);
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[--><h2>${ssrInterpolate(unref(uiTexts).settings)}</h2><div class="flex-container"><div><h3>${ssrInterpolate(unref(uiTexts).nameDelimiterSetting)}</h3><p>${ssrInterpolate(unref(uiTexts).nameDelimiterSettingTooltip)}</p><input type="text"${ssrRenderAttr("value", settings.authorDelimiter)}></div><div><h3>${ssrInterpolate(unref(uiTexts).etAlMinSetting)}</h3><p>${ssrInterpolate(unref(uiTexts).etAlMinSettingTooltip)}</p><input type="text"${ssrRenderAttr("value", settings.etalMin)}></div><div><h3>${ssrInterpolate(unref(uiTexts).abbreviateNamesSetting)}</h3><p>${ssrInterpolate(unref(uiTexts).abbreviateNamesSettingTooltip)}</p><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(settings.abbreviateNames) ? ssrLooseContain(settings.abbreviateNames, null) : settings.abbreviateNames) ? " checked" : ""} unchecked></div></div><!--]-->`);
    };
  }
};
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/StylerSettings.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const _sfc_main$3 = {
  __name: "CitationSpecials",
  __ssrInlineRender: true,
  props: {
    "modelValue": {},
    "modelModifiers": {}
  },
  emits: ["update:modelValue"],
  setup(__props) {
    const model = useModel(__props, "modelValue");
    const settings = reactive(model.value);
    const preview = ref({ ibid: "loading", subsequent: "loading" });
    const uiTexts = currentLocalization();
    function updateStylers() {
      for (const styler of stylers.filter((x) => x.info.prefix === "cit")) {
        styler.update();
      }
    }
    watch(settings, (newVal) => {
      update();
    });
    function update() {
      try {
        updateStylers();
        preview.value = Styler.cslEngine.previewCitationSpecials();
      } catch (error) {
        console.error("Error loading data:", error);
      }
    }
    onMounted(() => {
      update();
    });
    const segmentsSubsequent = computed(() => {
      return getSegments(settings.subsequent);
    });
    const segmentsFirstNoteReferenceNumber = computed(() => {
      return getSegments(settings.firstNoteReferenceNumber);
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[--><h2>${ssrInterpolate(unref(uiTexts).subsequentCitations)}</h2><div class="flex-container"><div><p>${ssrInterpolate(unref(uiTexts).ibidTerm)}</p><input type="text"${ssrRenderAttr("value", settings.ibidTerm)}></div><div class="output">${preview.value.ibid ?? ""}</div></div><div class="flex-container"><div><p>${ssrInterpolate(unref(uiTexts).subsequentLabel)}</p>`);
      _push(ssrRenderComponent(HilightTextArea, {
        modelValue: settings.subsequent,
        "onUpdate:modelValue": ($event) => settings.subsequent = $event,
        modelModifiers: { lazy: true },
        initialValue: settings.subsequent,
        segments: segmentsSubsequent.value
      }, null, _parent));
      _push(`<p>${ssrInterpolate(unref(uiTexts).abbreviateNamesSetting)}</p><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(settings.abbreviateNamesSubsequent) ? ssrLooseContain(settings.abbreviateNamesSubsequent, null) : settings.abbreviateNamesSubsequent) ? " checked" : ""} unchecked><p>${ssrInterpolate(unref(uiTexts).cross_reference)}</p>`);
      _push(ssrRenderComponent(HilightTextArea, {
        modelValue: settings.firstNoteReferenceNumber,
        "onUpdate:modelValue": ($event) => settings.firstNoteReferenceNumber = $event,
        modelModifiers: { lazy: true },
        initialValue: settings.firstNoteReferenceNumber,
        segments: segmentsFirstNoteReferenceNumber.value
      }, null, _parent));
      _push(`</div><div class="output">${preview.value.subsequent ?? ""}</div></div><!--]-->`);
    };
  }
};
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/CitationSpecials.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const _sfc_main$2 = {
  __name: "GeneralSettings",
  __ssrInlineRender: true,
  props: {
    "modelValue": {},
    "modelModifiers": {}
  },
  emits: ["update:modelValue"],
  setup(__props) {
    const uiTexts = currentLocalization();
    const model = useModel(__props, "modelValue");
    const settings = reactive(model.value);
    watch(settings, (newVal) => {
      Styler.updateStyle();
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[--><h2 class="leadingText">${ssrInterpolate(unref(uiTexts).generalSettings)}</h2><div class="flex-container"><div><p>${ssrInterpolate(unref(uiTexts).styleName)}</p><input type="text"${ssrRenderAttr("value", settings.name)}></div><div><p>${ssrInterpolate(unref(uiTexts).styleAuthor)}</p><input type="text"${ssrRenderAttr("value", settings.author)}></div><div><p>${ssrInterpolate(unref(uiTexts).styleDescription)}</p><input type="text"${ssrRenderAttr("value", settings.description)}></div><div><p>${ssrInterpolate(unref(uiTexts).etalTerm)}</p><input type="text"${ssrRenderAttr("value", settings.etalTerm)}></div></div><!--]-->`);
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/GeneralSettings.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = {
  __name: "HelpButton",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<button${ssrRenderAttrs(mergeProps({ class: "help-button" }, _attrs))}>?</button>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/HelpButton.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "App",
  __ssrInlineRender: true,
  setup(__props) {
    const uiTexts = currentLocalization();
    const isLoading = ref(true);
    const stylers$1 = ref(null);
    const loadFile = ref(null);
    let style;
    async function loadData() {
      try {
        await createStylers();
        stylers$1.value = stylers;
        style = getStyle();
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        isLoading.value = false;
      }
    }
    onMounted(() => {
      loadData();
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      if (isLoading.value) {
        _push(`<div class="skeleton-view"><p>Loading...</p></div>`);
      } else {
        _push(`<div class="content-view"><div class="hStack"><h1>${ssrInterpolate(unref(uiTexts).appTitle)}</h1>`);
        _push(ssrRenderComponent(_sfc_main$1, null, null, _parent));
        _push(`</div><div class="hStack"><h2>${ssrInterpolate(unref(uiTexts).bibliography)}</h2></div><!--[-->`);
        ssrRenderList(unref(getStylerIds)("bib"), (id) => {
          _push(`<div>`);
          _push(ssrRenderComponent(_sfc_main$h, { stylerID: id }, null, _parent));
          _push(`</div>`);
        });
        _push(`<!--]-->`);
        _push(ssrRenderComponent(_sfc_main$4, {
          modelValue: unref(bibSettings),
          "onUpdate:modelValue": ($event) => isRef(bibSettings) ? bibSettings.value = $event : null,
          prefix: "bib"
        }, null, _parent));
        _push(`<hr class="solid"><div class="hStack"><h2>${ssrInterpolate(unref(uiTexts).citation)}</h2><button>${ssrInterpolate(unref(uiTexts).sameAsBibliographyButton)}</button></div><!--[-->`);
        ssrRenderList(unref(getStylerIds)("cit"), (id) => {
          _push(`<div>`);
          _push(ssrRenderComponent(_sfc_main$h, { stylerID: id }, null, _parent));
          _push(`</div>`);
        });
        _push(`<!--]-->`);
        _push(ssrRenderComponent(_sfc_main$4, {
          modelValue: unref(citSettings),
          "onUpdate:modelValue": ($event) => isRef(citSettings) ? citSettings.value = $event : null,
          prefix: "cit"
        }, null, _parent));
        _push(ssrRenderComponent(_sfc_main$3, {
          modelValue: unref(citSpecials),
          "onUpdate:modelValue": ($event) => isRef(citSpecials) ? citSpecials.value = $event : null
        }, null, _parent));
        _push(`<hr class="solid">`);
        _push(ssrRenderComponent(_sfc_main$2, {
          modelValue: unref(generalSettings),
          "onUpdate:modelValue": ($event) => isRef(generalSettings) ? generalSettings.value = $event : null
        }, null, _parent));
        _push(`<hr><h2 class="leadingText">${ssrInterpolate(unref(uiTexts).downloadHeading)}</h2><div class="hStack"><button class="download-button">${ssrInterpolate(unref(uiTexts).exportButton)}</button><button class="download-button">${ssrInterpolate(unref(uiTexts).saveButton)}</button></div><hr><h2 class="leadingText">${ssrInterpolate(unref(uiTexts).openHeading)}</h2><div class="hStack">`);
        if (loadFile.value) {
          _push(`<button class="download-button">${ssrInterpolate(unref(uiTexts).loadButton)}</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<input type="file"></div><hr>`);
        _push(ssrRenderComponent(XmlViewer, {
          class: "leadingText",
          xml: unref(style)
        }, null, _parent));
        _push(`</div>`);
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/App.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const createApp = ViteSSG(_sfc_main);
export {
  createApp
};
