# react-iconfont-kit

把 [iconfont.cn](https://www.iconfont.cn) 的 symbol 图标转成组件：React H5、React Native、各家小程序、Taro。不依赖字体，支持多色彩。

由 `react-iconfont-cli` / `react-native-iconfont-cli` / `mini-program-iconfont-cli` / `taro-iconfont-cli` 合并而来。

## 安装

```bash
npm install react-iconfont-kit --save-dev
```

React Native 还需：

```bash
npm install react-native-svg
```

Taro 项目把 `@tarojs/taro` 当作 peer。

## 使用

```bash
npx iconfont-init
# 或指定路径
npx iconfont-init --output iconfont.json
```

生成的 `iconfont.json`：

```json
{
  "symbol_url": "https://at.alicdn.com/t/font_1373348_ghk94ooopqr.js",
  "save_dir": "./src/components/iconfont",
  "use_typescript": false,
  "trim_icon_prefix": "icon",
  "default_icon_size": 18,
  "unit": "px",
  "use_rpx": true,
  "design_width": 750,
  "local_svgs": "",
  "platforms": "*"
}
```

按平台生成：

```bash
npx iconfont-h5
npx iconfont-rn
npx iconfont-wechat
npx iconfont-alipay
npx iconfont-baidu
npx iconfont-toutiao
npx iconfont-qq
npx iconfont-kuaishou
npx iconfont-taro
```

统一入口：

```bash
npx iconfont init
npx iconfont generate --platform h5
npx iconfont generate --platform taro --config ./iconfont.json
```

`iconfont-taro` / `--platform taro` 会按 `platforms` 一次生成多端，并带上 Taro 的 `index.weapp.tsx` 等包装文件。

## 配置

| 字段 | 说明 |
|---|---|
| `symbol_url` | iconfont 项目的 **.js** symbol 链接 |
| `save_dir` | 生成目录，每次生成会清空 |
| `use_typescript` | `true` 生成 `.tsx`，否则 `.js` + `.d.ts` |
| `trim_icon_prefix` | 从 `<Icon name>` 里去掉的前缀 |
| `default_icon_size` | 默认尺寸 |
| `unit` | 仅 H5：`px` / `rem` |
| `use_rpx` | 小程序 / Taro 是否按 rpx 换算 |
| `design_width` | Taro H5 + rpx 时的设计稿宽度 |
| `local_svgs` | 仅 RN：额外本地 SVG 目录（可补渐变） |
| `platforms` | Taro 用。`*` 或 `["weapp","h5","rn"]` |

## 调用

```tsx
import IconFont from './components/iconfont';
import IconAlipay from './components/iconfont/IconAlipay';

<IconFont name="alipay" size={20} />
<IconFont name="alipay" color="green" />
<IconFont name="alipay" color={['green', 'orange']} />
<IconAlipay size={20} />
```

Taro 3 需要在 `src/app.config.js` 注册：

```js
import { useGlobalIconFont } from './components/iconfont/helper';

export default {
  usingComponents: Object.assign(useGlobalIconFont()),
};
```

## 兼容命令

旧包的 bin 名都还在：`iconfont-init`、`iconfont-h5`、`iconfont-rn`、`iconfont-taro`、`iconfont-wechat` 等。
