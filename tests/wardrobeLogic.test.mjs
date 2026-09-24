import { test } from 'node:test';
import assert from 'node:assert/strict';
import { equipPiece } from '../src/wardrobeLogic.ts';
import fs from 'node:fs';
const closet = JSON.parse(fs.readFileSync(new URL('../src/data/dressUpCatalog.json', import.meta.url))).destinations.all;
const outfit = {tops:'blue-daisy-dress',bottoms:'none',layers:'none',shoes:'boots',accessories:'crossbody',buddies:'bunny'};
test('pants chosen after a full outfit become visible without removing other picks', () => {
  const next=equipPiece(outfit,'bottoms','denim-daisy-shorts',closet);
  assert.equal(next.tops,'none'); assert.equal(next.bottoms,'denim-daisy-shorts');
  assert.equal(next.accessories,'crossbody'); assert.equal(next.shoes,'boots');
  assert.equal(outfit.tops,'blue-daisy-dress');
});
test('choosing a shirt removes a covering outer layer but leaves an open jacket', () => {
  const c={tops:[],layers:[{id:'suit',tags:['covers-top','covers-bottom']},{id:'jacket',tags:[]}]};
  assert.equal(equipPiece({...outfit,layers:'suit'},'tops','tee',c).layers,'none');
  assert.equal(equipPiece({...outfit,layers:'jacket'},'tops','tee',c).layers,'jacket');
});
test('all enabled hats and dresses appear in their dedicated drawers', () => {
  for(const item of closet.accessories.filter(i=>i.enabled!==false && /cap|hat|beret|headband/i.test(i.name))) assert.ok(item.tags.includes('style:hat'),item.id);
  for(const item of closet.tops.filter(i=>i.enabled!==false && /dress|overall/i.test(i.name))) assert.ok(item.tags.includes('style:dress'),item.id);
});
