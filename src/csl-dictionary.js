export const cslDictionary = {
  Jahr: {
    type: 'date',
    content: 'date-parts="year" form="text" variable="issued"'
  },
  Autor: 'author',
  Herausgeber: 'editor',
  Vorname: 'given',
  Name: 'family',
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
  Editor: 'contributor',
  Kurztitel: {
    type: 'variable',
    content: `variable="title" form="short"`
  },
  FN: 'first-reference-note-number'
}
