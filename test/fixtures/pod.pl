# SYNTAX TEST "source.perl" "POD blocks"

my $x = 1;

=head1 NAME

if this for while my $x
# <----------------------- comment.block.documentation.perl
# <----------------------- - keyword
# <----------------------- - storage
# <----------------------- - variable

=cut

my $y = 2;
# <-- storage.modifier.perl

=pod

<b>not html</b>
# <------------- comment.block.documentation.perl

=cut
