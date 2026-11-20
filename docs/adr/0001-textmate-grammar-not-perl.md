# Highlight with a pure TextMate grammar, never by invoking perl

Only perl can parse Perl exactly, so we considered running a local `perl` when one is available and falling back to a grammar when it isn't. We rejected this for two reasons.

- **Orca has no route for it.** Syntax plugins are data-only TextMate grammars. Code-running plugins (`trusted-worker`) have no contribution point that can feed tokens or decorations into the normal code editor.
- **It would execute the file.** perl can't tokenise without compiling, and compiling runs `BEGIN` blocks and `use` imports. Opening an untrusted `.pm` would run its code.

The plugin is therefore a single TextMate grammar, with its limits accepted: regex vs. division is decided by the token before it on the same line, and stacked heredocs aren't supported.

## Consequences

If Orca gains language-server or semantic-token support for plugins, a separate project could add Perl::LanguageServer tokens on top of this grammar. That change should supersede this ADR, not be added to this grammar.
