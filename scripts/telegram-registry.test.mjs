import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

async function load(sourcePath) {
  const source = await readFile(new URL(`../${sourcePath}`, import.meta.url), 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const exports = {};
  vm.runInNewContext(output, { exports, module: { exports } });
  return exports;
}

const policy = await load('src/services/telegramRegistryPolicy.ts');
const registry = await load('src/services/telegramRegistryService.ts');
const property = (assignedAgentId, repostCount = 0, media = []) => ({ assignedAgentId, repostCount, media });

test('agent and recruit see only assigned properties', () => {
  const properties = [property('agent:omar'), property('agent:david')];
  assert.equal(policy.enforceRegistryAccess({ id: 'agent:omar', role: 'agent' }, properties).length, 1);
  assert.equal(policy.enforceRegistryAccess({ id: 'agent:omar', role: 'recruit' }, properties).length, 1);
});

test('admin and operator see all properties', () => {
  const properties = [property('agent:omar'), property(null)];
  assert.equal(policy.enforceRegistryAccess({ id: 'admin', role: 'admin' }, properties).length, 2);
  assert.equal(policy.enforceRegistryAccess({ id: 'operator', role: 'operator' }, properties).length, 2);
});

test('primary media is the first marked real image and no placeholder is invented', () => {
  const media = [
    { id: 'video', type: 'video', isPrimary: true },
    { id: 'second', type: 'image', isPrimary: false },
    { id: 'primary', type: 'image', isPrimary: true },
  ];
  assert.equal(registry.getPrimaryRegistryMedia(property(null, 0, media)).id, 'primary');
  assert.equal(registry.getPrimaryRegistryMedia(property(null, 0, [])), undefined);
});

test('channel age and ranking eligibility are independent', () => {
  assert.equal(registry.formatRegistryChannelAge(125), '2 ч 5 мин');
  assert.equal(registry.isRankingProperty(property(null, 0)), false);
  assert.equal(registry.isRankingProperty(property(null, 2)), true);
});
