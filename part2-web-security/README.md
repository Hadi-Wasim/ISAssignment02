# Part 2 - Web Application Security (NovaBank)

A small banking web app (Node.js + Express + SQLite) with two modes selected at
start-up. Same code, one flag:

    npm install
    npm run vuln    # vulnerabilities ON  -> http://localhost:3000
    npm run safe    # defenses ON         -> http://localhost:3000

Demo accounts: alice/Password123!, bob/hunter2, admin/S3cr3t-Admin!

## Files

- server.js  - all routes and the vulnerable/safe logic
- db.js      - in-memory SQLite database + seed data
- config.js  - picks vulnerable or safe mode
- public/dom-xss.js    - client script for the DOM XSS demo
- public/csrf-demo.html - malicious page for the CSRF demo

## Functionalities (each works in vuln mode, is blocked in safe mode)

1. Reflected XSS - GET /search?q=
   Payload: `<img src=x onerror=alert('Reflected-XSS')>`
   Vuln: the term is put into the HTML without encoding. Fix: output-encode it.

2. Stored XSS - POST /support (shown on GET /support)
   Payload: `<script>alert('Stored-XSS')</script>`
   Vuln: the saved message is rendered raw. Fix: encode on output.

3. DOM XSS - GET /profile#...  (public/dom-xss.js)
   Payload: `/profile#<img src=x onerror=alert('DOM-XSS')>`
   Vuln: the URL fragment is written with innerHTML. Fix: use textContent.

4. CSRF - POST /transfer
   Attack: while logged in, open /csrf-demo.html (auto-submits a $500 transfer).
   Vuln: no anti-CSRF token is checked. Fix: require a per-session _csrf token
   (and SameSite=Strict cookie).

5. SQL injection - easy (login bypass) - POST /login
   Payload (username): `' OR '1'='1' -- `   password: anything
   Vuln: input is concatenated into the query. Fix: parameterized query + input
   validation.

6. SQL injection - intermediate (blind boolean) - GET /api/check-user?u=
   Payload: `admin' AND substr(password,1,1)='S'-- ` returns exists:true/false,
   leaking the password one character at a time. Fix: parameterized query.

7. SQL injection - advanced (UNION) - GET /search?q=
   List tables: `x%' UNION SELECT 1,name,3 FROM sqlite_master WHERE type='table'-- `
   Dump creds: `x%' UNION SELECT id, username||':'||password, 0 FROM users-- `
   Fix: parameterized LIKE, so the payload is only data.

For educational use on localhost only.
