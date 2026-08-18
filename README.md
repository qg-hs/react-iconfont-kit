# react-iconfont-kit

把 [iconfont.cn](https://www.iconfont.cn) 的 symbol 图标转成组件：React web、React Native、各家小程序、Taro。不依赖字体，支持多色彩。

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
npx iconfont init
# 或指定路径
npx iconfont init --output iconfont.json
```

`iconfont-kit` 和 `iconfont` 是同一个命令。

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
npx iconfont generate --platform web
npx iconfont generate --platform rn
npx iconfont generate --platform weapp
npx iconfont generate --platform alipay
npx iconfont generate --platform swan
npx iconfont generate --platform tt
npx iconfont generate --platform qq
npx iconfont generate --platform kuaishou
npx iconfont generate --platform taro
```

指定配置文件：

```bash
npx iconfont generate --platform web --config ./iconfont.json
```

不写 `--platform` 时等同于 `taro`：按 `platforms` 一次生成多端，并带上 `index.weapp.tsx` 等包装文件。

`wechat` / `baidu` / `toutiao` 会分别映射到 `weapp` / `swan` / `tt`。`--platform h5` 等同于 `web`。

## 配置

| 字段 | 说明 |
|---|---|
| `symbol_url` | iconfont 项目的 **.js** symbol 链接 |
| `save_dir` | 生成目录，每次生成会清空 |
| `use_typescript` | `true` 生成 `.tsx`，否则 `.js` + `.d.ts` |
| `trim_icon_prefix` | 从 `<Icon name>` 里去掉的前缀 |
| `default_icon_size` | 默认尺寸 |
| `unit` | 仅 React web：`px` / `rem` |
| `use_rpx` | 小程序 / Taro 是否按 rpx 换算 |
| `design_width` | Taro 的 h5 端 + rpx 时的设计稿宽度 |
| `local_svgs` | 仅 RN：额外本地 SVG 目录（可补渐变） |
| `platforms` | Taro 用。`*` 或 `["weapp","h5","rn"]`。`*` 含 weapp / alipay / swan / tt / qq / kuaishou / h5 / rn。这里的 `h5` 是 Taro 端名 |

## 调用

```tsx
import IconFont from './components/iconfont';
import IconAlipay from './components/iconfont/IconAlipay';

<IconFont name="alipay" size={20} />
<IconFont name="alipay" color="green" />
<IconFont name="alipay" color={['green', 'orange']} />
<IconFont name="alipay" className="my-icon" style={{ marginRight: 8 }} />
<IconAlipay size={20} className="my-icon" style={{ marginRight: 8 }} />
```

React web / 小程序 / Taro 支持 `style` 和 `className`。React Native 只支持 `style`。

Taro 3 需要在 `src/app.config.js` 注册：

```js
import { useGlobalIconFont } from './components/iconfont/helper';

export default {
  usingComponents: Object.assign(useGlobalIconFont()),
};
```

## ESLint / TypeScript / Prettier

生成文件顶部带 `/* eslint-disable */`，组件用参数默认值而不是 `defaultProps`（React 19 不再给函数组件挂 defaultProps）。类型用 `import type`，避免 `verbatimModuleSyntax` 报未使用的值导入。

SVG 路径很长时，Prettier 仍可能改文件。把 `save_dir` 加进 `.prettierignore` 和 ESLint `ignorePatterns` 即可。
