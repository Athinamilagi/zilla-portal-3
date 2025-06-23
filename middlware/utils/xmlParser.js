const { XMLParser } = require('fast-xml-parser');

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_'
});

const parseXML = (xmlString) => {
    try {
        return parser.parse(xmlString);
    } catch (error) {
        throw new Error(`Failed to parse XML: ${error.message}`);
    }
};

module.exports = {
    parseXML
}; 