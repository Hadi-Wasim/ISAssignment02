#include <stdlib.h>
#include <stdio.h>
#include <string.h>

int bof(char *str) {
    char buffer[12];
    strcpy(buffer, str);
    return 1;
}

int main() {
    char input[517];
    FILE *badFile = fopen("badfile", "r");
    fread(input, sizeof(char), 517, badFile);
    fclose(badFile);
    bof(input);
    printf("Returned Properly\n");
    return 1;
}
