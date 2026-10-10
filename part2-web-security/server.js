const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const path = require('path');
const config = require('./config');
const db = require('./db');

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  name: 'novabank.sid',
  secret: 'demo-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: config.isSafe ? 'strict' : 'lax' },
}));

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function csrfToken(req) {
  if (!req.session.csrf) req.session.csrf = crypto.randomBytes(16).toString('hex');
  return req.session.csrf;
}

function requireLogin(req, res, next) {
  if (!req.session.uid) return res.redirect('/');
  next();
}

function page(req, body) {
  const nav = req.session.uid
    ? '<a href="/dashboard">Dashboard</a> | <a href="/transfer">Transfer</a> | <a href="/support">Support</a> | <a href="/profile">Profile</a> | <a href="/search">Search</a> | <a href="/logout">Logout</a>'
    : '';
  return '<!doctype html><html><head><meta charset="utf-8"><title>NovaBank</title></head><body>'
    + '<p>mode: ' + config.mode + '</p><p>' + nav + '</p><hr>' + body + '</body></html>';
}

function loginPage(req, error) {
  return page(req,
    '<h2>Login</h2>'
    + (error ? '<p>' + esc(error) + '</p>' : '')
    + '<form method="post" action="/login">'
    + 'username <input name="username"><br>'
    + 'password <input name="password" type="password"><br>'
    + '<button>Sign in</button></form>'
    + '<p>accounts: alice/Password123!, bob/hunter2, admin/S3cr3t-Admin!</p>'
    + '<p><a href="/forgot">Forgot username?</a></p>');
}

app.get('/', (req, res) => req.session.uid ? res.redirect('/dashboard') : res.send(loginPage(req)));

app.post('/login', (req, res) => {
  const username = req.body.username || '';
  const password = req.body.password || '';
  let user;
  if (config.isSafe) {
    if (!/^[A-Za-z0-9_.\-]{1,32}$/.test(username)) return res.status(400).send(loginPage(req, 'Invalid username format.'));
    user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);
  } else {
    const sql = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
    console.log('[login] ' + sql);
    try { user = db.prepare(sql).get(); } catch (e) { console.log(e.message); }
  }
  if (user) {
    req.session.uid = user.id;
    req.session.username = user.username;
    req.session.fullName = user.fullName;
    return res.redirect('/dashboard');
  }
  res.status(401).send(loginPage(req, 'Invalid credentials.'));
});

app.get('/dashboard', requireLogin, (req, res) => {
  const acct = db.prepare('SELECT * FROM accounts WHERE userId = ?').get(req.session.uid);
  const txns = db.prepare('SELECT description, amount, createdAt FROM transactions WHERE userId = ? ORDER BY id DESC').all(req.session.uid);
  const rows = txns.map(t => '<tr><td>' + esc(t.description) + '</td><td>' + t.amount + '</td><td>' + esc(t.createdAt) + '</td></tr>').join('');
  res.send(page(req,
    '<h2>Welcome, ' + esc(req.session.fullName) + '</h2>'
    + '<p>Account ' + esc(acct.accountNo) + ' balance $' + acct.balance.toFixed(2) + '</p>'
    + '<form method="get" action="/search">search <input name="q"><button>Search</button></form>'
    + '<table border="1"><tr><th>description</th><th>amount</th><th>date</th></tr>' + rows + '</table>'));
});

app.get('/search', requireLogin, (req, res) => {
  const q = req.query.q;
  if (q === undefined) return res.send(page(req, '<h2>Search</h2><form method="get" action="/search"><input name="q"><button>Search</button></form>'));
  let rows, sql;
  if (config.isSafe) {
    rows = db.prepare('SELECT id, description, amount FROM transactions WHERE userId = ? AND description LIKE ?').all(req.session.uid, '%' + q + '%');
  } else {
    sql = "SELECT id, description, amount FROM transactions WHERE userId = " + Number(req.session.uid) + " AND description LIKE '%" + q + "%'";
    console.log('[search] ' + sql);
    try { rows = db.prepare(sql).all(); } catch (e) { rows = [{ id: '!', description: e.message, amount: '' }]; }
  }
  const list = rows.map(r => '<tr><td>' + esc(String(r.id)) + '</td><td>' + (config.isSafe ? esc(r.description) : r.description) + '</td><td>' + esc(String(r.amount)) + '</td></tr>').join('');
  res.send(page(req,
    '<h2>Search</h2>'
    + '<form method="get" action="/search"><input name="q" value="' + esc(q) + '"><button>Search</button></form>'
    + '<p>Results for ' + (config.isSafe ? esc(q) : q) + '</p>'
    + '<table border="1"><tr><th>id</th><th>description</th><th>amount</th></tr>' + list + '</table>'
    + (sql ? '<pre>' + esc(sql) + '</pre>' : '')));
});

