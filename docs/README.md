**English** | [中文](README.zh.md)

# RoboCOIN DataManager

**Version: v1.1**

Live Demo: https://flagopen.github.io/RoboCOIN-DataManager/

## Project Overview

RoboCOIN DataManager is a modern web-based dataset visualization and download tool for the RoboCOIN dataset. It provides an intuitive interface for browsing, filtering, previewing, selecting, and batch downloading datasets. The application supports multiple data sources (ModelScope and HuggingFace) and offers advanced filtering capabilities with hierarchical object selection.

## Project Structure

```
DataManage/
├── docs/                       # Main application directory
│   ├── assets/                 # Resource files
│   │   ├── dataset_info/       # Dataset metadata (YAML files)
│   │   ├── info/               # Index files
│   │   │   ├── consolidated_datasets.json  # Consolidated dataset information
│   │   │   ├── data_index.json             # Dataset index
│   │   │   └── robot_aliases.json          # Robot alias mappings
│   │   ├── thumbnails/         # Thumbnail images (*.jpg)
│   │   └── videos/             # Video files (*.mp4)
│   │
│   ├── css/                    # Modular style files
│   │   ├── core/               # Core styles
│   │   │   ├── variables.css   # CSS variable definitions
│   │   │   ├── base.css        # Base styles
│   │   │   ├── layout.css      # Layout styles
│   │   │   └── header.css      # Header styles
│   │   ├── filter/             # Filter component styles
│   │   │   ├── filter-control-bar.css
│   │   │   ├── filter-dropdown.css
│   │   │   ├── filter-options.css
│   │   │   └── filter-tooltip.css
│   │   ├── video/              # Video component styles
│   │   │   ├── video-panel.css
│   │   │   ├── video-card.css
│   │   │   ├── video-thumbnail.css
│   │   │   ├── video-info.css
│   │   │   ├── video-hover-overlay.css
│   │   │   └── video-toolbar.css
│   │   ├── selection/          # Selection panel styles
│   │   │   ├── selection-panel-base.css
│   │   │   ├── selection-list.css
│   │   │   ├── selection-item.css
│   │   │   ├── selection-footer.css
│   │   │   └── selection-hub-buttons.css
│   │   ├── components/         # Shared component styles
│   │   │   ├── modal.css
│   │   │   └── toast.css
│   │   ├── responsive/         # Responsive design styles
│   │   │   ├── responsive-mobile.css
│   │   │   ├── responsive-tablet.css
│   │   │   ├── responsive-desktop.css
│   │   │   └── responsive-print.css
│   │   ├── animations/         # Animation definitions
│   │   │   └── animations.css
│   │   └── style.css           # CSS entry point (imports all styles)
│   │
│   ├── js/                     # Modular JavaScript files
│   │   ├── modules/            # Feature modules
│   │   │   ├── @filter/        # Filter module package
│   │   │   │   ├── index.js
│   │   │   │   ├── filter-manager.js
│   │   │   │   ├── filter-state.js
│   │   │   │   ├── filter-renderer.js
│   │   │   │   ├── filter-hierarchy.js
│   │   │   │   ├── filter-search.js
│   │   │   │   └── data.js
│   │   │   ├── config.js       # Configuration management
│   │   │   ├── data-manager.js # Data loading and caching
│   │   │   ├── video-grid.js   # Video grid rendering
│   │   │   ├── selection-panel.js # Selection panel management
│   │   │   ├── download-manager.js # Download command generation
│   │   │   ├── robot-aliases.js # Robot alias management
│   │   │   ├── ui-utils.js     # UI utilities
│   │   │   ├── dom-utils.js    # DOM manipulation utilities
│   │   │   ├── event-handlers.js # Event handling
│   │   │   ├── virtual-scroll.js # Virtual scrolling
│   │   │   ├── toast-manager.js # Toast notifications
│   │   │   └── error-notifier.js # Error handling
│   │   ├── app.js              # Main application coordinator
│   │   ├── main.js             # Application entry point
│   │   ├── templates.js        # HTML templates
│   │   └── types.js            # JSDoc type definitions
│   │
│   ├── index.html              # Main page
│   ├── favicon.ico             # Website icon
│   ├── README.md               # Project documentation (English)
│   └── README.zh.md            # Project documentation (Chinese)
│
└── README.md                   # Root directory documentation
```

## Core Features

### 1. Advanced Dataset Filtering
- **Multi-dimensional filtering**: Filter by Scene, Robot, End-effector, Action, and Object
- **Hierarchical filters**: Supports nested object hierarchy with intuitive navigation
- **Real-time search**: Search datasets by name with instant results
- **Filter Finder**: Quickly locate filter options using keyboard shortcuts (Ctrl+F)
- **Dynamic filter counts**: See how many datasets match each filter option
- **Filter reset**: One-click reset to clear all active filters
- **Persistent filter state**: Filter selections persist during session

