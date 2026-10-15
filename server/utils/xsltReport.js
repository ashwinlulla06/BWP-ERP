const fs = require("fs");
const path = require("path");
const os = require("os");
const { execSync } = require("child_process");

async function generateReportHtml(reservations, type) {
  let xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n<Report>\n';
  xmlString += `  <Title>UniReserve Master Report - ${type}</Title>\n`;
  xmlString += `  <GeneratedOn>${new Date().toDateString()}</GeneratedOn>\n`;
  xmlString += '  <Transactions>\n';

  for (const r of reservations) {
    xmlString += '    <Transaction>\n';
    xmlString += `      <ID>${r.id}</ID>\n`;
    xmlString += `      <Type>${r.type}</Type>\n`;
    xmlString += `      <Resource>${r.resource}</Resource>\n`;
    xmlString += `      <User>${r.user}</User>\n`;
    xmlString += `      <Date>${r.date}</Date>\n`;
    xmlString += `      <Status>${r.status}</Status>\n`;
    xmlString += '    </Transaction>\n';
  }
  xmlString += '  </Transactions>\n</Report>';

  const xslString = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:template match="/">
    <div style="background-color: white; padding: 32px; border: 1px solid #E2E8F0; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 32px; border-bottom: 2px solid var(--secondary); padding-bottom: 16px;">
        <h2><xsl:value-of select="Report/Title"/></h2>
        <p style="color: var(--text-muted)">Generated on: <xsl:value-of select="Report/GeneratedOn"/></p>
      </div>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #E2E8F0;">
        <thead>
          <tr style="background-color: #F1F5F9;">
            <th style="border: 1px solid #E2E8F0; padding: 12px; text-align: left;">Transaction ID</th>
            <th style="border: 1px solid #E2E8F0; padding: 12px; text-align: left;">Type</th>
            <th style="border: 1px solid #E2E8F0; padding: 12px; text-align: left;">Resource</th>
            <th style="border: 1px solid #E2E8F0; padding: 12px; text-align: left;">User</th>
            <th style="border: 1px solid #E2E8F0; padding: 12px; text-align: left;">Date</th>
            <th style="border: 1px solid #E2E8F0; padding: 12px; text-align: left;">Status</th>
          </tr>
        </thead>
        <tbody>
          <xsl:for-each select="Report/Transactions/Transaction">
            <tr>
              <td style="border: 1px solid #E2E8F0; padding: 12px;"><xsl:value-of select="ID"/></td>
              <td style="border: 1px solid #E2E8F0; padding: 12px;"><xsl:value-of select="Type"/></td>
              <td style="border: 1px solid #E2E8F0; padding: 12px;"><xsl:value-of select="Resource"/></td>
              <td style="border: 1px solid #E2E8F0; padding: 12px;"><xsl:value-of select="User"/></td>
              <td style="border: 1px solid #E2E8F0; padding: 12px;"><xsl:value-of select="Date"/></td>
              <td style="border: 1px solid #E2E8F0; padding: 12px;"><xsl:value-of select="Status"/></td>
            </tr>
          </xsl:for-each>
        </tbody>
      </table>
    </div>
  </xsl:template>
</xsl:stylesheet>`;

  const tmpDir = os.tmpdir();
  const xmlPath = path.join(tmpDir, `report-${Date.now()}.xml`);
  const xslPath = path.join(tmpDir, `report-${Date.now()}.xsl`);

  try {
    fs.writeFileSync(xmlPath, xmlString);
    fs.writeFileSync(xslPath, xslString);

    const htmlOutput = execSync(`xsltproc "${xslPath}" "${xmlPath}"`, { stdio: 'pipe' }).toString();
    
    fs.unlinkSync(xmlPath);
    fs.unlinkSync(xslPath);

    return htmlOutput;
  } catch (error) {
    if (fs.existsSync(xmlPath)) fs.unlinkSync(xmlPath);
    if (fs.existsSync(xslPath)) fs.unlinkSync(xslPath);
    
    console.warn("xsltproc failed.");
    return `<div style="padding: 32px; color: #721c24; background-color: #f8d7da; border-radius: 8px;">
      <h4>XSLT Processor Missing</h4>
      <p>Windows users: Install <strong>xsltproc</strong> to render this report.</p>
    </div>`;
  }
}

module.exports = { generateReportHtml };
