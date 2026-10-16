const path = require("path");
const { parseWithSAX } = require("./utils/xmlParser");

const xmlPath = path.join(__dirname, "data", "books.xml");

parseWithSAX(xmlPath)
  .then(counts => {
    console.log("SAX Parser output (Books per Author):");
    console.table(counts);
  })
  .catch(err => console.error("SAX Error:", err));
