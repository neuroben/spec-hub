// Verifies that the typed example equals the root schema_plan.json.
// Run: npm run check:schema   (Node >= 22.18, native type stripping)
import { readFileSync } from 'node:fs';
import { deepStrictEqual } from 'node:assert/strict';
import { exampleDocument } from '../src/api/documentTypes.example.ts';

const schemaUrl = new URL('../../schema_plan.json', import.meta.url);
const schema: unknown = JSON.parse(readFileSync(schemaUrl, 'utf8'));

deepStrictEqual(JSON.parse(JSON.stringify(exampleDocument)), schema);
console.log('OK: exampleDocument matches schema_plan.json');
