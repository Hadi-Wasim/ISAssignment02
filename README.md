# Information Security Project — Submission

Offensive & defensive security coursework in three parts. **Educational use only**
— every component targets code/environments you run and own locally.

## Contents

| Folder | Part | What it is |
|--------|------|------------|
| [`part1-buffer-overflow/`](part1-buffer-overflow/) | Q1 (30) | Stack buffer-overflow exploit (`stack.c`, `exploit.c`) + analysis & stack diagram |
| [`part2-web-security/`](part2-web-security/) | Q2 (100) | NovaBank: one full-stack app, two modes (vulnerable vs safe) — XSS, CSRF, SQLi + fixes |
| [`report/`](report/) | All 3 | The report (`IS-Assignment-Report.docx`) + evidence screenshots |

## Final submission (per the brief)

1. **One Word report** covering all 3 parts → [`report/IS-Assignment-Report.docx`](report/IS-Assignment-Report.docx)
   (20 pages, all screenshots embedded).
2. **One ZIP** containing Q1 + Q2 source → [`IS-submission-Q1-Q2.zip`](IS-submission-Q1-Q2.zip).
3. **GitHub** (Part 2) → push `part2-web-security/` with its README.

**Evidence** → [`report/screenshots/`](report/screenshots/): 20 full-screen captures
(taskbar + clock visible) across both modes, plus text logs. See
[`report/screenshots/INDEX.md`](report/screenshots/INDEX.md) for the file→figure map.

## Quick start

**Part 1 — buffer overflow (Linux / WSL):**
```bash
cd part1-buffer-overflow
sudo sysctl -w kernel.randomize_va_space=0
gcc -g -fno-stack-protector -z execstack -no-pie -o stack stack.c
gcc -o exploit exploit.c && ./exploit && ./stack     # overflow -> root shell
```

**Part 2 (Windows / macOS / Linux, Node ≥ 22):**
```bash
cd part2-web-security
npm install
npm run vuln     # vulnerabilities ON  -> http://localhost:3000
npm run safe     # defenses ON         -> http://localhost:3000
```

## Build the submission ZIP (Q1 + Q2, no node_modules)

PowerShell (Windows):
```powershell
# from C:\IS02
$tmp = "submission"
New-Item -ItemType Directory -Force $tmp | Out-Null
Copy-Item -Recurse -Force part1-buffer-overflow "$tmp\part1-buffer-overflow"
Copy-Item -Recurse -Force part2-web-security "$tmp\part2-web-security"
Remove-Item -Recurse -Force "$tmp\part2-web-security\node_modules" -ErrorAction SilentlyContinue
Compress-Archive -Path "$tmp\*" -DestinationPath "IS-submission-Q1-Q2.zip" -Force
Remove-Item -Recurse -Force $tmp
```

## Safety / scope

* Part 1's exploit only affects a program you compile yourself in an isolated VM/WSL
  with protections disabled; it has no effect on any other system.
* Part 2's `vulnerable` mode is intentionally insecure — run it on `localhost` only,
  never on a public/shared network.
* Part 3 is run only against the course-provided lab you control.
