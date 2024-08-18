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
        book: '[author<given><family(sc)>], <title(i)>{ (<volumeTitle>}{, <volumeNumber>)}, <place>: <publisher>, {<edition>, }<year>',
        chapter:
            '[author<given><family(sc)>], <title>, in: [editor<given><family>] (Hg.), <volumeTitle(i)>{ (<collection>}{, <volumeNumber>)}, <place>: <publisher>, {<edition>, }<year>, S. <pages>',
        'article-journal':
            '[author<given><family(sc)>], <title>, in: <journal(i)> <volumeNumber> (<year>), S. <pages>',
        'entry-encyclopedia': `[author<given><family(sc)>], Art. <title>, in: <encyclopedia(i)> <volumeNumber> (<year>), Sp. <pages>`,
        'article-newspaper':
            '{[author<family>], }<title>, ed. [contributor<given><family(sc)>] (<journal> <volumeNumber>), <place> <year>{, S. <pages>}'
    },
    citSpecialDefaults: {
        ibidTerm: 'ibid.',
        firstNoteReferenceNumber: ' (see <footnote>)',
        subsequent: '[author<family(sc)>], <shortTitle>',
        abbreviateNamesSubsequent: false
    },
    stylerDescriptions: {
        book: 'Book',
        chapter: 'Chapter',
        'article-journal': 'Journal article',
        'entry-encyclopedia': 'Encyclopedia entry',
        'article-newspaper': 'Newspaper article'
    },
    cslDictionary: {
        year: {
            type: 'date',
            content: 'date-parts="year" form="text" variable="issued"'
        },
        author: {
            type: 'name',
            name: 'author'
        },
        editor: {
            type: 'name',
            name: 'editor'
        },
        given: { type: 'namePart', namePart: 'given' },
        family: { type: 'namePart', namePart: 'family' },
        title: 'title',
        volumeTitle: 'container-title',
        journal: 'container-title',
        encyclopedia: 'container-title',
        collection: 'collection-title',
        volumeNumber: 'volume',
        place: 'publisher-place',
        publisher: 'publisher',
        edition: 'edition',
        pages: 'page',
        contributor: 'contributor',
        shortTitle: {
            type: 'variable',
            content: `variable="title" form="short"`
        },
        footnote: 'first-reference-note-number'
    },
    generalSettingsDefaults: {
        etalTerm: 'et al.',
        name: 'style',
        author: 'John Doe',
        description: 'description'
    }
}
const de = {
    appTitle: "CSL-Stil-Generator",
    bibliography: "Bibliographie",
    settings: "Einstellungen",
    nameDelimiterSetting: "Trennzeichen für Namen",
    nameDelimiterSettingTooltip: "falls es mehrere Namen gibt",
    etAlMinSetting: "\"et al.\"-min",
    etAlMinSettingTooltip: "Mindestanzahl von Namen für \"et al.\"",
    abbreviateNamesSetting: "Vornamen abkürzen",
    abbreviateNamesSettingTooltip: "mit Punkt, z. B. M. Mustermann",
    citation: "Fußnoten",
    sameAsBibliographyButton: "von \"Bibliographie\" übernehmen",
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
        book: '[Autor<Vorname><Name(sc)>], <Titel(i)>{ (<Reihentitel>}{, <Bd.-Nr.>)}, <Ort>: <Verlagsname>, {<Auflage>, }<Jahr>',
        chapter:
            '[Autor<Vorname><Name(sc)>], <Titel>, in: [Herausgeber<Vorname><Name>] (Hg.), <Bandtitel(i)>{ (<Reihentitel>}{, <Bd.-Nr.>)}, <Ort>: <Verlagsname>, {<Auflage>, }<Jahr>, S. <Seitenzahlen>',
        'article-journal':
            '[Autor<Vorname><Name(sc)>], <Titel>, in: <Zeitschrift(i)> <Bd.-Nr.> (<Jahr>), S. <Seitenzahlen>',
        'entry-encyclopedia': `[Autor<Vorname><Name(sc)>], Art. <Titel>, in: <Lexikon(i)> <Bd.-Nr.> (<Jahr>), Sp. <Seitenzahlen>`,
        'article-newspaper':
            '{[Autor<Name>], }<Titel>, ed. [Editor<Vorname><Name(sc)>] (<Zeitschrift> <Bd.-Nr.>), <Ort> <Jahr>{, S. <Seitenzahlen>}'
    }, stylerDescriptions: {
        book: 'Buch',
        chapter: 'Aufsatz in einem Sammelband',
        'article-journal': 'Zeitschriftenartikel',
        'entry-encyclopedia': 'Lexikoneintrag',
        'article-newspaper': 'Zeitungsartikel'
    },
    citSpecialDefaults: {
        ibidTerm: 'ibid.',
        firstNoteReferenceNumber: ' (wie Anm. <FN>)',
        subsequent: '[Autor<Name(sc)>], <Kurztitel>',
        abbreviateNamesSubsequent: false
    },
    cslDictionary: {
        Jahr: {
            type: 'date',
            content: 'date-parts="year" form="text" variable="issued"'
        },
        Autor: {type: 'name', name: 'author'},
        Herausgeber: {type: 'name', name: 'editor'},
        Vorname: { type: 'namePart', namePart: 'given' },
        Name: { type: 'namePart', namePart: 'family' },
        Titel: 'title',
        Bandtitel: 'container-title',
        Zeitschrift: 'container-title',
        Lexikon: 'container-title',
        Reihentitel: 'collection-title',
        'Bd.-Nr.': 'volume',
        Ort: 'publisher-place',
        Verlagsname: 'publisher',
        Auflage: 'edition',
        Seitenzahlen: 'page',
        Editor: {type: 'name', name: 'contributor'}, 
        Kurztitel: {
            type: 'variable',
            content: `variable="title" form="short"`
        },
        FN: 'first-reference-note-number'
    },
     generalSettingsDefaults: {
        etalTerm: 'et al.',
        name: 'Stil',
        author: 'Max Mustermann',
        description: 'Beschreibung'
     }
     
}

const languages = {
    'de': de,
    'en': en
}

export function getLang() {
  if (navigator.languages != undefined) 
    return navigator.languages[0]; 
  return navigator.language;
}


export const currentLocalization = () => {
    return languages[getLang()] || en
}


export function getLocalizedCSLTerms() {
    const dict = currentLocalization().cslDictionary
    const terms = Object.keys(dict)
    const nameTerms = []
    const variableTerms = []
    const namePartTerms = []
    for (const term of terms) {
        if (dict[term].name) {
            nameTerms.push(term)
        } else if (dict[term].namePart) {
            namePartTerms.push(term)
        } else {
            variableTerms.push(term)
        }

    }
    return { nameTerms, namePartTerms, variableTerms }
}

export const helpExistsIn = new Set(["en", "de"])