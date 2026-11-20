# SYNTAX TEST "source.perl" "regex vs division"

my $d = $a / $b / 2;
#          ^ - string
#               ^ - string
my $m = $str =~ /ab+c/;
#               ^^^^^^ string.regexp.find.perl
split /,/, $line;
#     ^^^ string.regexp.find.perl
my @hits = grep /x/, @list;
#               ^^^ string.regexp.find.perl
return /^ok/ ? 1 : 0;
#      ^^^^^ string.regexp.find.perl
die unless /done/;
#          ^^^^^^ string.regexp.find.perl
my $half = $total / 2;
#                 ^ - string
my $ok = !/bad/;
#         ^^^^^ string.regexp.find.perl
my $parts = [split /:/];
#                  ^^^ string.regexp.find.perl
#                     ^ - string
my $after1 = 1;
#  ^^^^^^^ variable.other.readwrite.global.perl
foreach (@$found) { s,/,\\,g }
my $after2 = 1;
#  ^^^^^^^ variable.other.readwrite.global.perl
next if $$textref =~ m/\G\s*->\s*\w+(?![{([])/gc;
#                                             ^^ keyword.control.regexp-option.perl
my $after3 = qr/(a(b)c)/x;
#                       ^ keyword.control.regexp-option.perl
my $after4 = 1;
#  ^^^^^^^ variable.other.readwrite.global.perl
