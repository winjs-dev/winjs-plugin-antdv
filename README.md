# winjs-plugin-antdv

适配 WinJS 的 Ant Design Vue 插件，提供 Ant Design Vue 组件库的自动导入和样式配置。

<p>
  <a href="https://npmjs.com/package/@winner-fed/plugin-antdv">
   <img src="https://img.shields.io/npm/v/@winner-fed/plugin-antdv?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" />
  </a>
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="license" />
  <a href="https://npmcharts.com/compare/@winner-fed/plugin-antdv?minimal=true"><img src="https://img.shields.io/npm/dm/@winner-fed/plugin-antdv.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="downloads" /></a>
</p>

## 功能特性

- 🚀 **自动导入组件** - 无需手动导入，直接使用 Ant Design Vue 组件
- 🎨 **自动导入样式** - 自动处理样式文件的导入
- 📦 **版本兼容** - 支持 Ant Design Vue 1.x 和 4.x 版本
- 🔧 **智能检测** - 自动检测项目中的依赖版本
- ⚡ **按需加载** - 只导入使用的组件，减小打包体积

## 安装

```bash
npm install @winner-fed/plugin-antdv
```

## 配置

在 WinJS 项目中启用插件：

```typescript
// win.config.ts
import { defineConfig } from '@winner-fed/winjs';

export default defineConfig({
  plugins: [
    '@winner-fed/plugin-antdv'
  ],
  // 可选：插件配置
  antdv: {
    // 插件配置选项
  }
});
```

## 使用示例

### 基本使用

安装并配置插件后，可以在 Vue 组件中直接使用 Ant Design Vue 组件：

```vue
<template>
  <div>
    <a-button type="primary">主要按钮</a-button>
    <a-button>默认按钮</a-button>
    <a-divider />
    <a-input placeholder="请输入内容" />
    <a-space>
      <a-tag color="blue">标签</a-tag>
      <a-tag color="green">标签</a-tag>
    </a-space>
  </div>
</template>

<script setup lang="ts">
// 无需手动导入组件，插件会自动处理
// import { Button, Input, Tag } from 'ant-design-vue';
</script>
```

### 支持的组件

插件支持所有 Ant Design Vue 组件，包括但不限于：

- **通用组件**：Button、Icon、Typography
- **布局组件**：Divider、Grid、Layout、Space
- **导航组件**：Affix、Breadcrumb、Dropdown、Menu、Pagination、Steps
- **数据录入**：AutoComplete、Cascader、Checkbox、DatePicker、Form、Input、InputNumber、Mentions、Radio、Rate、Select、Slider、Switch、TimePicker、Transfer、TreeSelect、Upload
- **数据展示**：Avatar、Badge、Calendar、Card、Carousel、Collapse、Comment、Descriptions、Empty、Image、List、Popover、Statistic、Table、Tabs、Tag、Timeline、Tooltip、Tree
- **反馈组件**：Alert、Drawer、Message、Modal、Notification、Popconfirm、Progress、Result、Skeleton、Spin
- **其他组件**：Anchor、BackTop、ConfigProvider、LocaleProvider

## 依赖要求

- `ant-design-vue`: ^4.0.0
- `vue`: ^3.0.0

## 版本兼容性

| 插件版本 | Ant Design Vue 版本 | Vue 版本 |
|---------|-------------------|----------|
| ^1.0.0  | ^4.0.0           | ^3.0.0   |
| ^1.0.0  | ^1.x             | ^2.0.0   |

## 工作原理

1. **依赖检测**：插件会自动检测项目中的 `ant-design-vue` 依赖
2. **版本判断**：根据检测到的版本自动配置不同的导入策略
3. **解析器配置**：集成 `unplugin-vue-components` 的 `AntDesignVueResolver`
4. **自动导入**：在构建时自动添加组件导入语句和样式导入

## 注意事项

- 确保项目中已安装 `ant-design-vue` 依赖
- 插件会自动处理样式导入，无需手动导入样式文件
- 支持 TypeScript，提供完整的类型支持

## 许可证

[MIT](./LICENSE).
