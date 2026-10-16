const { execSync } = require("child_process");
const path = require("path");
const os = require("os");

const xmlPath = path.join(__dirname, "data", "books.xml");
const xsdPath = path.join(__dirname, "data", "books.xsd");

console.log("Validating books.xml against books.xsd...");

if (os.platform() === 'win32') {
  console.log("⚠️  Skipping: 'xmllint' is not natively available on Windows.");
  console.log("Please run this script on the Fedora machine for the viva demonstration.");
  process.exit(0);
}

try {
  execSync(`xmllint --noout --schema "${xsdPath}" "${xmlPath}"`, { 
    encoding: 'utf8', 
    stdio: 'pipe' 
  });
  console.log("✅ Success: XML is valid according to the XSD schema!");
} catch (error) {
  console.error("❌ Validation Failed!");
  console.error(error.stderr || error.message);
}
