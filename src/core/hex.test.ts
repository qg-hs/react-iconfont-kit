import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { hexToRgb } from './hex.js';

describe('hexToRgb', () => {
  it('converts 6-digit hex', () => {
    assert.equal(hexToRgb('#5B8BD4'), 'rgb(91,139,212)');
    assert.equal(hexToRgb('5B8BD4'), 'rgb(91,139,212)');
  });

  it('expands 3-digit hex', () => {
    assert.equal(hexToRgb('#abc'), 'rgb(170,187,204)');
  });
});
