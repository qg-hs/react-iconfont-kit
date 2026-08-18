import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseSymbolXml } from './fetchXml.js';

const FIXTURE = `'<svg><symbol id="icon-alipay" viewBox="0 0 1024 1024"><path d="M1 1" fill="#5B8BD4"></path><path d="M2 2"></path></symbol><symbol id="icon-user" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle></symbol></svg>'`;

describe('parseSymbolXml', () => {
  it('normalizes symbols into a typed AST', () => {
    const data = parseSymbolXml(FIXTURE);
    assert.equal(data.svg.symbol.length, 2);

    const [alipay, user] = data.svg.symbol;
    assert.equal(alipay.id, 'icon-alipay');
    assert.equal(alipay.viewBox, '0 0 1024 1024');
    assert.equal(alipay.children.length, 2);
    assert.equal(alipay.children[0].name, 'path');
    assert.equal(alipay.children[0].attrs.d, 'M1 1');
    assert.equal(alipay.children[0].attrs.fill, '#5B8BD4');
    assert.equal(alipay.children[1].attrs.fill, undefined);

    assert.equal(user.id, 'icon-user');
    assert.equal(user.children[0].name, 'circle');
    assert.equal(user.children[0].attrs.cx, '12');
  });

  it('rejects non-symbol payloads', () => {
    assert.throws(() => parseSymbolXml('not an iconfont file'), /wrong symbol url/);
  });
});
