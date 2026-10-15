const fs = require("fs");
const { DOMParser } = require("xmldom");
const sax = require("sax");

// DOM: loads the whole XML tree into memory, then walks it.
function parseWithDOM(xmlFilePath) {
  const xml = fs.readFileSync(xmlFilePath, "utf-8");
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  const nodes = doc.getElementsByTagName("book");
  const books = [];

  for (let i = 0; i < nodes.length; i++) {
    const get = (tag) => nodes[i].getElementsByTagName(tag)[0].textContent.trim();
    books.push({
      title: get("title"),
      author: get("author"),
      isbn: get("isbn"),
      status: get("status"),
    });
  }
  return books;
}

// SAX: streams events line-by-line, highly efficient for large read-only files.
function parseWithSAX(xmlFilePath) {
  return new Promise((resolve, reject) => {
    const saxStream = sax.createStream(true); // true = strict mode
    const authorCounts = {};
    let currentTag = null;

    saxStream.on("opentag", (node) => {
      currentTag = node.name;
    });

    saxStream.on("text", (text) => {
      const val = text.trim();
      if (currentTag === "author" && val) {
        authorCounts[val] = (authorCounts[val] || 0) + 1;
      }
    });

    saxStream.on("closetag", () => {
      currentTag = null;
    });

    saxStream.on("error", (error) => {
      reject(error);
    });

    saxStream.on("end", () => {
      resolve(authorCounts);
    });

    // Pipe the file stream directly into the SAX parser
    fs.createReadStream(xmlFilePath).pipe(saxStream);
  });
}

module.exports = { parseWithDOM, parseWithSAX };