app.get('/forgot', (req, res) => res.send(page(req,
  '<h2>Check username</h2>'
  + '<input id="u"><button onclick="check()">Check</button><p id="out"></p>'
  + '<script>function check(){fetch("/api/check-user?u="+encodeURIComponent(document.getElementById("u").value)).then(r=>r.json()).then(j=>{document.getElementById("out").textContent=j.exists?"That username EXISTS.":"No such username."})}</script>')));

app.get('/api/check-user', (req, res) => {
  const u = req.query.u || '';
  if (config.isSafe) {
    const row = db.prepare('SELECT COUNT(*) AS c FROM users WHERE username = ?').get(u);
    return res.json({ exists: row.c > 0 });
  }
  const sql = "SELECT COUNT(*) AS c FROM users WHERE username = '" + u + "'";
  console.log('[check] ' + sql);
  try { const row = db.prepare(sql).get(); res.json({ exists: row.c > 0 }); } catch (e) { res.json({ exists: false }); }
});

app.get('/transfer', requireLogin, (req, res) => {
  const acct = db.prepare('SELECT * FROM accounts WHERE userId = ?').get(req.session.uid);
  res.send(page(req,
    '<h2>Transfer</h2><p>balance $' + acct.balance.toFixed(2) + '</p>'
    + '<form method="post" action="/transfer">'
    + 'to <input name="to"><br>amount <input name="amount" type="number" step="0.01"><br>'
    + '<input type="hidden" name="_csrf" value="' + csrfToken(req) + '"><button>Send</button></form>'));
});

app.post('/transfer', requireLogin, (req, res) => {
  const to = (req.body.to || '').trim();
  const amount = Number(req.body.amount);
  if (config.isSafe && (!req.body._csrf || req.body._csrf !== req.session.csrf)) return res.status(403).send(page(req, '<h2>403 CSRF token missing or invalid</h2>'));
  db.prepare('UPDATE accounts SET balance = balance - ? WHERE userId = ?').run(amount || 0, req.session.uid);
  db.prepare('INSERT INTO transactions (userId, description, amount) VALUES (?, ?, ?)').run(req.session.uid, 'Transfer to ' + to, -(amount || 0));
  res.send(page(req, '<h2>Transfer</h2><p>Transferred $' + (amount || 0).toFixed(2) + ' to ' + esc(to) + '.</p>'));
});

app.get('/support', requireLogin, (req, res) => {
  const msgs = db.prepare('SELECT * FROM messages ORDER BY id DESC').all();
  const items = msgs.map(m => '<li>' + esc(m.author) + ': ' + (config.isSafe ? esc(m.body) : m.body) + '</li>').join('');
  res.send(page(req,
    '<h2>Support</h2>'
    + '<form method="post" action="/support"><textarea name="body"></textarea><br>'
    + '<input type="hidden" name="_csrf" value="' + csrfToken(req) + '"><button>Post</button></form>'
    + '<ul>' + items + '</ul>'));
});

app.post('/support', requireLogin, (req, res) => {
  if (config.isSafe && (!req.body._csrf || req.body._csrf !== req.session.csrf)) return res.status(403).send(page(req, '<h2>403 CSRF token invalid</h2>'));
  db.prepare('INSERT INTO messages (userId, author, body) VALUES (?, ?, ?)').run(req.session.uid, req.session.username, req.body.body || '');
  res.redirect('/support');
});

app.get('/profile', requireLogin, (req, res) => res.send(page(req,
  '<h2>Profile</h2><p>bio: <span id="bio"></span></p>'
  + '<script>window.APP_MODE=' + JSON.stringify(config.mode) + '</script><script src="/dom-xss.js"></script>')));

app.get('/logout', (req, res) => req.session.destroy(() => res.redirect('/')));

app.listen(config.port, () => console.log('NovaBank ' + config.mode + ' on http://localhost:' + config.port));
