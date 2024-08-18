/* eslint-disable no-irregular-whitespace */

import * as convert from 'xml-js'
import { v4 as uuidv4 } from 'uuid';

function wrapCSLPart(part, content) {
  return `<${part}><layout>${content}</layout></${part}>`
}

function getCurrentXMLTimestamp() {
  const now = new Date()

  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  const day = String(now.getUTCDate()).padStart(2, '0')
  const hours = String(now.getUTCHours()).padStart(2, '0')
  const minutes = String(now.getUTCMinutes()).padStart(2, '0')
  const seconds = String(now.getUTCSeconds()).padStart(2, '0')

  const timestamp = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+00:00`

  return timestamp
}

export class CSLCreator {
  constructor(cslDictionary) {
    this.nameDelimiter = ', '
    this.et_al_min = 3
    this.abbreviateNames = true
    this.cslDictionary = cslDictionary
  }

  setCreatorParameters(info) {
    this.nameDelimiter = info.authorDelimiter
    this.et_al_min = info.etalMin
    this.abbreviateNames = info.abbreviateNames
  }

  parsePlaceholdersAndText(text) {
    // Regular expression to capture both placeholders and regular text
    const regex = /([{][^{}]*[}]|[[][^[\]]*[\]]|[<][^<>]*[>])|([^{}<>[\]]+)/g
    const matches = []
    let match
    //console.log('Now processing ' + text)
    // Iterate over each match from the regular expression
    while ((match = regex.exec(text)) !== null) {
      //console.log(match[0])
      if (match[1]) {
        // This is a placeholder match
        let type
        let content = match[1].slice(1, -1) // Remove the surrounding brackets
        //console.log(match[1])
        switch (
          match[1][0] // Check the first character to determine the type
        ) {
          case '{':
            type = 'facultative'
            //console.log('HERE')
            //console.log(match[1])
            // Recursively parse nested placeholders if they exist
            matches.push({ content: this.parseNestedPlaceholders(content), styling: null, type })
            break
          case '[':
            type = 'group'
            // Recursively parse nested placeholders if they exist
            matches.push({ content: this.parseNestedPlaceholders(content), styling: null, type })
            break
          case '<':
            type = 'variable'
            matches.push(this.createPlaceholderObject(this.evaluateStyling(content), type))
            break
          default:
            type = 'unknown'
            matches.push({ content, type: type })
        }
      } else if (match[2]) {
        // This is regular text
        matches.push({ content: match[2], type: 'text', styling: null })
        //  console.log(match[2])
        if (match[2].includes('<')) {
          console.warn('Found < in ', match[2])
        }
      }
    }
    return matches
  }

  evaluateStyling(input) {
    const regex = /\(..?\)/g
    const stylings = input.match(regex)
    const content = input.split('(')[0]
    let result = ''
    if (stylings) {
      for (const found of stylings) {
        switch (found) {
          case '(sc)':
            result += 'font-variant="small-caps" '
            break

          case '(i)':
            result += 'font-style="italic" '
            break

          case '(b)':
            result += 'font-weight="bold" '
            break
        }
      }
    }
    return { styling: result, content: content }
  }

  createPlaceholderObject(object, type) {
    return { ...object, type }
  }

  parseNestedPlaceholders(content) {
    // Regular expression to capture nested placeholders
    const nestedRegex = /([{][^{}]*[}]|[[][^[\]]*[\]]|[<][^<>]*[>])/g
    // Array to store the results
    const results = []
    // Variable to store the match object
    let nestedMatch
    // Variable to store the last index of a match
    let lastIndex = 0
    // Loop through each match
    while ((nestedMatch = nestedRegex.exec(content)) !== null) {
      // Check if there is text between the last match and the current match
      if (nestedMatch.index > lastIndex) {
        // Add the text between the placeholders as type 'text'
        results.push({ content: content.substring(lastIndex, nestedMatch.index), type: 'text' })
        //console.log('text oben' + content.substring(lastIndex, nestedMatch.index))
      }
      // Handle the nested placeholder
      // Check if the current match is a variable placeholder
      if (nestedMatch[0].charAt(0) === '<') {
        // Add the variable placeholder to the results array
        results.push(
          this.createPlaceholderObject(
            this.evaluateStyling(nestedMatch[0].slice(1, -1)),
            'variable'
          )
        )
        // Update the last index to the end of the current match
        lastIndex = nestedMatch.index + nestedMatch[0].length
      }
      // Check if the current match is a group placeholder
      else if (nestedMatch[0].charAt(0) === '[') {
        // Recursively parse any nested placeholders in the group placeholder
        results.push({
          content: this.parseNestedPlaceholders(nestedMatch[0].slice(1, -1)),
          styling: null,
          type: 'group'
        })
      }
      // If the current match is neither a variable nor a group placeholder, it is text
      else {
        // Add the text between the last match and the current match as type 'text'
        results.push({ content: content.substring(lastIndex, nestedMatch.index), type: 'text' })
        //console.log('text unten' + content.substring(lastIndex, nestedMatch.index))
      }
    }
    // Check if there is any remaining text after the last match
    if (lastIndex < content.length) {
      const textCandidate = content.substring(lastIndex)
      // Add the remaining text as type 'text'
      if (!textCandidate.includes('<')) {
        results.push({ content: textCandidate, type: 'text', styling: null })
      } else {
        const newCandidate = textCandidate.split(']')[1]
        if (!newCandidate.includes('<')) {
          results.push({ content: newCandidate, type: 'text', styling: null })
        }
      }
    }
    // Return the results array if it is not empty, otherwise return the original content
    return results.length ? results : content
  }
  // Example usage
  /*const inputString = "[Autor<Vorname(i)(b)(sc)><Name>], <Titel(sc)>{ (<Reihentitel(b)>, }{<Bd.-Nr.>)}, <Ort(i)>: <Verlagsname>, {<Auflage>, }<Jahr>";
  const placeholders = parsePlaceholdersAndText(inputString);
  console.log(JSON.stringify({ placeholders }));*/
  createTextCSLBlock(placeholder) {
    return `<text value="${placeholder.content}"/>`
  }
  // Create CSL block for a variable placeholder
  createVariableCSLBlock(placeholder) {
    let variableInfo = this.cslDictionary[placeholder.content]
    /*console.log(placeholder.content)
    console.log(variableInfo)
    console.log(typeof variableInfo)*/
    if (typeof variableInfo === 'string') {
      return `<text variable="${variableInfo}" ${placeholder.styling ? placeholder.styling : ''} />`
    } else if (variableInfo.type === 'date') {
      return `<date ${variableInfo.content} />`
    } else if (variableInfo.type === 'variable') {
      return `<text ${variableInfo.content} />`
    }
  }
  // Create CSL block based on placeholder type
  createCSLBlock(placeholder) {
    let result = ''
    switch (placeholder.type) {
      case 'text':
        result += this.createTextCSLBlock(placeholder)
        break
      case 'variable':
        result += this.createVariableCSLBlock(placeholder)
        break
      case 'group':
        result += this.createCSLGroupBlock(placeholder)
        break
      case 'facultative':
        result += `<choose><if variable="${this.cslDictionary[this.determineIfVariable(placeholder.content)]}" match="any">${placeholder.content.reduce(
          (accumulator, currentValue) => accumulator + this.createCSLBlock(currentValue),
          ''
        )}</if></choose>`
        break
    }
    result += '\n'
    return result
  }
  determineIfVariable(content) {
    //console.log(content)
    const variable = content.find((el) => el.type === 'variable')
    //console.log(variable)
    if (variable) {
      return variable.content
    } else {
      const name = content.find((el) => el.type === 'group')
      //console.log(name)
      return name.content[0].content
    }
  }

  // Create CSL group block for group placeholders
  createCSLGroupBlock(placeholder) {
    const nachvorvorname = placeholder.content[1].content === 'Name'
    let result;
    try {
      result = `<names variable="${this.cslDictionary[placeholder.content[0].content].name}">\n`
      result +=
        `<name delimiter="${this.nameDelimiter}" et-al-min="${this.et_al_min}" et-al-use-first="${1}" ${nachvorvorname ? 'name-as-sort-order="first"' : ''} ${this.abbreviateNames ? `initialize-with=". "` : ''} ${placeholder.content.length > 2 ? '' : `form="short"`} >` +
        '\n'
      for (const part of placeholder.content.slice(1)) {
        result +=
          `<name-part name="${this.cslDictionary[part.content].namePart}" ${part.styling ? part.styling : ''} />` +
          '\n'
      }
      result += '</name>\n</names>\n'
    } catch (error) {
      result = "<!-- ERROR: " + error + " -->\n"
      console.error(result)
    }
    // console.log(result)
    return result
  }
  // Create CSL representation for all placeholders
  createCSL(text) {
    const placeholders = this.parsePlaceholdersAndText(text)
    //console.log(JSON.stringify(placeholders))
    let result = ''
    for (let placeholder of placeholders) {
      if (placeholder.type === 'group') {
        result += this.createCSLGroupBlock(placeholder)
      } else {
        result += this.createCSLBlock(placeholder)
      }
    }
    return result
  }

  createStyle(info) {
    let text = this.createRawStyle(info)

    // make the generated xml look nice (needed, zotero won't accept it otherwise)
    const convertOptions = { compact: false, spaces: 4 }
    var jsonRepresentation = convert.xml2json(text, convertOptions)
    text = convert.json2xml(jsonRepresentation, convertOptions)

    //console.log('generated style:', text)

    return text
  }

  createTypeChooser(info) {
    let result = ''
    const types = Object.keys(info)

    for (const type of types) {
      if(typeof(type) ===  'string') 
        result += `<choose><if type="${type}" match="any">${this.createCSL(info[type])}</if></choose>`
      else // name variable
        result += `<choose><if type="${type.name}" match="any">${this.createCSL(info[type[1]])}</if></choose>`
    }

    return result
  }

  createCitation(info) {
    const citInfo = info.special

    const firstPositionCSL = this.createTypeChooser(info.regular)

    this.abbreviateNames = citInfo.abbreviateNamesSubsequent
    const subsequentCSL = this.createCSL(citInfo.subsequent)
    const firstReferenceNoteNumberCSL = this.createCSL(citInfo.firstNoteReferenceNumber)

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
`
    const content =
      `<choose><if match="all" position="first">` + firstPositionCSL + '</if></choose>' + special
    return wrapCSLPart('citation', content)
  }

  createStyleHead(info) {
    return `
  <?xml version="1.0" encoding="utf-8"?>
<style xmlns="http://purl.org/net/xbiblio/csl" class="note" version="1.0" demote-non-dropping-particle="never" default-locale="de">
  <info>
    <title>${info.title}</title>
    <id>${uuidv4()}</id>
    <author>
      <name>${info.name}</name>
    </author>
    <contributor>
      <name>Ludwig Patzold</name>
    </contributor>
    <summary>${info.summary}</summary>
    <updated>${getCurrentXMLTimestamp()}</updated>
    <category citation-format="note"/>
  </info>`
  }
  bundleLocaleUpdates(updatedTerms) {
    let result = "<locale><terms>"
    result += Object.keys(updatedTerms).reduce((accumulator, currentValue) => accumulator + `<term name="${currentValue}">${updatedTerms[currentValue]}</term>`, '')
    result += "</terms></locale>"
    return result
  }

  createRawStyle(info) {
    let result = ''

    result += this.createStyleHead(info.general)
    result += this.bundleLocaleUpdates(info.locale)
    //console.warn(JSON.stringify(info.bibliography.settings))
    this.setCreatorParameters(info.bibliography.settings)
    result += wrapCSLPart('bibliography', this.createTypeChooser(info.bibliography.content))
    this.setCreatorParameters(info.citation.settings)
    result += this.createCitation(info.citation.content)
    result += '</style>'

    return result
  }
}
