[English](README.md) | **中文**

# RoboCOIN DataManager

**版本: v1.1**

在线演示: https://flagopen.github.io/RoboCOIN-DataManager/

## 项目概述

RoboCOIN DataManager 是一个现代化的基于 Web 的数据集可视化和下载工具，用于浏览 RoboCOIN 数据集。它提供了直观的界面，支持浏览、筛选、预览、选择和批量下载数据集。应用程序支持多个数据源（ModelScope 和 HuggingFace），并提供支持层级对象选择的高级筛选功能。

## 项目结构

```
DataManage/
├── docs/                       # 主应用程序目录
│   ├── assets/                 # 资源文件
│   │   ├── dataset_info/       # 数据集元信息（YAML文件）
│   │   ├── info/               # 索引文件
│   │   │   ├── consolidated_datasets.json  # 合并的数据集信息
│   │   │   ├── data_index.json             # 数据集索引
│   │   │   └── robot_aliases.json          # 机器人别名映射
│   │   ├── thumbnails/         # 缩略图文件（*.jpg）
│   │   └── videos/             # 视频文件（*.mp4）
│   │
│   ├── css/                    # 模块化样式文件
│   │   ├── core/               # 核心样式
│   │   │   ├── variables.css   # CSS变量定义
│   │   │   ├── base.css        # 基础样式
│   │   │   ├── layout.css      # 布局样式
│   │   │   └── header.css      # 头部样式
│   │   ├── filter/             # 过滤器组件样式
│   │   │   ├── filter-control-bar.css
│   │   │   ├── filter-dropdown.css
│   │   │   ├── filter-options.css
│   │   │   └── filter-tooltip.css
│   │   ├── video/              # 视频组件样式
│   │   │   ├── video-panel.css
│   │   │   ├── video-card.css
│   │   │   ├── video-thumbnail.css
│   │   │   ├── video-info.css
│   │   │   ├── video-hover-overlay.css
│   │   │   └── video-toolbar.css
│   │   ├── selection/          # 选择面板样式
│   │   │   ├── selection-panel-base.css
│   │   │   ├── selection-list.css
│   │   │   ├── selection-item.css
│   │   │   ├── selection-footer.css
│   │   │   └── selection-hub-buttons.css
│   │   ├── components/         # 共享组件样式
│   │   │   ├── modal.css
│   │   │   └── toast.css
│   │   ├── responsive/         # 响应式设计样式
│   │   │   ├── responsive-mobile.css
│   │   │   ├── responsive-tablet.css
│   │   │   ├── responsive-desktop.css
│   │   │   └── responsive-print.css
│   │   ├── animations/         # 动画定义
│   │   │   └── animations.css
│   │   └── style.css           # CSS入口（导入所有样式）
│   │
│   ├── js/                     # 模块化JavaScript文件
│   │   ├── modules/            # 功能模块
│   │   │   ├── @filter/        # 过滤器模块包
│   │   │   │   ├── index.js
│   │   │   │   ├── filter-manager.js
│   │   │   │   ├── filter-state.js
│   │   │   │   ├── filter-renderer.js
│   │   │   │   ├── filter-hierarchy.js
│   │   │   │   ├── filter-search.js
│   │   │   │   └── data.js
│   │   │   ├── config.js       # 配置管理
│   │   │   ├── data-manager.js # 数据加载和缓存
│   │   │   ├── video-grid.js   # 视频网格渲染
│   │   │   ├── selection-panel.js # 选择面板管理
│   │   │   ├── download-manager.js # 下载命令生成
│   │   │   ├── robot-aliases.js # 机器人别名管理
│   │   │   ├── ui-utils.js     # UI工具
│   │   │   ├── dom-utils.js    # DOM操作工具
│   │   │   ├── event-handlers.js # 事件处理
│   │   │   ├── virtual-scroll.js # 虚拟滚动
│   │   │   ├── toast-manager.js # 提示通知
│   │   │   └── error-notifier.js # 错误处理
│   │   ├── app.js              # 主应用协调器
│   │   ├── main.js             # 应用入口点
│   │   ├── templates.js        # HTML模板
│   │   └── types.js            # JSDoc类型定义
│   │
│   ├── index.html              # 主页面
│   ├── favicon.ico             # 网站图标
│   ├── README.md               # 项目文档（英文）
│   └── README.zh.md            # 项目文档（中文）
│
└── README.md                   # 根目录文档
```

## 核心特性

### 1. 高级数据集筛选
- **多维度筛选**：按场景、机器人、末端执行器、动作和操作对象筛选
- **层级式过滤器**：支持嵌套对象层级结构，提供直观导航
- **实时搜索**：按名称搜索数据集，即时显示结果
- **Filter Finder**：使用键盘快捷键（Ctrl+F）快速定位筛选项
- **动态筛选计数**：查看每个筛选项匹配的数据集数量
- **筛选重置**：一键重置以清除所有活动筛选器
- **筛选状态持久化**：筛选选择在会话期间保持

