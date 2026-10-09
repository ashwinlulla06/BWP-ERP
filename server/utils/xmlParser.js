const fs = require("fs");
const { DOMParser } = require("xmldom");

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

// SAX: streams events, doesn't load the whole tree. Do this last.
function parseWithSAX(xmlFilePath) {
  // TODO
}

module.exports = { parseWithDOM, parseWithSAX };
