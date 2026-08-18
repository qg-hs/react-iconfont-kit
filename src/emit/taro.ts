import { ESLINT_BANNER, unionNames } from './shared.js';

const taroImport = (useRpx: boolean): string => (useRpx ? "import Taro from '@tarojs/taro';\n" : '');

export const renderTaroHelper = (relativePath: string): string => `${ESLINT_BANNER}
export const useGlobalIconFont = () => ({
  iconfont: \`${relativePath}/\${process.env.TARO_ENV}/\${process.env.TARO_ENV}\`,
});
`;

export const renderTaroHelperDts = (): string => `${ESLINT_BANNER}
export declare const useGlobalIconFont: () => { iconfont: string };
`;

export const renderTaroDummyIndex = (opts: { ts: boolean; names: string[] }): string => {
  if (opts.ts) {
    return `${ESLINT_BANNER}
import type { CSSProperties, FunctionComponent } from 'react';

export type IconNames = ${unionNames(opts.names)};

export interface IconProps {
  name: IconNames;
  size?: number;
  color?: string | string[];
  style?: CSSProperties;
  className?: string;
}

const IconFont: FunctionComponent<IconProps> = () => {
  return null;
};

export default IconFont;
`;
  }

  return `${ESLINT_BANNER}
const IconFont = () => {
  return null;
};

export default IconFont;
`;
};

export const renderTaroDummyDts = (names: string[]): string => `${ESLINT_BANNER}
import type { CSSProperties, FunctionComponent } from 'react';

interface Props {
  name: ${unionNames(names)};
  size?: number;
  color?: string | string[];
  style?: CSSProperties;
  className?: string;
}

declare const IconFont: FunctionComponent<Props>;

export default IconFont;
`;

export const renderTaroH5Wrapper = (opts: {
  ts: boolean;
  names: string[];
  size: number;
  useRpx: boolean;
  designWidth: number;
}): string => {
  const sizeExpr = opts.useRpx ? `parseFloat(Taro.pxTransform(size, ${opts.designWidth}))` : 'size';

  if (opts.ts) {
    return `${ESLINT_BANNER}
import type { CSSProperties, FunctionComponent } from 'react';
${taroImport(opts.useRpx)}import Icon from './h5';

export type IconNames = ${unionNames(opts.names)};

interface Props {
  name: IconNames;
  size?: number;
  color?: string | string[];
  style?: CSSProperties;
  className?: string;
}

const IconFont: FunctionComponent<Props> = ({ name, size = ${opts.size}, color, style, className, ...rest }) => {
  return <Icon name={name} size={${sizeExpr}} color={color} style={style} className={className} {...rest} />;
};

export default IconFont;
`;
  }

  return `${ESLINT_BANNER}
${taroImport(opts.useRpx)}import Icon from './h5';

const IconFont = ({ name, size = ${opts.size}, color, style, className, ...rest }) => {
  return <Icon name={name} size={${sizeExpr}} color={color} style={style} className={className} {...rest} />;
};

export default IconFont;
`;
};

export const renderTaroRnWrapper = (opts: {
  ts: boolean;
  names: string[];
  size: number;
  useRpx: boolean;
}): string => {
  const sizeExpr = opts.useRpx ? 'parseFloat(Taro.pxTransform(size))' : 'size';

  if (opts.ts) {
    return `${ESLINT_BANNER}
import type { CSSProperties, FunctionComponent } from 'react';
${taroImport(opts.useRpx)}import Icon from './rn';

export type IconNames = ${unionNames(opts.names)};

interface Props {
  name: IconNames;
  size?: number;
  color?: string | string[];
  style?: CSSProperties;
}

const IconFont: FunctionComponent<Props> = ({ name, size = ${opts.size}, color, style, ...rest }) => {
  return <Icon name={name} size={${sizeExpr}} color={color} style={style} {...rest} />;
};

export default IconFont;
`;
  }

  return `${ESLINT_BANNER}
${taroImport(opts.useRpx)}import Icon from './rn';

const IconFont = ({ name, size = ${opts.size}, color, style, ...rest }) => {
  return <Icon name={name} size={${sizeExpr}} color={color} style={style} {...rest} />;
};

export default IconFont;
`;
};

export const renderTaroPlatformWrapper = (opts: {
  ts: boolean;
  names: string[];
  size: number;
  useRpx: boolean;
}): string => {
  const sizeExpr = opts.useRpx ? 'parseFloat(Taro.pxTransform(size))' : 'size';

  if (opts.ts) {
    return `${ESLINT_BANNER}
import type { CSSProperties, FunctionComponent } from 'react';
${taroImport(opts.useRpx)}
export type IconNames = ${unionNames(opts.names)};

interface Props {
  name: IconNames;
  size?: number;
  color?: string | string[];
  style?: CSSProperties | string;
  className?: string;
}

const IconFont: FunctionComponent<Props> = ({ name, size = ${opts.size}, color, style, className, ...rest }) => {
  const customStyle = typeof style === 'string' ? style : '';
  // @ts-expect-error native mini-program component
  return <iconfont name={name} size={${sizeExpr}} color={color} style={style} className={className} customStyle={customStyle} {...rest} />;
};

export default IconFont;
`;
  }

  return `${ESLINT_BANNER}
${taroImport(opts.useRpx)}
const IconFont = ({ name, size = ${opts.size}, color, style, className, ...rest }) => {
  const customStyle = typeof style === 'string' ? style : '';
  return <iconfont name={name} size={${sizeExpr}} color={color} style={style} className={className} customStyle={customStyle} {...rest} />;
};

export default IconFont;
`;
};
