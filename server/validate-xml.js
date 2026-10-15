const { execSync } = require("child_process");
const path = require("path");

const xmlPath = path.join(__dirname, "data", "books.xml");
const xsdPath = path.join(__dirname, "data", "books.xsd");

try {
  console.log("Validating books.xml against books.xsd...");
  // xmllint is a standard Linux tool for XML validation
  const output = execSync(`xmllint --noout --schema "${xsdPath}" "${xmlPath}"`, { 
    encoding: 'utf8', 
    stdio: 'pipe' 
  });
  console.log("✅ Success: XML is valid according to the XSD schema!");
} catch (error) {
  console.error("❌ Validation Failed!");
  console.error(error.stderr || error.message);
}
