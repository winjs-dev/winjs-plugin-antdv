import { dirname } from 'node:path';
import { deepmerge, resolve } from '@winner-fed/utils';
import type { IApi } from '@winner-fed/winjs';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';

function resolveProjectDep(opts: { pkg: any; cwd: string; dep: string }) {
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

export default (api: IApi) => {
  let pkgPath: string = '';
  try {
    pkgPath =
      resolveProjectDep({
        pkg: api.pkg,
        cwd: api.cwd,
        dep: 'ant-design-vue',
      }) || dirname(require.resolve('ant-design-vue/package.json'));
  } catch (e) {
    throw new Error(
      `Can't find ant-design-vue package. Please install antd first.`,
    );
  }

  function checkPkgPath() {
    if (!pkgPath) {
      throw new Error(
        `Can't find ant-design-vue package. Please install antd first.`,
      );
    }
  }

  const antdvVersion = require(`${pkgPath}/package.json`).version;
  const isAntdv2 = antdvVersion?.startsWith('1.');

  api.modifyAppData((memo) => {
    checkPkgPath();
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
        return zod.object({});
      },
    },
    enableBy: api.EnableBy.config,
  });

  const unComponents = {
    resolvers: [
      AntDesignVueResolver({
        // vue2 为 true
        importStyle: isAntdv2,
      }),
    ],
  };

  api.userConfig.autoImport = deepmerge(
    {
      unComponents,
    },
    api.userConfig.autoImport || {},
  );
};
