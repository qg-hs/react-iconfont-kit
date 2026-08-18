import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';
import { parseSymbolXml } from '../core/fetchXml.js';
import type { KitConfig } from '../core/types.js';
import { generateWeb } from '../platforms/web/generate.js';
import { generateMP } from '../platforms/mp/generate.js';
import { MP_PLATFORMS, renderMpJs } from './mp.js';
import { renderTaroHelper } from './taro.js';
import { renderGetIconColor } from './helper.js';
import { unionNames } from './shared.js';

const FIXTURE = `'<svg><symbol id="icon-alipay" viewBox="0 0 1024 1024"><path d="M1 1" fill="#5B8BD4"></path><path d="M2 2"></path></symbol><symbol id="icon-user" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle></symbol></svg>'`;

const tmpDirs: string[] = [];

const config = (saveDir: string, extra: Partial<KitConfig> = {}): KitConfig => ({
  save_dir: saveDir,
  use_typescript: true,
  trim_icon_prefix: 'icon',
  default_icon_size: 18,
  unit: 'px',
  use_rpx: true,
  design_width: 750,
  platforms: [],
  ...extra,
});

after(() => {
  for (const dir of tmpDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe('emit helpers', () => {
  it('builds name unions and ESM helpers', () => {
    assert.equal(unionNames(['alipay', 'user']), `'alipay' | 'user'`);
    assert.match(renderGetIconColor(true), /color: string \| string\[] \| undefined/);
    assert.match(renderTaroHelper('components/iconfont'), /export const useGlobalIconFont/);
    assert.doesNotMatch(renderTaroHelper('components/iconfont'), /module\.exports/);
  });

  it('emits one mini-program JS runtime per platform', () => {
    const weapp = renderMpJs({
      spec: MP_PLATFORMS.weapp,
      names: ['alipay', 'user'],
      size: 18,
      useRpx: true,
    });
    assert.match(weapp, /wx\.getSystemInfoSync/);
    assert.match(weapp, /hex2rgb\(hex\)/);
    assert.doesNotMatch(weapp, /hex\.substr/);

    const alipay = renderMpJs({
      spec: MP_PLATFORMS.alipay,
      names: ['alipay'],
      size: 18,
      useRpx: true,
    });
    assert.match(alipay, /didMount\(\)/);
    assert.match(alipay, /didUpdate\(prevProps\)/);
    assert.match(alipay, /my\.getSystemInfoSync/);

    const qq = renderMpJs({
      spec: MP_PLATFORMS.qq,
      names: ['alipay'],
      size: 18,
      useRpx: false,
    });
    assert.doesNotMatch(qq, /hex2rgb/);
    assert.doesNotMatch(qq, /getSystemInfoSync/);
  });
});

describe('generateWeb', () => {
  it('writes typed components with style and className', () => {
    const dir = mkdtempSync(join(tmpdir(), 'iconfont-web-'));
    tmpDirs.push(dir);
    generateWeb(parseSymbolXml(FIXTURE), config(dir));

    const single = readFileSync(join(dir, 'IconAlipay.tsx'), 'utf8');
    assert.match(single, /className=\{className\}/);
    assert.match(single, /style=\{style\}/);
    assert.match(single, /getIconColor\(color, 0, '#5B8BD4'\)/);
    assert.match(single, /getIconColor\(color, 1, '#333333'\)/);
    assert.doesNotMatch(single, /tslint/);
    assert.doesNotMatch(single, /#componentName#/);

    const index = readFileSync(join(dir, 'index.tsx'), 'utf8');
    assert.match(index, /export type IconNames = 'alipay' \| 'user'/);
    assert.match(index, /case 'alipay':/);
    assert.doesNotMatch(index, /key="/);
  });
});

describe('generateMP weapp', () => {
  it('writes a single component with className and customStyle', () => {
    const dir = mkdtempSync(join(tmpdir(), 'iconfont-mp-'));
    tmpDirs.push(dir);
    generateMP(parseSymbolXml(FIXTURE), config(dir, { use_typescript: false }), 'weapp');

    const fileName = dir.split(/[/\\]/).pop()!;
    const wxml = readFileSync(join(dir, `${fileName}.wxml`), 'utf8');
    assert.match(wxml, /wx:if="\{\{name === 'alipay'\}\}"/);
    assert.match(wxml, /class="icon \{\{className\}\}"/);
    assert.match(wxml, /\{\{customStyle\}\}/);

    const js = readFileSync(join(dir, `${fileName}.js`), 'utf8');
    assert.match(js, /className:/);
    assert.match(js, /customStyle:/);
    assert.match(js, /hex2rgb\(hex\)/);
    assert.doesNotMatch(js, /var /);
  });
});