### 2. Rich Dataset Preview
- **Video auto-play**: Videos automatically play on hover
- **Hover information overlay**: View key dataset information without opening details
- **Detail modal dialog**: Comprehensive dataset information in a modal view
- **Thumbnail support**: Fast-loading thumbnail images for each dataset
- **Video controls**: Play, pause, and seek controls for video previews
- **Responsive preview**: Adapts to different screen sizes

### 3. Selection and Batch Management
- **Batch selection**: Select multiple datasets with visual feedback
- **Shopping cart functionality**: Add selected datasets to download cart
- **Batch operations**: Add all filtered items, remove selected items, or clear cart
- **Selection panel**: Side panel showing all items in download cart
- **Selection state persistence**: Cart state maintained during filtering
- **Individual item management**: Remove items from cart individually

### 4. Export and Download Functionality
- **JSON format export**: Export selection list as JSON file for backup/sharing
- **JSON import**: Import previously saved selection lists
- **Python download command**: Generate ready-to-use download commands
- **Multi-source support**: Switch between ModelScope and HuggingFace hubs
- **Download path configuration**: Instructions for custom download directories
- **Clipboard integration**: One-click copy of download commands

### 5. Performance Optimization
- **Virtual scrolling**: Efficiently handles large datasets (hundreds of items)
- **Lazy loading videos**: Videos load only when visible in viewport
- **IntersectionObserver API**: Optimized viewport detection
- **Element caching and reuse**: Efficient DOM element management
- **Progressive loading**: Datasets load in batches with progress indicator
- **Debounced/throttled events**: Optimized scroll and resize handling

### 6. User Experience Enhancements
- **Loading overlay**: Progress indicator during initial dataset loading
- **Toast notifications**: Non-intrusive feedback for user actions
- **Responsive design**: Optimized for desktop, tablet, and mobile devices
- **Error handling**: Graceful error messages with recovery suggestions
- **Global banner**: Important announcements (dismissible on interaction)
- **Robot alias support**: Human-readable robot names instead of technical IDs

## Quick Start

### Browser Requirements

- Chrome/Edge 61+
- Firefox 60+
- Safari 11+
- Opera 48+

(Modern browsers supporting ES6 modules)

## User Guide

### 1. Filter Datasets

Click the **"Filter datasets"** button to open the filter dropdown overlay:
- Use the sidebar to navigate between filter categories (Scene, Robot, End-effector, Action, Object)
- Click filter options to activate/deactivate filters
- Use **Filter Finder** (Ctrl+F) to quickly search for specific filter options
- Navigate through filter matches using arrow buttons (↑/↓) or keyboard
- View dynamic counts showing how many datasets match each filter
- Click **"Reset filters"** button to clear all active filters
- Click **"Done"** or press Escape to close the filter panel

### 2. Search Datasets

- Use the search box in the filter control bar to search datasets by name
- Search is case-insensitive and filters results in real-time
- Click the clear button (×) in the search box to reset search
- Search works in combination with active filters

### 3. Select Datasets

- **Select individual datasets**: Click on video cards to select/deselect them
- **Batch selection**: Click **"Select all datasets"** to select all filtered items
- **Clear selection**: Click **"Deselect all datasets"** to clear all selections
- Selected cards are highlighted with a border and checkmark
- View selection count in the filter control bar

### 4. Manage Batch Download Cart

- **Add to cart**: Selected datasets are shown in the right-side **"Batch Downloader"** panel
- **View cart**: The selection panel displays all items in your download cart
- **Remove items**: Click the remove button (×) on individual items in the cart
- **Cart counter**: See total number of items in cart at the bottom of the panel

### 5. Export Download Commands

1. **Select Hub source**: Use the hub switcher button to toggle between **HuggingFace** and **ModelScope**
2. **Review command**: The download command is automatically generated in the code output area
3. **Copy command**: Click **"Copy & Checkout"** button to copy the command to clipboard
4. **Execute**: Paste and run the command in your terminal to download datasets
5. **Custom path**: Add `--target-dir YOUR_DOWNLOAD_DIR` to specify a custom download directory

### 6. Import/Export Selections

- **Export JSON**: Click **"Export JSON"** to save your current selection list as a JSON file
- **Import JSON**: Click **"Import JSON"** to load a previously saved selection list
- This allows you to save and share your dataset selections across sessions

### 7. View Dataset Details

- **Hover preview**: Hover over a video card to see basic information overlay
- **Video preview**: Videos automatically play on hover
- **Detailed view**: Click on a video card or use toolbar buttons to open the detail modal
- **Dataset information**: View complete metadata including scenes, actions, objects, robot models, etc.

## Contributing

Issues and Pull Requests are welcome!

## Contact

For any questions, please contact pykerogers@outlook.com
