const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync(':memory:');

db.exec(`
  CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, fullName TEXT);
  CREATE TABLE accounts (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER, accountNo TEXT, balance REAL);
  CREATE TABLE transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER, description TEXT, amount REAL, createdAt TEXT DEFAULT (datetime('now')));
  CREATE TABLE messages (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER, author TEXT, body TEXT, createdAt TEXT DEFAULT (datetime('now')));
`);

const users = [
  ['hadi', '1234', 'hadi wasim'],
  ['abc', 'xyz', 'abc'],
  ['admin', 'S3cr3t-Admin!', 'System Admin'],
];
const balances = [5230.75, 812.40, 99999.00];

users.forEach((u, i) => {
  const info = db.prepare('INSERT INTO users (username, password, fullName) VALUES (?, ?, ?)').run(...u);
  const userId = Number(info.lastInsertRowid);
  db.prepare('INSERT INTO accounts (userId, accountNo, balance) VALUES (?, ?, ?)').run(userId, 'NB-1000-' + (1000 + userId), balances[i]);
});

db.prepare('INSERT INTO transactions (userId, description, amount) VALUES (?, ?, ?)').run(1, 'Grocery store purchase', -72.19);
db.prepare('INSERT INTO transactions (userId, description, amount) VALUES (?, ?, ?)').run(1, 'Salary deposit', 3200.00);
db.prepare('INSERT INTO transactions (userId, description, amount) VALUES (?, ?, ?)').run(1, 'Electricity bill payment', -143.50);
db.prepare('INSERT INTO messages (userId, author, body) VALUES (?, ?, ?)').run(3, 'admin', 'Welcome to support. Post your questions here.');

module.exports = db;
