// Validates orca-plugin.json against the schema its `$schema` points at.
// This stands in for `orca plugin validate .` where the Orca CLI is not
// installed; run the real command before tagging a release.
import { readFileSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const manifest = JSON.parse(readFileSync(new URL('../orca-plugin.json', import.meta.url), 'utf8'));
const response = await fetch(manifest.$schema);
if (!response.ok) throw new Error(`cannot fetch ${manifest.$schema}: ${response.status}`);
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(await response.json());
if (!validate(manifest)) {
  console.error(validate.errors.map((e) => `${e.instancePath || '/'} ${e.message}`).join('\n'));
  process.exit(1);
}
console.log('manifest ok');
