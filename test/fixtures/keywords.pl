# SYNTAX TEST "source.perl" "core keywords"

use v5.38;
# <--- keyword.control.perl
use feature qw(try class defer);
try { risky() } catch ($e) { warn $e } finally { cleanup() }
# <--- keyword.control.perl
#               ^^^^^ keyword.control.perl
#                                      ^^^^^^^ keyword.control.perl
defer { close $fh }
# <----- keyword.control.perl
class Point 1.0 {
# <----- keyword.control.perl
#     ^^^^^ entity.name.type.class.perl
    field $x :param = 0;
#   ^^^^^ storage.modifier.perl
    method length { return 1 }
#   ^^^^^^ storage.type.method.perl
#          ^^^^^^ entity.name.function.perl
    ADJUST { $x //= 0 }
#   ^^^^^^ entity.name.function.perl
}
package Foo::Bar;
# <------- keyword.control.perl
#       ^^^^^^^^ entity.name.type.class.perl
sub add ($a, $b = 2) { return $a + $b }
# <--- storage.type.sub.perl
#   ^^^ entity.name.function.perl
$promise->catch(sub { 1 })->finally(1);
#         ^^^^^ - keyword
#                            ^^^^^^^ - keyword
$self->method;
#      ^^^^^^ - storage
my %opt = (method => 'GET', field => 1, class => 'x');
#          ^^^^^^ constant.other.key.perl
#                           ^^^^^ constant.other.key.perl
#                                       ^^^^^ constant.other.key.perl
has name => (is => 'ro');
# <--- - keyword
# <--- - storage
