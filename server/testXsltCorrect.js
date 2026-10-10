const { XmlParser, Xslt } = require('xslt-processor');
const xmlParser = new XmlParser();
const xslt = new Xslt();

const xmlString = '<root><item>Hello</item></root>';
const xslString = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:template match="/">
    <output><xsl:value-of select="root/item"/></output>
  </xsl:template>
</xsl:stylesheet>`;

(async () => {
  try {
    const xmlDoc = xmlParser.xmlParse(xmlString);
    const xslDoc = xmlParser.xmlParse(xslString);
    const html = await xslt.xsltProcess(xmlDoc, xslDoc);
    console.log("Success:", html);
  } catch (e) {
    console.error("Caught error:", e);
  }
})();
