# SYNTAX TEST "source.perl" "special variables"

print ${^GLOBAL_PHASE};
#     ^^^^^^^^^^^^^^^^ variable.other.predefined.perl
local $^W = 0;
#     ^^^ variable.other.predefined.perl
print $@, $0, $_, @ARGV, %ENV;
#     ^^ variable.other.predefined.perl
#         ^^ variable.other.predefined.program-name.perl
#             ^^ variable.other.predefined.perl
#                 ^^^^^ variable.other.readwrite.global.perl
#                        ^^^^ variable.other.readwrite.global.perl
print "${name}s and $1";
#      ^^^^^^^ variable.other.readwrite.global.perl
#                   ^^ variable.other.subpattern.perl
