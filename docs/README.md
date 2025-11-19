**English** | [中文](README.zh.md)

# RoboCOIN DataManage

https://flagopen.github.io/RoboCOIN-DataManage/

## Project Overview

RoboCOIN dataset visualization and download tool, supporting filtering, preview, selection, and dataset export.

## Project Structure

```
robocoin-html/
├── docs/
│   ├── assets/                 # Resource files
│   │   ├── dataset_info/       # Dataset metadata (98 YAML files)
│   │   ├── info/               # Index files
│   │   │   ├── consolidated_datasets.json  # Consolidated dataset information
│   │   │   └── data_index.json             # Dataset index
│   │   ├── thumbnails/         # Thumbnail files (*.jpg, provided by assets/thumbnails)
│   │   └── videos/             # Video files (98 MP4s)
│   │
│   ├── css/                    # Style files (modular)
│   │   ├── variables.css       # CSS variable definitions
│   │   ├── base.css            # Base styles
│   │   ├── layout.css          # Layout styles
│   │   ├── header.css          # Header styles
│   │   ├── filter.css          # Filter styles
│   │   ├── video-grid.css      # Video grid styles
│   │   ├── selection-panel.css # Selection panel styles
│   │   ├── modal.css           # Modal styles
│   │   ├── animations.css      # Animation definitions
│   │   ├── responsive.css      # Responsive styles
│   │   └── style.css           # CSS entry point
│   │
│   ├── js/                     # JavaScript files (modular)
│   │   ├── modules/            # Feature modules
│   │   │   ├── config.js       # Configuration management
│   │   │   ├── data-manager.js # Data management
│   │   │   ├── filter-manager.js # Filter management
│   │   │   ├── video-grid.js   # Video grid
│   │   │   ├── selection-panel.js # Selection panel
│   │   │   ├── ui-utils.js     # UI utilities
│   │   │   ├── event-handlers.js # Event handling
│   │   │   └── virtual-scroll.js # Virtual scrolling
│   │   ├── app.js              # Main application
│   │   ├── main.js             # Entry file
│   │   ├── templates.js        # HTML templates
│   │   └── types.js            # Type definitions
│   │
│   ├── index.html              # Main page
│   ├── favicon.ico             # Website icon
│   ├── README.md               # Project documentation
│   └── REFACTORING.md          # Refactoring documentation
│
└── README.md                   # Root directory documentation
```

## Core Features

### 1. Dataset Filtering
- Multi-dimensional filtering: Scene, Robot, End-effector, Action, Object
- Hierarchical filters (supports object hierarchy)
- Real-time search functionality
- Filter Finder (filter option search)

### 2. Dataset Preview
- Video auto-play
- Hover information overlay
- Detail modal dialog
- Thumbnail loading (provided from assets/thumbnails directory, not auto-generated)

### 3. Selection and Management
- Multi-select/Single-select
- Shopping cart functionality
- Batch operations (add/remove/clear)
- Selection state persistence

### 4. Export Functionality
- JSON format export
- Python download command generation
- Support for ModelScope/HuggingFace sources
- Import saved selections

### 5. Performance Optimization
- Virtual scrolling (supports large datasets)
- Lazy loading videos
- IntersectionObserver optimization
- Element caching and reuse

## Quick Start

### Browser Requirements

- Chrome/Edge 61+
- Firefox 60+
- Safari 11+
- Opera 48+

(Modern browsers supporting ES6 modules)

## User Guide

### 1. Filter Datasets

Click the **Filters** button to open the filter panel:
- Select scene type
- Select robot model
- Select end-effector
- Select action type
- Select object (supports hierarchical selection)

### 2. Search Datasets

Use the top search box to search datasets by name.

### 3. Select Datasets

- Click cards to select/deselect
- Use **select all** / **deselect** for batch operations
- Selected cards will be highlighted

### 4. Manage Shopping Cart

- Click **🛒 add** to add selected items to cart
- Click **🗑️ remove** to remove selected items from cart
- Click **🔄 clear** to clear the cart

### 5. Export Download Commands

1. Select Hub source (ModelScope or HuggingFace)
2. Click **📋 Copy & Checkout ⬇️** to copy the command
3. Execute the command in terminal to download datasets

### 6. Import/Export Selections

- Click **📤 export .json** to export selection list
- Click **📋 import .json** to import saved list

## Contributing

Issues and Pull Requests are welcome!

## Contact

For any questions, please contact pykerogers@outlook.com