### 2. 丰富的数据集预览
- **视频自动播放**：悬停时自动播放视频
- **悬停信息覆盖层**：无需打开详情即可查看关键数据集信息
- **详情模态框**：在模态视图中查看完整的数据集信息
- **缩略图支持**：每个数据集的快速加载缩略图
- **视频控制**：视频预览的播放、暂停和搜索控制
- **响应式预览**：适配不同屏幕尺寸

### 3. 选择和批量管理
- **批量选择**：选择多个数据集并提供视觉反馈
- **购物车功能**：将选定的数据集添加到下载购物车
- **批量操作**：添加所有筛选项、删除选定项或清空购物车
- **选择面板**：侧边面板显示下载购物车中的所有项目
- **选择状态持久化**：筛选期间保持购物车状态
- **单项管理**：单独从购物车中移除项目

### 4. 导出和下载功能
- **JSON格式导出**：将选择列表导出为JSON文件以便备份/分享
- **JSON导入**：导入先前保存的选择列表
- **Python下载命令**：生成即用的下载命令
- **多源支持**：在ModelScope和HuggingFace中心之间切换
- **下载路径配置**：自定义下载目录的使用说明
- **剪贴板集成**：一键复制下载命令

### 5. 性能优化
- **虚拟滚动**：高效处理大型数据集（数百个项目）
- **延迟加载视频**：仅在视口中可见时加载视频
- **IntersectionObserver API**：优化的视口检测
- **元素缓存和复用**：高效的DOM元素管理
- **渐进式加载**：数据集批量加载，带进度指示器
- **防抖/节流事件**：优化的滚动和调整大小处理

### 6. 用户体验增强
- **加载覆盖层**：初始数据集加载期间的进度指示器
- **提示通知**：用户操作的非侵入式反馈
- **响应式设计**：针对桌面、平板和移动设备优化
- **错误处理**：优雅的错误消息和恢复建议
- **全局横幅**：重要公告（交互时可关闭）
- **机器人别名支持**：使用人类可读的机器人名称而非技术ID

## 快速开始

### 浏览器要求

- Chrome/Edge 61+
- Firefox 60+
- Safari 11+
- Opera 48+

（支持ES6模块的现代浏览器）

## 使用指南

### 1. 筛选数据集

点击 **"Filter datasets"** 按钮打开筛选下拉覆盖层：
- 使用侧边栏在筛选类别之间导航（场景、机器人、末端执行器、动作、操作对象）
- 点击筛选项以激活/停用筛选器
- 使用 **Filter Finder**（Ctrl+F）快速搜索特定筛选项
- 使用箭头按钮（↑/↓）或键盘在筛选匹配项之间导航
- 查看动态计数，显示有多少数据集匹配每个筛选器
- 点击 **"Reset filters"** 按钮清除所有活动筛选器
- 点击 **"Done"** 或按 Escape 键关闭筛选面板

### 2. 搜索数据集

- 使用筛选控制栏中的搜索框按名称搜索数据集
- 搜索不区分大小写，实时过滤结果
- 点击搜索框中的清除按钮（×）重置搜索
- 搜索与活动筛选器结合使用

### 3. 选择数据集

- **选择单个数据集**：点击视频卡片以选择/取消选择它们
- **批量选择**：点击 **"Select all datasets"** 选择所有筛选项
- **清除选择**：点击 **"Deselect all datasets"** 清除所有选择
- 选中的卡片会显示边框和勾选标记高亮
- 在筛选控制栏中查看选择计数

### 4. 管理批量下载购物车

- **添加到购物车**：选定的数据集显示在右侧的 **"Batch Downloader"** 面板中
- **查看购物车**：选择面板显示下载购物车中的所有项目
- **移除项目**：点击购物车中单个项目上的移除按钮（×）
- **购物车计数器**：在面板底部查看购物车中的项目总数

### 5. 导出下载命令

1. **选择Hub源**：使用Hub切换按钮在 **HuggingFace** 和 **ModelScope** 之间切换
2. **查看命令**：下载命令自动在代码输出区域生成
3. **复制命令**：点击 **"Copy & Checkout"** 按钮将命令复制到剪贴板
4. **执行**：在终端中粘贴并运行命令以下载数据集
5. **自定义路径**：添加 `--target-dir YOUR_DOWNLOAD_DIR` 指定自定义下载目录

### 6. 导入/导出选择

- **导出JSON**：点击 **"Export JSON"** 将当前选择列表保存为JSON文件
- **导入JSON**：点击 **"Import JSON"** 加载先前保存的选择列表
- 这允许您在会话之间保存和分享数据集选择

### 7. 查看数据集详情

- **悬停预览**：悬停在视频卡片上可查看基本信息覆盖层
- **视频预览**：悬停时视频自动播放
- **详细视图**：点击视频卡片或使用工具栏按钮打开详情模态框
- **数据集信息**：查看完整的元数据，包括场景、动作、对象、机器人型号等

## 贡献

欢迎提交Issue和Pull Request！

## 联系方式

如有任何问题，请及时联系 pykerogers@outlook.com

