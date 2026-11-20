// Applies this plugin's changes to the upstream VS Code Perl grammar.
// Usage: node scripts/patch-grammar.mjs <upstream perl.tmLanguage.json> <output>
// Every change is listed in README.md under "Changes from upstream".
import { readFileSync, writeFileSync } from 'node:fs';

const [src, out] = process.argv.slice(2);
const g = JSON.parse(readFileSync(src, 'utf8'));

const findTop = (pred, what) => {
  const i = g.patterns.findIndex(pred);
  if (i < 0) throw new Error(`upstream grammar changed: cannot find ${what}`);
  return i;
};
const beginStarts = (s) => (p) => (p.begin || '').startsWith(s);

// 1. Orca leaves regions from external grammars unhighlighted, so drop the
//    embedded-language heredoc variants; the generic heredoc rules give the
//    same string scopes. Same for POD `=begin html`.
const external = (p) => (p.patterns || []).some((q) =>
  (q.patterns || []).some((r) => r.include && !r.include.startsWith('#') && !r.include.startsWith('$')));
g.repository.heredoc.patterns = g.repository.heredoc.patterns.filter((p) => !external(p));
g.repository.pod.patterns = g.repository.pod.patterns.filter((p) =>
  !(p.patterns || []).some((q) => q.include === 'text.html.basic'));

// 2. Normalise upstream's placeholder scope names.
const fixNames = (o) => {
  if (Array.isArray(o)) return o.forEach(fixNames);
  if (o && typeof o === 'object') {
    for (const k of Object.keys(o)) {
      if ((k === 'name' || k === 'contentName') && typeof o[k] === 'string') o[k] = o[k].replace('replaceXXX', 'replace');
      else fixNames(o[k]);
    }
  }
};
fixNames(g);

// 3. Give every s/// region an outer string.regexp.replace.perl scope.
for (const p of g.patterns) {
  if (p.comment && p.comment.startsWith('string.regexp.replace') && !p.name) p.name = 'string.regexp.replace.perl';
}

// 4. s, tr and y with bracketing delimiters, where the replacement part may
//    follow on a later line (s{...}\n {...}gx). The begin matches the whole
//    balanced pattern part with a recursive group, so the rule starts in the
//    gap before the replacement part. It ends after the first punctuation
//    character that is not at its start, which is the replacement part's
//    closing delimiter. A pattern part spanning lines falls through to the
//    upstream rule.
//    Oniguruma makes plain groups non-capturing once a pattern has named
//    groups, so every group here is named; captures are numbered in order.
const pairs = [['\\{', '\\}', 'braces'], ['\\[', '\\]', 'brackets'], ['\\(', '\\)', 'parens'], ['<', '>', 'ltgt']];
const replacementPart = ([open, close, kind]) => ({
  begin: open,
  beginCaptures: { 0: { name: 'punctuation.definition.string.perl' } },
  end: close,
  endCaptures: { 0: { name: 'punctuation.definition.string.perl' } },
  name: `string.regexp.format.nested_${kind}.perl`,
  patterns: [{ include: '#escaped_char' }, { include: '#variable' }, { include: `#nested_${kind}_interpolated` }],
});
const bracketed = pairs.map(([open, close, kind]) => ({
  comment: `s, tr and y with a ${kind} pattern part; the replacement part may be on a later line`,
  begin: `(?<![-$@%&*]|->|::)\\b(?<op>s|tr|y)\\s*(?<part>${open}(?:[^${open}${close}\\\\]|\\\\.|\\g<part>)*${close})`,
  beginCaptures: {
    1: { name: 'support.function.perl' },
    2: { name: `string.regexp.nested_${kind}.perl`, patterns: [{ include: '#escaped_char' }, { include: '#variable' }] },
  },
  end: '(?!\\G)(?<=[^\\s\\w])(?<flags>[egimosxradlupcn]*)',
  endCaptures: { 1: { name: 'keyword.control.regexp-option.perl' } },
  name: 'string.regexp.replace.perl',
  patterns: [
    { include: '#line_comment' },
    ...pairs.map(replacementPart),
    {
      begin: '([^\\s\\w#])',
      beginCaptures: { 0: { name: 'punctuation.definition.string.perl' } },
      end: '\\1',
      endCaptures: { 0: { name: 'punctuation.definition.string.perl' } },
      name: 'string.regexp.format.simple_delimiter.perl',
      patterns: [{ include: '#escaped_char' }, { include: '#variable' }],
    },
  ],
}));
g.patterns.splice(findTop((p) => p.comment === 'string.regexp.replace.perl', 's{} rule'), 0, ...bracketed);

