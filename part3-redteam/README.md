# Part 3 - Red Team Engagement

No code: this is an engagement run against the self-contained vulnerable lab target
assigned for the module (its address rotates per student). Below is the methodology;
run it against the current target and record evidence (screenshots) at each phase.

## Scope / rules of engagement

Authorised, time-boxed, single target only. No denial-of-service. Log all actions.

## Phases

1. Reconnaissance
   - Host discovery: nmap -sn <range> to confirm the target is up.

2. Scanning and enumeration
   - nmap -p- -sC -sV -oN scan.txt <target>
   - Per service: gobuster dir (web), nikto (web server), enum4linux (SMB).
   - Map versions to known issues: searchsploit <service version>.

3. Exploitation (initial access)
   - Use one confirmed weakness (known CVE, web vuln, or weak/default creds) to get
     a low-privileged shell. Capture id/whoami of that user.

4. Privilege escalation
   - Linux: sudo -l, find / -perm -4000 -type f, linpeas.
   - Windows: whoami /priv, winPEAS.
   - Escalate to root/SYSTEM and confirm with id/whoami.

5. Post-exploitation
   - Collect proof (hashes, config, credentials). Note persistence/pivoting.
   - Remove uploaded tools; record every change.

6. Reporting
   - Per finding: title, severity (CVSS), affected component, reproduction steps,
     evidence, impact, remediation. End with a prioritised fix list and retest.
