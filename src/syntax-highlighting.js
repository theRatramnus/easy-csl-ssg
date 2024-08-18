import { getLocalizedCSLTerms } from './localization.js'



export function getSegments(text) {
    const patterns = [
    { regex: namesRegex, class: "blue" }, // Square brackets
    { regex: variableRegex, class: "green" }, // Angle brackets
    { regex: /\(sc\)|\(i\)|\(b\)/g, class: "red" }, // Parentheses
    { regex: /\{([^}]+)\}/g, class: "orange" } // Curly brackets
  ];

  let allMatches = [];

  patterns.forEach(pattern => {
    let matches = [...text.matchAll(pattern.regex)];
    matches.forEach(m => {
      allMatches.push({
        start: m.index,
        end: m.index + m[0].length,
        tag: { class: pattern.class }
      });
    });
  });

  return allMatches;
}

const terms = getLocalizedCSLTerms()
const variableRegex = new RegExp(createRegexFrom('<', '>', terms.variableTerms), "g")
const namesRegex = new RegExp(createNamesRegex(terms.nameTerms, terms.namePartTerms), "g")

function createRegexFrom(openingBracket, closingBracket, terms) {
  // create strings to use in regex constructor from terms
  const regexForTerms = terms.reduce((accumulator, currentValue) => { return accumulator + currentValue + '|' }, '')
  const stylings = "\\(sc\\)|\\(i\\)|\\(b\\)"
  const regexString = `\\${openingBracket}(${regexForTerms.substring(0, regexForTerms.length - 1)})(${stylings})?\\${closingBracket}`
  return regexString
}

function createNamesRegex(nameTerms, namePartTerms) {
  let regexString = "\\["
  let nameTermsString = "(" + nameTerms.reduce((accumulator, currentValue) => { return accumulator + currentValue + '|' }, '')
  nameTermsString = nameTermsString.substring(0, nameTermsString.length - 1) + ")"
  regexString += nameTermsString
  regexString += "(" + createRegexFrom('<', '>', namePartTerms) + ")+"
  regexString += "\\]"
  return regexString
}