// 5. A `/` after these tokens starts a match, not a division.
const slash = g.patterns[findTop(beginStarts('(?<=\\(|\\{|~|&|\\||if|unless|^)'), 'slash-regex rule')];
const words = ['split', 'grep', 'map', 'join', 'return', 'and', 'or', 'not', 'when', 'while', 'until', 'push', 'unshift'];
slash.begin = `(?<=\\(|\\{|~|&|\\||!|=|^|\\bif|\\bunless|${words.map((w) => `\\b${w}`).join('|')})\\s*((\\/))`;
// `,` and `;` are left out: upstream treats `s,` and `s;` as a bare `s`, so a
// `/` after them is usually inside a substitution.
// A match may also end before `]`, as in [split /:/].
slash.end = slash.end.replace('[;\\,\\#\\{\\}\\)]', '[;\\,\\#\\{\\}\\)\\]]');
if (!slash.end.includes('\\]]')) throw new Error('upstream grammar changed: slash-regex end');

// 6. ${^NAME} and $^X special variables, before the generic `$^` rule.
g.repository.variable.patterns.unshift(
  { match: '(\\$\\{)\\^\\w+(\\})', captures: { 1: { name: 'punctuation.definition.variable.perl' }, 2: { name: 'punctuation.definition.variable.perl' } }, name: 'variable.other.predefined.perl' },
  { match: '(\\$)\\^[A-Z\\[\\]\\\\^_?]', captures: { 1: { name: 'punctuation.definition.variable.perl' } }, name: 'variable.other.predefined.perl' },
);

// 7. Core keywords from Perl 5.36+: try/catch/finally/defer, class/field/method/ADJUST.
const kw = g.patterns[findTop((p) => p.name === 'keyword.control.perl' && (p.match || '').includes('|elsif|'), 'keyword rule')];
kw.match = kw.match.replace('(continue|', '(continue|try|catch|finally|defer|');
const pkg = g.patterns[findTop((p) => p.name === 'meta.class.perl', 'package rule')];
pkg.match = pkg.match.replace('(package)', '(package|class)');
const sub = g.patterns[findTop((p) => p.name === 'meta.function.perl' && (p.match || '').includes('(sub)'), 'sub rule')];
g.patterns.splice(g.patterns.indexOf(sub) + 1, 0, {
  match: '(?<!->)\\b(method)\\s+([a-zA-Z_]\\w*)',
  captures: { 1: { name: 'storage.type.method.perl' }, 2: { name: 'entity.name.function.perl' } },
  name: 'meta.function.perl',
});
const phaser = g.patterns[findTop((p) => (p.match || '').includes('BEGIN|UNITCHECK'), 'BEGIN rule')];
phaser.match = phaser.match.replace('DESTROY)', 'DESTROY|ADJUST)');
const my = g.patterns[findTop((p) => p.name === 'storage.modifier.perl', 'my/our/local rule')];
my.match = '(?<!->)\\b(my|our|local|state|field)\\b';

// 8. A bareword before `=>` is a hash key, even when it is `s`, `y`, `q` and
//    so on: move the key rule ahead of the quote-like rules.
const key = g.patterns.splice(findTop((p) => p.match === '\\b(\\w+)\\s*(?==>)', 'hash key rule'), 1)[0];
g.patterns.splice(findTop((p) => p.include === '#variable', 'variable include') + 1, 0, key);

// 9. With a non-bracketing delimiter (m/.../, qr/.../) the first unescaped
//    delimiter ends the regex, so parens must not nest there: an unbalanced
//    `(` in a character class, as in m/(?![{([])/, kept the match open.
const simple = ['string.regexp.compile.simple-delimiter.perl', 'string.regexp.find-m.simple-delimiter.perl'];
let unnested = 0;
const unnest = (o) => {
  if (Array.isArray(o)) return o.forEach(unnest);
  if (!o || typeof o !== 'object') return;
  if (simple.includes(o.name)) {
    o.patterns = o.patterns.filter((p) => p.include !== '#nested_parens_interpolated');
    unnested++;
  }
  Object.values(o).forEach(unnest);
};
unnest(g);
if (unnested !== simple.length) throw new Error('upstream grammar changed: simple-delimiter regex rules');

g.information_for_contributors = [
  `Derived from VS Code's extensions/perl/syntaxes/perl.tmLanguage.json (${g.version}).`,
  'Do not edit by hand: change scripts/patch-grammar.mjs and regenerate (see README.md).',
];
writeFileSync(out, JSON.stringify(g, null, '\t') + '\n');
