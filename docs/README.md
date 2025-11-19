# RoboCOIN DataManage

https://flagopen.github.io/RoboCOIN-DataManage/

## 项目概述

RoboCOIN数据集可视化和下载工具，支持筛选、预览、选择和导出数据集。

## 项目结构

```
robocoin-html/
├── docs/
│   ├── assets/                 # 资源文件
│   │   ├── dataset_info/       # 数据集元信息（98个YAML文件）
│   │   ├── info/               # 索引文件
│   │   │   ├── consolidated_datasets.json  # 合并的数据集信息
│   │   │   └── data_index.json             # 数据集索引
│   │   ├── thumbnails/         # 缩略图文件（*.jpg，由assets/thumbnails提供）
│   │   └── videos/             # 视频文件（98个MP4）
│   │
│   ├── css/                    # 样式文件（模块化）
│   │   ├── variables.css       # CSS变量定义
│   │   ├── base.css            # 基础样式
│   │   ├── layout.css          # 布局样式
│   │   ├── header.css          # 头部样式
│   │   ├── filter.css          # 过滤器样式
│   │   ├── video-grid.css      # 视频网格样式
│   │   ├── selection-panel.css # 选择面板样式
│   │   ├── modal.css           # 模态框样式
│   │   ├── animations.css      # 动画定义
│   │   ├── responsive.css      # 响应式样式
│   │   └── style.css           # CSS入口
│   │
│   ├── js/                     # JavaScript文件（模块化）
│   │   ├── modules/            # 功能模块
│   │   │   ├── config.js       # 配置管理
│   │   │   ├── data-manager.js # 数据管理
│   │   │   ├── filter-manager.js # 过滤器管理
│   │   │   ├── video-grid.js   # 视频网格
│   │   │   ├── selection-panel.js # 选择面板
│   │   │   ├── ui-utils.js     # UI工具
│   │   │   ├── event-handlers.js # 事件处理
│   │   │   └── virtual-scroll.js # 虚拟滚动
│   │   ├── app.js              # 主应用
│   │   ├── main.js             # 入口文件
│   │   ├── templates.js        # HTML模板
│   │   └── types.js            # 类型定义
│   │
│   ├── index.html              # 主页面
│   ├── favicon.ico             # 网站图标
│   ├── README.md               # 项目说明
│   └── REFACTORING.md          # 重构文档
│
└── README.md                   # 根目录说明
```

## 核心特性

### 1. 数据集筛选
- 多维度筛选：场景、机器人、末端执行器、动作、操作对象
- 层级式过滤器（支持对象层级结构）
- 实时搜索功能
- Filter Finder（筛选项搜索）

### 2. 数据集预览
- 视频自动播放
- 悬浮信息层
- 详情模态框
- 缩略图加载（从assets/thumbnails目录提供，不自动生成）

### 3. 选择和管理
- 多选/单选
- 购物车功能
- 批量操作（添加/删除/清空）
- 选择状态保持

### 4. 导出功能
- JSON格式导出
- Python下载命令生成
- 支持ModelScope/HuggingFace源
- 导入已保存的选择

### 5. 性能优化
- 虚拟滚动（支持大数据集）
- 延迟加载视频
- IntersectionObserver优化
- 元素缓存复用

## 快速开始

### 浏览器要求

- Chrome/Edge 61+
- Firefox 60+
- Safari 11+
- Opera 48+

（支持ES6模块的现代浏览器）

## 使用指南

### 1. 筛选数据集

点击 **Filters** 按钮打开筛选器：
- 选择场景类型
- 选择机器人型号
- 选择末端执行器
- 选择动作类型
- 选择操作对象（支持层级选择）

### 2. 搜索数据集

使用顶部搜索框按名称搜索数据集。

### 3. 选择数据集

- 单击卡片选择/取消选择
- 使用 **select all** / **deselect** 批量操作
- 选中的卡片会高亮显示

### 4. 管理购物车

- 点击 **🛒 add** 将选中项添加到购物车
- 点击 **🗑️ remove** 从购物车删除选中项
- 点击 **🔄 clear** 清空购物车

### 5. 导出下载命令

1. 选择Hub源（ModelScope或HuggingFace）
2. 点击 **📋 Copy & Checkout ⬇️** 复制命令
3. 在终端执行命令下载数据集

### 6. 导入/导出选择

- 点击 **📤 export .json** 导出选择列表
- 点击 **📋 import .json** 导入已保存的列表

## 贡献

欢迎提交Issue和Pull Request！

## 联系方式

如有任何问题，请及时联系 pykerogers@outlook.com
