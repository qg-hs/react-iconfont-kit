import { ESLINT_BANNER } from './shared.js';

export interface MpPlatformSpec {
  id: 'weapp' | 'alipay' | 'swan' | 'tt' | 'qq' | 'kuaishou';
  ifAttr: string;
  xmlExt: string;
  cssExt: string;
  global: 'wx' | 'my' | 'swan' | 'tt' | 'qq' | 'ks';
  model: 'properties' | 'props';
  hexToRgb: boolean;
  usingComponents: boolean;
  virtualHost: boolean;
}

export const MP_PLATFORMS: Record<string, MpPlatformSpec> = {
  weapp: {
    id: 'weapp',
    ifAttr: 'wx:if',
    xmlExt: 'wxml',
    cssExt: 'wxss',
    global: 'wx',
    model: 'properties',
    hexToRgb: true,
    usingComponents: true,
    virtualHost: true,
  },
  wechat: {
    id: 'weapp',
    ifAttr: 'wx:if',
    xmlExt: 'wxml',
    cssExt: 'wxss',
    global: 'wx',
    model: 'properties',
    hexToRgb: true,
    usingComponents: true,
    virtualHost: true,
  },
  alipay: {
    id: 'alipay',
    ifAttr: 'a:if',
    xmlExt: 'axml',
    cssExt: 'acss',
    global: 'my',
    model: 'props',
    hexToRgb: true,
    usingComponents: false,
    virtualHost: false,
  },
  swan: {
    id: 'swan',
    ifAttr: 's-if',
    xmlExt: 'swan',
    cssExt: 'css',
    global: 'swan',
    model: 'properties',
    hexToRgb: true,
    usingComponents: true,
    virtualHost: false,
  },
  baidu: {
    id: 'swan',
    ifAttr: 's-if',
    xmlExt: 'swan',
    cssExt: 'css',
    global: 'swan',
    model: 'properties',
    hexToRgb: true,
    usingComponents: true,
    virtualHost: false,
  },
  tt: {
    id: 'tt',
    ifAttr: 'tt:if',
    xmlExt: 'ttml',
    cssExt: 'ttss',
    global: 'tt',
    model: 'properties',
    hexToRgb: true,
    usingComponents: false,
    virtualHost: false,
  },
  toutiao: {
    id: 'tt',
    ifAttr: 'tt:if',
    xmlExt: 'ttml',
    cssExt: 'ttss',
    global: 'tt',
    model: 'properties',
    hexToRgb: true,
    usingComponents: false,
    virtualHost: false,
  },
  qq: {
    id: 'qq',
    ifAttr: 'qq:if',
    xmlExt: 'qml',
    cssExt: 'qss',
    global: 'qq',
    model: 'properties',
    hexToRgb: false,
    usingComponents: true,
    virtualHost: true,
  },
  kuaishou: {
    id: 'kuaishou',
    ifAttr: 'ks:if',
    xmlExt: 'ksml',
    cssExt: 'css',
    global: 'ks',
    model: 'properties',
    hexToRgb: true,
    usingComponents: false,
    virtualHost: false,
  },
};

const sizeToPx = (useRpx: boolean, global: string, sizeRef: string): string =>
  useRpx ? `${sizeRef} / 750 * ${global}.getSystemInfoSync().windowWidth` : sizeRef;

const hex2rgbMethod = `    hex2rgb(hex) {
      let value = hex.startsWith('#') ? hex.slice(1) : hex;
      if (value.length === 3) {
        value = value.replace(/(.)/g, '$1$1');
      }
      const rgb = [];
      value.replace(/../g, (chunk) => {
        rgb.push(parseInt(chunk, 16));
        return chunk;
      });
      return 'rgb(' + rgb.join(',') + ')';
    }`;

const fixColorMethod = (source: 'data' | 'props'): string => `    fixColor() {
      const color = this.${source}.color;
      if (typeof color === 'string') {
        return color.startsWith('#') ? this.hex2rgb(color) : color;
      }
      return color.map((item) => (item.startsWith('#') ? this.hex2rgb(item) : item));
    },
${hex2rgbMethod}`;

