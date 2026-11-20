// Checks the plugin against the limits Orca enforces on syntax plugins
// (docs/reference/plugin-syntax.md in stablyai/orca):
//   - grammar <= 1 MiB, language configuration <= 64 KiB
//   - every `include` resolves inside the plugin (external scopes render plain)
//   - no line takes more than 50 ms to tokenise
// Timing runs over the fixtures plus a corpus of real Perl: the directories
// given as arguments, or perl's own library when perl is installed.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import vsctm from 'vscode-textmate';
import oniguruma from 'vscode-oniguruma';

const require = createRequire(import.meta.url);
const root = new URL('..', import.meta.url).pathname;
const manifest = JSON.parse(readFileSync(join(root, 'orca-plugin.json'), 'utf8'));
const LINE_BUDGET_MS = 50;
const failures = [];

const scopes = new Set(manifest.contributes.syntaxes.map((s) => s.scopeName));
for (const syntax of manifest.contributes.syntaxes) {
  const grammarPath = join(root, syntax.path);
  if (statSync(grammarPath).size > 1024 * 1024) failures.push(`${syntax.path} is over 1 MiB`);
  if (syntax.configuration && statSync(join(root, syntax.configuration)).size > 64 * 1024) {
    failures.push(`${syntax.configuration} is over 64 KiB`);
  }
  const grammar = JSON.parse(readFileSync(grammarPath, 'utf8'));
  if (grammar.scopeName !== syntax.scopeName) failures.push(`${syntax.path} scopeName is not ${syntax.scopeName}`);
  const walk = (node) => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== 'object') return;
    if (typeof node.include === 'string') {
      const inc = node.include;
      const ok = inc === '$self' || inc === '$base'
        || (inc.startsWith('#') && grammar.repository && inc.slice(1) in grammar.repository)
        || scopes.has(inc.split('#')[0]);
      if (!ok) failures.push(`${syntax.path}: include "${inc}" does not resolve inside the plugin`);
    }
    Object.values(node).forEach(walk);
  };
  walk(grammar);
}

const wasm = readFileSync(require.resolve('vscode-oniguruma/release/onig.wasm')).buffer;
await oniguruma.loadWASM(wasm);
const registry = new vsctm.Registry({
  onigLib: Promise.resolve({
    createOnigScanner: (patterns) => new oniguruma.OnigScanner(patterns),
    createOnigString: (s) => new oniguruma.OnigString(s),
  }),
  loadGrammar: async (scopeName) => {
    const syntax = manifest.contributes.syntaxes.find((s) => s.scopeName === scopeName);
    if (!syntax) return null;
    const path = join(root, syntax.path);
    return vsctm.parseRawGrammar(readFileSync(path, 'utf8'), path);
  },
});
const grammar = await registry.loadGrammar('source.perl');

const perlFiles = (dir) => readdirSync(dir, { withFileTypes: true, recursive: true })
  .filter((e) => e.isFile() && /\.(pl|pm|t)$/.test(e.name))
  .map((e) => join(e.parentPath, e.name));

let corpus = process.argv.slice(2);
if (corpus.length === 0) {
  try {
    corpus = [execFileSync('perl', ['-MConfig', '-e', 'print $Config{privlib}'], { encoding: 'utf8' })];
  } catch {
    console.log('perl not found: timing fixtures only (pass corpus directories as arguments)');
  }
}
const files = [join(root, 'test/fixtures'), ...corpus].flatMap(perlFiles);

let lines = 0;
let slowest = { ms: 0 };
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  if (text.length > 500_000) continue; // Orca leaves files this big plain anyway
  let state = vsctm.INITIAL;
  text.split(/\r?\n/).forEach((line, i) => {
    if (line.length > 1000) return; // past Orca's per-line length limit
    const start = performance.now();
    const result = grammar.tokenizeLine(line, state);
    const ms = performance.now() - start;
    state = result.ruleStack;
    lines++;
    if (ms > slowest.ms) slowest = { ms, where: `${file}:${i + 1}` };
    if (ms > LINE_BUDGET_MS) failures.push(`${file}:${i + 1} took ${ms.toFixed(1)} ms to tokenise`);
  });
}
console.log(`tokenised ${lines} lines in ${files.length} files; slowest ${slowest.ms.toFixed(2)} ms at ${slowest.where}`);

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('limits ok');
