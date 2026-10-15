const fs = require('fs');
const { database } = require('./config/db');

// 1. Add column to live database safely
database.run('ALTER TABLE books ADD COLUMN call_number TEXT', (err) => {
  if (err && !err.message.includes('duplicate column')) return console.error(err);
  
  // 2. Assign shelf codes TK12091 to TK12100 to your existing books
  database.all('SELECT id FROM books ORDER BY id', (err, rows) => {
    rows.forEach((row, i) => {
      database.run('UPDATE books SET call_number = ? WHERE id = ?', [`TK${12091 + i}`, row.id]);
    });
    console.log("✅ Database updated with Shelf Call Numbers!");
  });
});

// 3. Patch schema.sql for future initializations
let schema = fs.readFileSync('models/schema.sql', 'utf8');
if (!schema.includes('call_number TEXT')) {
  schema = schema.replace('isbn    TEXT UNIQUE,', 'isbn    TEXT UNIQUE,\n  call_number TEXT,');
  fs.writeFileSync('models/schema.sql', schema);
}

// 4. Patch books.xml to include the data
let xml = fs.readFileSync('data/books.xml', 'utf8');
if (!xml.includes('<call_number>')) {
  let counter = 12091;
  xml = xml.replace(/<\/isbn>/g, () => `</isbn><call_number>TK${counter++}</call_number>`);
  fs.writeFileSync('data/books.xml', xml);
}

// 5. Patch books.xsd to validate the new field
let xsd = fs.readFileSync('data/books.xsd', 'utf8');
if (!xsd.includes('name="call_number"')) {
  xsd = xsd.replace(
    '<xs:element name="isbn" type="xs:string"/>', 
    '<xs:element name="isbn" type="xs:string"/>\n              <xs:element name="call_number" type="xs:string"/>'
  );
  fs.writeFileSync('data/books.xsd', xsd);
}

console.log("✅ XML and XSD schemas updated successfully!");
