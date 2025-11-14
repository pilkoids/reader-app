const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Remove existing database
const dbPath = path.join(__dirname, 'prisma', 'dev.db');
if (fs.existsSync(dbPath)) {
  try {
    fs.unlinkSync(dbPath);
    console.log('Removed existing database');
  } catch (err) {
    console.log('Could not remove database (may be locked), creating new one...');
  }
}

// Create new database
const db = new sqlite3.Database(dbPath);

// Read migration SQL
const migrationSQL = fs.readFileSync(
  path.join(__dirname, 'prisma/migrations/20250107000000_init/migration.sql'),
  'utf8'
);

console.log('Running migration SQL...');

db.serialize(() => {
  // Execute all SQL at once
  db.exec(migrationSQL, (err) => {
    if (err) {
      console.error('Error executing migration:', err.message);
      process.exit(1);
    }
    console.log('✓ Database tables created successfully!');
    db.close(() => {
      console.log('✓ Database setup complete!');
    });
  });
});