export const renderMpCss = (): string => `.icon {
  background-repeat: no-repeat;
}
`;

export const renderMpJson = (spec: MpPlatformSpec): string => {
  const json: Record<string, unknown> = { component: true };
  if (spec.usingComponents) {
    json.usingComponents = {};
  }
  if (spec.virtualHost) {
    json.styleIsolation = 'apply-shared';
    json.virtualHost = true;
  }
  return `${JSON.stringify(json, null, 2)}\n`;
};

export const renderMpXml = (
  icons: Array<{ name: string; svgUri: string }>,
  spec: MpPlatformSpec,
): string =>
  icons
    .map(
      ({ name, svgUri }) =>
        `<!--${name}-->\n<view ${spec.ifAttr}="{{name === '${name}'}}" style="background-image: url({{quot}}data:image/svg+xml, ${svgUri}{{quot}});` +
        ' width: {{svgSize}}px; height: {{svgSize}}px; {{customStyle}}" class="icon {{className}}" />',
    )
    .join('\n\n');

export const renderMpJs = (opts: {
  spec: MpPlatformSpec;
  names: string[];
  size: number;
  useRpx: boolean;
}): string => {
  const { spec, names, size, useRpx } = opts;
  const namesComment = names.join(' | ');
  const svgSize = sizeToPx(useRpx, spec.global, String(size));
  const observerSize = sizeToPx(useRpx, spec.global, 'size');

  if (spec.model === 'props') {
    return `${ESLINT_BANNER}
Component({
  props: {
    // ${namesComment}
    name: null,
    // string | string[]
    color: '',
    size: ${size},
    className: '',
    customStyle: '',
  },
  data: {
    colors: '',
    quot: '"',
    svgSize: ${size},
    isStr: true,
  },
  didMount() {
    const { size, color } = this.props;
    this.setData({
      colors: this.fixColor(),
      isStr: typeof color === 'string',
      svgSize: ${observerSize},
    });
  },
  didUpdate(prevProps) {
    const { size, color } = this.props;
    if (color !== prevProps.color) {
      this.setData({
        colors: this.fixColor(),
        isStr: typeof color === 'string',
      });
    }
    if (size !== prevProps.size) {
      this.setData({
        svgSize: ${observerSize},
      });
    }
  },
  methods: {
${fixColorMethod('props')}
  }
});
`;
  }

  if (!spec.hexToRgb) {
    return `${ESLINT_BANNER}
Component({
  properties: {
    // ${namesComment}
    name: {
      type: String,
    },
    // string | string[]
    color: {
      type: null,
      observer(color) {
        this.setData({
          isStr: typeof color === 'string',
        });
      },
    },
    size: {
      type: Number,
      value: ${size},
      observer(size) {
        this.setData({
          svgSize: ${observerSize},
        });
      },
    },
    className: {
      type: String,
      value: '',
    },
    customStyle: {
      type: String,
      value: '',
    },
  },
  data: {
    svgSize: ${svgSize},
    quot: '"',
    isStr: true,
  },
});
`;
  }

  return `${ESLINT_BANNER}
Component({
  properties: {
    // ${namesComment}
    name: {
      type: String,
    },
    // string | string[]
    color: {
      type: null,
      observer(color) {
        this.setData({
          colors: this.fixColor(),
          isStr: typeof color === 'string',
        });
      },
    },
    size: {
      type: Number,
      value: ${size},
      observer(size) {
        this.setData({
          svgSize: ${observerSize},
        });
      },
    },
    className: {
      type: String,
      value: '',
    },
    customStyle: {
      type: String,
      value: '',
    },
  },
  data: {
    colors: '',
    svgSize: ${svgSize},
    quot: '"',
    isStr: true,
  },
  methods: {
${fixColorMethod('data')}
  }
});
`;
};
