# SYNTAX TEST "source.perl" "quote-like operators"

my $q = q{it's};
#       ^^^^^^^ string.quoted.other.q-brace.perl
my $qq = qq<$name>;
#           ^^^^^ variable.other.readwrite.global.perl
my @w = qw( a b
#       ^^^^^^^ string.quoted.other.q-paren.perl
  c );
# <---- string.quoted.other.q-paren.perl
my $r = qr<a+>i;
#       ^^^^^^ string.regexp.compile.nested_ltgt.perl
#             ^ keyword.control.regexp-option.perl
$s =~ s/foo/bar/g;
#     ^^^^^^^^^^ string.regexp.replace.perl
#               ^ keyword.control.regexp-option.perl
$s =~ s{foo}{bar}g;
#     ^^^^^^^^^^^ string.regexp.replace.perl
#                ^ keyword.control.regexp-option.perl
s{foo}
# <------ string.regexp.replace.perl
 {bar}gx;
#^^^^^ string.regexp.replace.perl
#     ^^ keyword.control.regexp-option.perl
s{ (\w+) }   # a comment
 {$1}x;
#^^^^ string.regexp.replace.perl
# ^^ variable.other.subpattern.perl
#    ^ keyword.control.regexp-option.perl
s[a] /b/;
# <------- string.regexp.replace.perl
s(a)<$b>e;
# <-------- string.regexp.replace.perl
#       ^ keyword.control.regexp-option.perl
tr/a-z/A-Z/;
# <----------- string.regexp.replace.perl
y!a!b!;
# <------ string.regexp.replace.perl
tr{a-z}
  {A-Z}r;
# ^^^^^ string.regexp.replace.perl
#      ^ keyword.control.regexp-option.perl
my $next = 1;
#  ^^^^^ variable.other.readwrite.global.perl - string
my %h = (s => 1, y => 2);
#        ^ constant.other.key.perl
#                ^ constant.other.key.perl
my $size = -s($file);
#          ^^ keyword.operator.filetest.perl
#           ^ - string
$obj->s({ a => 1 });
#     ^ - string
s{::|'}{/}g;
#      ^^^ string.regexp.format.nested_braces.perl
#         ^ keyword.control.regexp-option.perl
my $after1 = 1;
#  ^^^^^^^ variable.other.readwrite.global.perl
$string =~ s{"}{\\"}g;
#                   ^ keyword.control.regexp-option.perl
my $after2 = 1;
#  ^^^^^^^ variable.other.readwrite.global.perl
s{(\d+)}{<$1>}g;
#       ^^^^^^ string.regexp.format.nested_braces.perl
#             ^ keyword.control.regexp-option.perl
s{a{2}}{b}r;
#         ^ keyword.control.regexp-option.perl
s{
    \s+  # spaces
}{ }gx;
# <-- string.regexp.replace.perl
my $after3 = 1;
#  ^^^^^^^ variable.other.readwrite.global.perl
