import { ESLINT_BANNER, renderImports, renderReExports, svgComponentsImport, unionNames } from './shared.js';

export const renderRnSingleIcon = (opts: {
  ts: boolean;
  componentName: string;
  size: number;
  iconJsx: string;
  svgComponents: Set<string>;
}): string => {
  const svgImport = svgComponentsImport(opts.svgComponents);

  if (opts.ts) {
    return `${ESLINT_BANNER}
import { memo } from 'react';
import type { FunctionComponent } from 'react';
import type { ViewProps } from 'react-native';
${svgImport}
import { getIconColor } from './helper';

interface Props extends GProps, ViewProps {
  size?: number;
  color?: string | string[];
}

const ${opts.componentName}: FunctionComponent<Props> = ({ size = ${opts.size}, color, ...rest }) => {
  /* prettier-ignore */
  return (${opts.iconJsx}  );
};

export default memo(${opts.componentName});
`;
  }

  return `${ESLINT_BANNER}
import { memo } from 'react';
${svgImport}
import { getIconColor } from './helper';

const ${opts.componentName} = ({ size = ${opts.size}, color, ...rest }) => {
  /* prettier-ignore */
  return (${opts.iconJsx}  );
};

export default memo(${opts.componentName});
`;
};

export const renderRnLocalIcon = (opts: {
  ts: boolean;
  componentName: string;
  size: number;
  svgStr: string;
  styleType: boolean;
  svgComponents: Set<string>;
}): string => {
  const svgImport = svgComponentsImport(opts.svgComponents);
  const tag = opts.styleType ? 'SvgCss' : 'SvgXml';
  const xml = `const xml = \`\n${opts.svgStr}\n\`;`;
  const iconJsx = `\n    <${tag} xml={xml}  width={size} height={size} {...rest} />\n`;

  if (opts.ts) {
    return `${ESLINT_BANNER}
import { memo } from 'react';
import type { FunctionComponent } from 'react';
import type { ViewProps } from 'react-native';
${svgImport}

interface Props extends GProps, ViewProps {
  size?: number;
  color?: string | string[];
}

${xml}

const ${opts.componentName}: FunctionComponent<Props> = ({ size = ${opts.size}, ...rest }) => {
  /* prettier-ignore */
  return (${iconJsx}  );
};

export default memo(${opts.componentName});
`;
  }

  return `${ESLINT_BANNER}
import { memo } from 'react';
${svgImport}

${xml}

const ${opts.componentName} = ({ size = ${opts.size}, ...rest }) => {
  /* prettier-ignore */
  return (${iconJsx}  );
};

export default memo(${opts.componentName});
`;
};

export const renderRnSingleIconDts = (componentName: string): string => `${ESLINT_BANNER}
import type { FunctionComponent } from 'react';
import type { ViewProps } from 'react-native';
import type { GProps } from 'react-native-svg';

interface Props extends GProps, ViewProps {
  size?: number;
  color?: string | string[];
}

declare const ${componentName}: FunctionComponent<Props>;

export default ${componentName};
`;

export const renderRnIndex = (opts: {
  ts: boolean;
  names: string[];
  components: string[];
  cases: string;
  svgComponents: Set<string>;
}): string => {
  const svgImport = svgComponentsImport(opts.svgComponents);
  const imports = renderImports(opts.components);
  const reexports = renderReExports(opts.components);

  if (opts.ts) {
    return `${ESLINT_BANNER}
import { memo } from 'react';
import type { FunctionComponent } from 'react';
import type { ViewProps } from 'react-native';
${svgImport}
${imports}
${reexports}

export type IconNames = ${unionNames(opts.names)};

interface Props extends GProps, ViewProps {
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

export default memo(IconFont);
`;
  }

  return `${ESLINT_BANNER}
import { memo } from 'react';
${svgImport}
${imports}
${reexports}

const IconFont = ({ name, ...rest }) => {
  switch (name) {
${opts.cases}
    default:
      return null;
  }
};

export default memo(IconFont);
`;
};

export const renderRnIndexDts = (opts: { names: string[]; components: string[] }): string => `${ESLINT_BANNER}
import type { FunctionComponent } from 'react';
import type { ViewProps } from 'react-native';
import type { GProps } from 'react-native-svg';

${renderReExports(opts.components)}

interface Props extends GProps, ViewProps {
  name: ${unionNames(opts.names)};
  size?: number;
  color?: string | string[];
}

declare const IconFont: FunctionComponent<Props>;

export default IconFont;
`;
