import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readLocal, writeLocal, isRecord, stringList, isSavedLook } from '../src/localData.ts';

test('corrupt JSON and wrong data shapes fall back without crashing', () => {
  globalThis.localStorage = { getItem: () => '{broken' };
  assert.deepEqual(readLocal('play', [], stringList), []);
  globalThis.localStorage = { getItem: () => '{"unexpected":true}' };
  assert.deepEqual(readLocal('play', [], stringList), []);
  globalThis.localStorage = { getItem: () => '[null,7]' };
  assert.deepEqual(readLocal('play', [], stringList), []);
});

test('private-mode reads and full-storage writes do not stop play', () => {
  globalThis.localStorage = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('quota'); } };
  assert.deepEqual(readLocal('play', { ready: true }, isRecord), { ready: true });
  assert.equal(writeLocal('play', { ready: true }), false);
});

test('outfit, independent hat and character survive serialization', () => {
  const values = new Map();
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const look = { id: '1', name: 'Tokyo', character: { style: 'girl', skin: 'deep', hair: 'black', hairStyle: 'coils', eyes: 'green' }, picks: { tops: 'stripe', bottoms: 'jeans', layers: 'rain', shoes: 'boots', accessories: 'bag', buddies: 'bunny' }, colors: {}, hatPick: 'bucket-hat' };
  assert.equal(isSavedLook(look), true);
  assert.equal(writeLocal('look', look), true);
  assert.deepEqual(readLocal('look', null, isSavedLook), look);
  assert.equal(isSavedLook({ ...look, picks: null }), false);
  assert.equal(isSavedLook({ ...look, character: {} }), false);
  assert.equal(isSavedLook({ ...look, colors: { stripe: {} } }), false);
  assert.equal(isSavedLook({ ...look, offsets: { stripe: null } }), false);
  assert.equal(isSavedLook({ ...look, scales: { stripe: 99 } }), false);
});
