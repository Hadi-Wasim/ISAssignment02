# Part 1 - Stack-Based Buffer Overflow

Exploit a vulnerable C program to overwrite the saved return address and spawn a
shell. Run inside a Linux VM / WSL you own, with protections disabled.

## Files

- stack.c   - vulnerable program: copies 517 bytes into a 12-byte buffer with strcpy
- exploit.c - builds badfile: NOP sled + shellcode + new return address

## Why it works

strcpy does no bounds checking, so 517 attacker bytes overflow the 12-byte buffer
and overwrite the saved return address that sits above it on the stack. badfile is
a NOP sled (0x90) with the shellcode near the end and the return address at offset
20 overwritten to point back into the sled, which slides execution into the
execve("/bin/sh") shellcode.

## Build and run

    sudo sysctl -w kernel.randomize_va_space=0
    gcc -g -fno-stack-protector -z execstack -no-pie -o stack stack.c
    gcc -o exploit exploit.c
    ./exploit
    ./stack

Success = a shell and no "Returned Properly" line. Confirm with `id`.
The return address 0x7fffffffe594 was measured on the WSL2 host used here; on a
different machine find it with gdb (break bof; run; p &buffer) and update exploit.c.
