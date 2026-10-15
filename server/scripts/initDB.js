require('../config/db').initializeDatabase().then(() => { console.log('DB Initialized'); process.exit(0); }).catch((err) => { console.error(err); process.exit(1); });
