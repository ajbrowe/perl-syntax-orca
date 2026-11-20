# Perl Syntax for Orca

An Orca IDE plugin that colours Perl source code in Orca's editor.

## Language

**Perl**:
Perl 5, the language run by the `perl` interpreter.
_Avoid_: Perl 6, Raku (a separate language, out of scope)

**Syntax plugin**:
An Orca plugin made only of data that contributes one or more grammars and claims which files they apply to.
_Avoid_: extension, language pack

**Grammar**:
A TextMate grammar that maps Perl text to named scopes for colouring.
_Avoid_: lexer, parser, highlighter

## Perl constructs

**POD block**:
Embedded documentation running from a line starting with `=word` up to `=cut` (or end of file). Treated as a single comment-like unit.
_Avoid_: POD comment, docblock

**Heredoc**:
A string whose body starts on the line after its `<<TERMINATOR` marker and ends at a line holding only the terminator.
_Avoid_: here-document, here-string

**Quote-like operator**:
One of `q qq qw qr m s tr y`, followed by delimiters the author chooses.
_Avoid_: quote operator, string literal

**Data section**:
Everything after a `__END__` or `__DATA__` line. It's data, not code.
_Avoid_: trailer, footer
