import { dirname } from 'node:path';
import { deepmerge, resolve } from '@winner-fed/utils';
import type { IApi } from '@winner-fed/winjs';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

function resolveProjectDep(opts: {
  pkg: PackageJson;
  cwd: string;
  dep: string;
}) {
  if (
    opts.pkg.dependencies?.[opts.dep] ||
    opts.pkg.devDependencies?.[opts.dep]
  ) {
    return dirname(
      resolve.sync(`${opts.dep}/package.json`, {
        basedir: opts.cwd,
      }),
    );
  }
}

function compareVersion(version: string, targetVersion: string): number {
  const parseVersion = (v: string) => {
    // 解析版本号，处理 beta/alpha/rc 等预发布版本
    const match = v.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+?)\.(\d+))?/);
    if (!match)
      return { major: 0, minor: 0, patch: 0, prerelease: '', prereleaseNum: 0 };

    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10),
      prerelease: match[4] || '',
      prereleaseNum: parseInt(match[5] || '0', 10),
    };
  };

  const v1 = parseVersion(version);
  const v2 = parseVersion(targetVersion);

  // 比较主版本号
  if (v1.major !== v2.major) return v1.major - v2.major;
  // 比较次版本号
  if (v1.minor !== v2.minor) return v1.minor - v2.minor;
  // 比较修订版本号
  if (v1.patch !== v2.patch) return v1.patch - v2.patch;

  // 如果都没有预发布版本，则相等
  if (!v1.prerelease && !v2.prerelease) return 0;

  // 正式版本大于预发布版本
  if (!v1.prerelease && v2.prerelease) return 1;
  if (v1.prerelease && !v2.prerelease) return -1;

  // 比较预发布版本
  if (v1.prerelease !== v2.prerelease) {
    return v1.prerelease.localeCompare(v2.prerelease);
  }

  // 比较预发布版本号
  return v1.prereleaseNum - v2.prereleaseNum;
}

function checkVersionCompatibility(version: string) {
  const minRequiredVersion = '2.2.0-beta.6';

  // 检查是否满足最低版本要求
  if (compareVersion(version, minRequiredVersion) < 0) {
    console.warn(
      `[winjs-plugin-antdv] 警告：当前 ant-design-vue 版本 (${version}) 不支持 AntDesignVueResolver。\n` +
        `AntDesignVueResolver 需要 ant-design-vue@${minRequiredVersion} 或更高版本。\n` +
        `请升级您的 ant-design-vue 版本：npm install ant-design-vue@latest`,
    );
    return false;
  }

  return true;
}

export default (api: IApi) => {
  let pkgPath: string = '';
  try {
    pkgPath =
      resolveProjectDep({
        pkg: api.pkg,
        cwd: api.cwd,
        dep: 'ant-design-vue',
      }) || dirname(require.resolve('ant-design-vue/package.json'));
  } catch (_) {}

  function checkPkgPath() {
    if (!pkgPath) {
      throw new Error(
        `Can't find ant-design-vue package. Please install antd first.`,
      );
    }
  }

  const antdvVersion = require(`${pkgPath}/package.json`).version;

  api.modifyAppData((memo) => {
    checkPkgPath();
    // 检查版本兼容性
    checkVersionCompatibility(antdvVersion);
    memo.antdv = {
      pkgPath,
      version: antdvVersion,
    };
    return memo;
  });

  api.describe({
    key: 'antdv',
    config: {
      schema({ zod }) {
        return zod
          .object({
            exclude: zod
              .array(zod.string())
              .describe(
                '排除自动导入的组件列表。数组元素为组件名称（不含前缀），如 ["Button", "Input"]。被排除的组件需要手动导入。',
              )
              .default([])
              .optional(),
            importStyle: zod
              .union([
                zod.boolean(),
                zod.literal('css'),
                zod.literal('less'),
                zod.literal('css-in-js'),
              ])
              .describe(
                '样式导入方式。true 或 "css" 导入编译后的 CSS 文件，"less" 导入 Less 源文件以支持主题定制，"css-in-js" 导入 CSS-in-JS 样式，false 不自动导入样式。默认为 "css"。',
              )
              .optional(),
            resolveIcons: zod
              .boolean()
              .describe(
                '是否自动解析和导入 Ant Design Vue 的图标组件。设为 true 时，将自动解析并导入图标组件，无需手动导入。需要安装 @ant-design/icons-vue 包。默认为 false。',
              )
              .default(false)
              .optional(),
            cjs: zod
              .boolean()
              .describe(
                '是否使用 CommonJS 构建版本。设为 true 时使用 CommonJS 构建，false 使用 ES 模块构建。默认为 false。',
              )
              .default(false)
              .optional(),
            packageName: zod
              .string()
              .describe(
                '重命名包名。用于指定 ant-design-vue 包的别名或自定义包名。默认为 "ant-design-vue"。',
              )
              .default('ant-design-vue')
              .optional(),
            prefix: zod
              .string()
              .describe(
                '组件名称前缀。默认为 "A"，对应 "AButton"、"AInput" 等组件名。如需自定义可修改此配置。',
              )
              .default('A')
              .optional(),
          })
          .describe(
            'Ant Design Vue 自动导入插件配置。集成 unplugin-vue-components 的 AntDesignVueResolver，提供 Ant Design Vue 组件和样式的按需自动导入功能，支持 Vue2 和 Vue3 版本。',
          )
          .optional()
          .default({});
      },
    },
    enableBy: api.EnableBy.config,
  });

  // 获取用户配置，如果没有配置则使用默认值
  const userConfig = api.config.antdv || {};
  const resolverConfig = {
    // 排除的组件列表：默认为空数组
    ...(userConfig.exclude &&
      userConfig.exclude.length > 0 && { exclude: userConfig.exclude }),
    // 样式导入方式：用户配置优先，否则使用默认值 'css'
    importStyle:
      userConfig.importStyle !== undefined ? userConfig.importStyle : 'css',
    // 是否解析图标：默认为 false
    resolveIcons:
      userConfig.resolveIcons !== undefined ? userConfig.resolveIcons : false,
    // 是否使用 CommonJS：默认为 false
    ...(userConfig.cjs !== undefined && { cjs: userConfig.cjs }),
    // 包名：默认为 'ant-design-vue'
    ...(userConfig.packageName &&
      userConfig.packageName !== 'ant-design-vue' && {
        packageName: userConfig.packageName,
      }),
    // 组件前缀：默认为 'A'
    ...(userConfig.prefix &&
      userConfig.prefix !== 'A' && { prefix: userConfig.prefix }),
  };

  const unComponents = {
    resolvers: [AntDesignVueResolver(resolverConfig)],
  };

  api.userConfig.autoImport = deepmerge(
    {
      unComponents,
    },
    api.userConfig.autoImport || {},
  );
};
