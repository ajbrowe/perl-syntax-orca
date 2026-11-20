# perl-syntax-orca

Perl 5 syntax highlighting for [Orca](https://orca.dev). It's a data-only syntax plugin, so it runs no code and installs in one click.

It covers `.pl`, `.pm` and `.t` files. Orca can't hand files to a plugin by shebang, so extensionless scripts keep Orca's built-in Perl highlighting.

## Install

```sh
orca plugin install ajbrowe/perl-syntax-orca
```

You can also add this repository under **Settings → Plugins**. The plugin installs as `ajbrowe.perl-syntax` and needs Orca 1.4.246 or later.

## What it highlights

- **Heredocs:** `<<"EOT"`, `<<'EOT'`, `<<EOT` and indented `<<~EOT`.
- **Quote-like operators:** `q qq qw qr m s tr y` with any delimiter. This includes `s{…}{…}` and `tr{…}{…}` with the replacement on a later line, and comments between the two parts.
- **Regex or division:** a `/` counts as the start of a match after `=~`, `(`, `{`, `!`, `=`, `if`, `unless`, `split`, `grep`, `map`, `join`, `return`, `and`, `or`, `not` and similar. Anywhere else it's division.
- **Variables**, including special ones: `$_`, `$@`, `$0`, `$^W`, `${^GLOBAL_PHASE}`, `$1`.
- **POD blocks**, from `=head1` (or `=pod` and the like) up to `=cut`, coloured as a comment.
- **`__END__` and `__DATA__`:** everything after them is treated as data, not code.
- **Core keywords up to Perl 5.38:** `try`/`catch`/`finally`/`defer`, `class`/`field`/`method`/`ADJUST`, `state`, and subroutine signatures.

### Known limitations

TextMate grammars work one line at a time, and this plugin never runs perl ([ADR 0001](docs/adr/0001-textmate-grammar-not-perl.md)). As a result:

- Regex versus division is a guess based on the token before the `/` on the same line. A line that starts with `/` is treated as a regex.
- Stacked heredocs on one line (`<<A, <<B`) aren't supported.
- In `s{…}{…}`, the pattern part must close on the line where it opens. The replacement part may come later.
- Anything that depends on prototypes or imported functions isn't handled.
- Moose/Moo words such as `has`, `extends` and `around` are coloured as ordinary function calls.
- SQL, HTML and similar code inside heredocs is coloured as a plain string, because Orca doesn't highlight embedded languages from plugins.

## Development

The grammar is generated. `upstream/perl.tmLanguage.json` is VS Code's Perl grammar, unmodified. `scripts/patch-grammar.mjs` applies this plugin's changes and writes `syntaxes/perl.tmLanguage.json`. Edit the script, not the generated file.

```sh
npm install
npm run build      # regenerate syntaxes/perl.tmLanguage.json
npm test           # scope assertions in test/fixtures/*.pl
npm run check      # Orca limits: sizes, includes, 50 ms per line over perl's own library
npm run validate   # orca-plugin.json against Orca's manifest schema
```

`npm run check` times every line of perl's installed library when `perl` is on `PATH`. Pass directories to time a different corpus: `node test/check-limits.mjs ~/src/my-perl-app`.

To see your changes live, run `orca plugin dev watch .` in this folder. On Linux the CLI is called `orca-ide` (in the `.deb` install it's `/opt/Orca/resources/bin/orca-ide`), because `orca` there is usually the GNOME screen reader.

### Writing fixtures

Each fixture starts with `# SYNTAX TEST "source.perl" "<description>"`. Below a line of Perl, an assertion line marks columns with `^` (or with `<-` from column 0) and lists the scopes expected there. See [vscode-tmgrammar-test](https://github.com/PanAeon/vscode-tmgrammar-test).

- Scope names must match in full. `string.regexp` doesn't match `string.regexp.replace.perl`.
- Use at most one `- excluded.scope` per assertion line. More than one makes vscode-tmgrammar-test 0.1.3 hang, so repeat the line for each exclusion.

### Changes from upstream

Each change is a numbered step in `scripts/patch-grammar.mjs`:

1. Drops the heredoc and POD rules that embed other languages. Orca would leave those regions uncoloured, and the generic rules colour them as strings instead.
2. Renames upstream's `string.regexp.replaceXXX` placeholder scopes.
3. Gives every `s///` region an outer `string.regexp.replace.perl` scope.
4. Adds `s`/`tr`/`y` with bracketing delimiters, where the replacement part may be on a later line.
5. Recognises more tokens before a `/` as starting a match, and lets a match end before `]`.
6. Adds the `${^NAME}` and `$^X` special variables.
7. Adds the core keywords `try`, `catch`, `finally`, `defer`, `class`, `field`, `method`, `ADJUST` and `state`.
8. Treats a bareword before `=>` as a hash key, including `s`, `y` and `q`.
9. Stops `m/…/` and `qr/…/` from nesting parentheses, so an unbalanced `(` inside a character class no longer leaves the match open.

To update upstream, replace `upstream/perl.tmLanguage.json` and run `npm run build`. If upstream rules have changed, the script stops with a "cannot find" error.

## Releasing

1. Bump `version` in `orca-plugin.json`.
2. Run `orca plugin validate .` (`orca-ide` on Linux).
3. Commit, then tag and push: `git tag -a vX.Y.Z -m vX.Y.Z && git push --follow-tags`.

The repository has the `orca-plugin` GitHub topic, so releases appear at `orca.dev/plugins/ajbrowe/perl-syntax-orca`.

## License

The plugin is MIT licensed. The grammar comes from [textmate/perl.tmbundle](https://github.com/textmate/perl.tmbundle) by way of VS Code. See [syntaxes/perl-LICENSE.txt](syntaxes/perl-LICENSE.txt).
