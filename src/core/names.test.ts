import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { camelCase, pascalCase, trimIconPrefix } from './names.js';

describe('names', () => {
  it('camelCases kebab and snake ids', () => {
    assert.equal(camelCase('icon-alipay'), 'iconAlipay');
    assert.equal(camelCase('icon_user'), 'iconUser');
  });

  it('pascalCases icon ids', () => {
    assert.equal(pascalCase('icon-alipay'), 'IconAlipay');
    assert.equal(pascalCase('icon_user'), 'IconUser');
  });

  it('trims icon prefix and leftover separators', () => {
    assert.equal(trimIconPrefix('icon-alipay', 'icon'), 'alipay');
    assert.equal(trimIconPrefix('icon_user', 'icon'), 'user');
    assert.equal(trimIconPrefix('alipay', 'icon'), 'alipay');
    assert.equal(trimIconPrefix('icon-alipay', ''), 'icon-alipay');
  });
});
