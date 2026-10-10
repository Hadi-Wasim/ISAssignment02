# Screenshot index

Full-screen captures taken on the Windows 11 desktop (the taskbar and system
clock are visible in every shot). The web captures are live runs of NovaBank in a
real browser; the red banner = `vulnerable` mode, the green banner = `safe` mode.
Each row maps a file to its figure in `../IS-Assignment-Report.docx`.

## Part 1 — buffer overflow

| File | Shows |
|------|-------|
| `09-part1-wsl-exploit-shell.png` | **Raw capture** of the real exploit in WSL2 (Ubuntu): compile → `./exploit` → `./stack` → root shell; `id` = `uid=0(root)`, and "Returned Properly" never prints |
| `evidence-part1-wsl-exploit.txt` | Full timestamped text log of the same WSL run |

## Part 2 — Vulnerable mode (attacks succeed)

| File | Figure | Shows |
|------|--------|-------|
| `01-login.png` | 2.1 | NovaBank login page (red VULNERABLE banner) |
| `02a-sqli-login-payload.png` | 2.11 | `' OR '1'='1' -- ` typed into the login form |
| `02b-sqli-login-bypass-dashboard.png` | 2.12 | Logged in as Alice with no valid credentials |
| `03-reflected-xss.png` | 2.2 | Reflected payload fires `alert('Reflected-XSS')` |
| `04-stored-xss.png` | 2.4 | Stored payload fires `alert('Stored-XSS')` on view (URL is just /support) |
| `05-dom-xss.png` | 2.6 | DOM payload (URL `#` fragment) fires `alert('DOM-XSS')` |
| `06a-sqli-blind-true.png` | 2.14 | Blind boolean: `substr(password,1,1)='S'` → "EXISTS" |
| `06b-sqli-blind-false.png` | 2.15 | Blind boolean: `='A'` → "No such username" |
| `07a-sqli-union-tables.png` | 2.17 | UNION via `sqlite_master` lists tables |
| `07b-sqli-union-dump.png` | 2.18 | UNION dumps credentials + shows injected SQL |
| `08a-csrf-balance-before.png` | 2.8 | Balance before the forged transfer ($5230.75) |
| `08b-csrf-attack-result.png` | 2.9 | After the malicious page: $500 sent to NB-1000-ATTACKER, balance $4730.75 |
| `evidence-server-sql-log.txt` | — | Raw injected SQL printed in the server-side log |

## Part 2 — Safe mode (attacks blocked)

| File | Figure | Shows |
|------|--------|-------|
| `20-safe-sqli-login-blocked.png` | 2.13 | Injection → "Invalid username format." (HTTP 400) |
| `21-safe-reflected-escaped.png` | 2.3 | Reflected payload shown as literal text, no alert |
| `22-safe-dom-escaped.png` | 2.7 | DOM payload shown as literal text (`textContent`) |
| `23-safe-csrf-403.png` | 2.10 | Forged transfer → "403 — CSRF token missing or invalid" |
| `24-safe-sqli-union-noleak.png` | 2.19 | UNION payload → "No matches", nothing leaked |
| `25-safe-sqli-blind-blocked.png` | 2.16 | Blind probe → "No such username" (injection neutralised) |
| `26-safe-stored-escaped.png` | 2.5 | Stored payload displayed as literal text, no execution |
