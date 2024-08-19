# easy-csl-ssg
An easy to use generator for CSL (Citation Style Language) files to use in a citation manager (e.g. Zotero).

## Contribute

Expanding the project is very easy, you don't really need to know how to code and you can do it right here in the browser.
Without really coding, you could:
 - translate the project to a new language
 - add a new variable placeholder
 - add a new "type" like `book` or `chapter` 

For this you'll only need to change one file: [localization.js](https://github.com/theRatramnus/easy-csl-ssg/blob/main/src/localization.js). (Just click the little pencil in the top right.)
### Translating
Just duplicate the `const en = {...}`-object and change the content in the speech marks to the right of the colons.
One exception: the `cslDictionary`-subobject. There you will need to change the content _before_ the colons.

### Adding a new variable placeholder
For this, you'll just create a new entry in the `cslDictionary`-subobject.
On the left of the colon will be the user-facing name and on the right the CSL spec name of the variable. You can find all available variables [here](https://docs.citationstyles.org/en/stable/specification.html#appendix-iv-variables).
### Adding a new type
For this, you just need to add new entries to the `stylerDefaults` and `stylerDescriptions` subobjects. Both entries need to have the same key (left side of the colon) which needs to be one of [these](https://docs.citationstyles.org/en/stable/specification.html#appendix-iii-types) to work.
###

Once you're done just open a pull request and if anything is unclear open an issue.

## Thanks
Thank you 
- to citationstyles.org for the Citation Style Language.
- @Juris-M for [citeproc-js](https://github.com/Juris-M/citeproc-js).
- @nashwaan for [xml-js](https://github.com/nashwaan/xml-js).
- @deerchao for [vue-hilight-textarea](https://github.com/deerchao/vue-hilight-textarea) and the website theme 🙃.
- @davidmyersdev for [vite-plugin-node-polyfills](https://github.com/davidmyersdev/vite-plugin-node-polyfills).
- @antfu-collective for [vite-ssg](https://github.com/antfu-collective/vite-ssg).
- @uuidjs for [uuid](https://github.com/uuidjs/uuid).

Built using Vue.

> Written with [StackEdit](https://stackedit.io/).