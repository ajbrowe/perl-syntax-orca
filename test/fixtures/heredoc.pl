# SYNTAX TEST "source.perl" "heredocs"

my $x = <<"EOT";
#       ^^ string.unquoted.heredoc.interpolated.perl punctuation.definition.string.begin.perl
Hello $name
# <----- string.unquoted.heredoc.interpolated.perl
#     ^^^^^ variable.other.readwrite.global.perl
EOT
# <--- punctuation.definition.string.end.perl
my $after = 1;
# <-- storage.modifier.perl

my $raw = <<~'EOT';
#         ^^^ string.unquoted.heredoc.raw.perl
    raw $text
#   ^^^^^^^^^ string.unquoted.heredoc.raw.perl - variable
    EOT
#   ^^^ punctuation.definition.string.end.perl
my $bare = <<EOT;
bare $v
#    ^^ string.unquoted.heredoc.interpolated.perl variable.other.readwrite.global.perl
EOT
# <--- punctuation.definition.string.end.perl

my $sql = <<'SQL';
SELECT * FROM t
# <------ string.unquoted.heredoc.raw.perl
SQL
# <--- punctuation.definition.string.end.perl

my $html = <<"HTML";
<p>$title</p>
# <--- string.unquoted.heredoc.interpolated.perl
#  ^^^^^^ variable.other.readwrite.global.perl
HTML
# <---- punctuation.definition.string.end.perl
print 1;
# <----- support.function.perl
