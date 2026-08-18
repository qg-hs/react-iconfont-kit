import { ESLINT_BANNER, renderImports, renderReExports, unionNames } from './shared.js';

export const renderH5SingleIcon = (opts: {
  ts: boolean;
  componentName: string;
  size: number;
  iconJsx: string;
}): string => {
  if (opts.ts) {
    return `${ESLINT_BANNER}
import type { CSSProperties, SVGAttributes, FunctionComponent } from 'react';
import { getIconColor } from './helper';

interface Props extends Omit<SVGAttributes<SVGElement>, 'color'> {
  size?: number;
  color?: string | string[];
}

const DEFAULT_STYLE: CSSProperties = {
  display: 'block',
};

const ${opts.componentName}: FunctionComponent<Props> = ({ size = ${opts.size}, color, style: _style, className, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  /* prettier-ignore */
  return (${opts.iconJsx}  );
};

export default ${opts.componentName};
`;
  }

  return `${ESLINT_BANNER}
import { getIconColor } from './helper';

const DEFAULT_STYLE = {
  display: 'block',
};

const ${opts.componentName} = ({ size = ${opts.size}, color, style: _style, className, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  /* prettier-ignore */
  return (${opts.iconJsx}  );
};

export default ${opts.componentName};
`;
};

export const renderH5SingleIconDts = (componentName: string): string => `${ESLINT_BANNER}
import type { SVGAttributes, FunctionComponent } from 'react';

interface Props extends Omit<SVGAttributes<SVGElement>, 'color'> {
  size?: number;
  color?: string | string[];
}

declare const ${componentName}: FunctionComponent<Props>;

export default ${componentName};
`;

export const renderH5Index = (opts: {
  ts: boolean;
  names: string[];
  components: string[];
  cases: string;
}): string => {
  const imports = renderImports(opts.components);
  const reexports = renderReExports(opts.components);

  if (opts.ts) {
    return `${ESLINT_BANNER}
import type { SVGAttributes, FunctionComponent } from 'react';
${imports}
${reexports}

export type IconNames = ${unionNames(opts.names)};

interface Props extends Omit<SVGAttributes<SVGElement>, 'color'> {
  name: IconNames;
  size?: number;
  color?: string | string[];
}

const IconFont: FunctionComponent<Props> = ({ name, ...rest }) => {
  switch (name) {
${opts.cases}
    default:
      return null;
  }
};

export default IconFont;
`;
  }

  return `${ESLINT_BANNER}
${imports}
${reexports}

const IconFont = ({ name, ...rest }) => {
  switch (name) {
${opts.cases}
    default:
      return null;
  }
};

export default IconFont;
`;
};

export const renderH5IndexDts = (opts: { names: string[]; components: string[] }): string => `${ESLINT_BANNER}
import type { SVGAttributes, FunctionComponent } from 'react';
${renderReExports(opts.components)}

interface Props extends Omit<SVGAttributes<SVGElement>, 'color'> {
  name: ${unionNames(opts.names)};
  size?: number;
  color?: string | string[];
}

declare const IconFont: FunctionComponent<Props>;

export default IconFont;
`;
