export interface SvgNode {
  name: string;
  attrs: Record<string, string>;
  children: SvgNode[];
}

export interface SvgSymbol {
  id: string;
  viewBox: string;
  children: SvgNode[];
}

/** Parsed iconfont symbol payload. `svg.symbol` is kept so existing callers still work. */
export interface XmlData {
  svg: {
    symbol: SvgSymbol[];
  };
}

export type XmlSymbol = SvgSymbol;

export type StandalonePlatform =
  | 'web'
  | 'rn'
  | 'weapp'
  | 'alipay'
  | 'swan'
  | 'tt'
  | 'qq'
  | 'kuaishou';

export type GeneratePlatform = StandalonePlatform | 'h5' | 'taro';

export interface KitConfig {
  symbol_url?: string;
  save_dir: string;
  use_typescript: boolean;
  trim_icon_prefix: string;
  default_icon_size: number;
  unit: string;
  use_rpx: boolean;
  design_width: number;
  local_svgs?: string;
  platforms: GeneratePlatform[];
}

export interface ColorCounter {
  colorIndex: number;
  baseIdent?: number;
}
