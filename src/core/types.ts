export interface XmlSymbol {
  $: {
    viewBox: string;
    id: string;
    [key: string]: string;
  };
  [tag: string]: unknown;
}

export interface XmlData {
  svg: {
    symbol: XmlSymbol[];
  };
}

export type StandalonePlatform =
  | 'h5'
  | 'rn'
  | 'weapp'
  | 'alipay'
  | 'swan'
  | 'tt'
  | 'qq'
  | 'kuaishou';

export type GeneratePlatform = StandalonePlatform | 'taro';

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
