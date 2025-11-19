/**
 * @file Configuration Manager Module
 * @description Centralized configuration management for the RoboCOIN application
 */

/**
 * @typedef {Object} GridConfig
 * @property {number} minCardWidth - Minimum card width in pixels
 * @property {number} cardHeight - Card height in pixels
 * @property {number} gap - Gap between grid items
 * @property {number} columns - Number of columns
 * @property {number} bufferRows - Buffer rows for virtual scrolling
 * @property {number} padding - Grid padding
 */

/**
 * @typedef {Object} SelectionConfig
 * @property {number} itemHeight - Selection item height
 * @property {number} padding - Selection item padding
 * @property {number} bufferItems - Buffer items for virtual scrolling
 */

/**
 * @typedef {Object} ObserverConfig
 * @property {number} margin - Observer margin
 * @property {number} threshold - Observer threshold
 */

/**
 * @typedef {Object} TimingConfig
 * @property {number} hoverDelay - Hover delay in ms
 * @property {number} resizeDebounce - Resize debounce in ms
 * @property {number} scrollThrottle - Scroll throttle in ms
 * @property {number} transitionDuration - Transition duration in ms
 * @property {number} fadeDuration - Fade duration in ms
 */

/**
 * @typedef {Object} PathsConfig
 * @property {string} assetsRoot - Root path for assets
 * @property {string} info - Path for info JSON files
 * @property {string} datasetInfo - Path for dataset info files
 * @property {string} videos - Path for video files
 */

/**
 * @typedef {Object} DownloadCommandConfig
 * @property {string} command - Download command name (e.g., 'robocoin-download')
 * @property {string} hubParam - Hub parameter name (e.g., '--hub')
 * @property {string} datasetsParam - Datasets list parameter name (e.g., '--ds_lists')
 * @property {string} targetDirParam - Target directory parameter name (e.g., '--target-dir')
 * @property {string} lineContinuation - Line continuation character (e.g., ' \\')
 * @property {string} lineBreak - Line break character (e.g., '\n')
 * @property {string} datasetSeparator - Separator between datasets in the list
 */

/**
 * @typedef {Object} AppConfig
 * @property {Object} layout - Layout configuration
 * @property {GridConfig} grid - Grid configuration
 * @property {SelectionConfig} selection - Selection panel configuration
 * @property {ObserverConfig} observer - Intersection observer configuration
 * @property {Object} badge - Badge configuration
 * @property {TimingConfig} timing - Timing configuration
 * @property {Object} preview - Preview card configuration
 * @property {Object} ui - UI element configuration
 * @property {Object} loading - Loading configuration
 * @property {PathsConfig} paths - Path configuration
 * @property {DownloadCommandConfig} downloadCommand - Download command configuration
 */

/**
 * Configuration Manager
 * Reads configuration values from CSS variables and provides type-safe access
 */
class ConfigManager {
    /**
     * Get a CSS variable value with fallback
     * @param {string} propertyName - CSS variable name (with or without --)
     * @param {*} defaultValue - Default value if CSS variable not found
     * @returns {string|number} - Parsed value
     */
    static getCSSValue(propertyName, defaultValue = null) {
        const value = getComputedStyle(document.documentElement)
            .getPropertyValue(propertyName)
            .trim();
        
        if (!value && defaultValue !== null) {
            return defaultValue;
        }
        
        // Handle values with units (px, ms, s)
        if (value.endsWith('px') || value.endsWith('ms') || value.endsWith('s')) {
            return parseFloat(value);
        }
        // Handle decimal values
        if (value.includes('.')) {
            return parseFloat(value);
        }
        // Handle integer values
        if (!isNaN(value)) {
            return parseInt(value, 10);
        }
        return value || defaultValue;
    }

    /**
     * Get complete application configuration
     * @returns {AppConfig} Complete configuration object
     */
    static getConfig() {
        return {
            layout: {
                contentPadding: this.getCSSValue('--content-padding', 12)
            },
            grid: {
                minCardWidth: this.getCSSValue('--grid-min-card-width', 180),
                cardHeight: this.getCSSValue('--grid-card-height', 300),
                gap: this.getCSSValue('--grid-gap', 16),
                columns: this.getCSSValue('--grid-columns', 4),
                bufferRows: this.getCSSValue('--grid-buffer-rows', 2),
                padding: this.getCSSValue('--grid-padding', 12)
            },
            selection: {
                itemHeight: this.getCSSValue('--selection-item-height', 45),
                padding: this.getCSSValue('--selection-item-padding', 16),
                bufferItems: this.getCSSValue('--selection-buffer-items', 20)
            },
            observer: {
                margin: this.getCSSValue('--video-observer-margin', 200),
                threshold: this.getCSSValue('--video-observer-threshold', 0.1)
            },
            badge: {
                size: this.getCSSValue('--badge-size', 24),
                margin: this.getCSSValue('--badge-margin', 8)
            },
            timing: {
                hoverDelay: this.getCSSValue('--hover-delay', 500),
                resizeDebounce: this.getCSSValue('--resize-debounce', 200),
                scrollThrottle: this.getCSSValue('--scroll-throttle', 16),
                transitionDuration: this.getCSSValue('--transition-duration', 200),
                fadeDuration: this.getCSSValue('--fade-duration', 300)
            },
            preview: {
                maxWidth: this.getCSSValue('--preview-card-max-width', 320),
                minWidth: this.getCSSValue('--preview-card-min-width', 240),
                padding: this.getCSSValue('--preview-card-padding', 16),
                offset: this.getCSSValue('--preview-card-offset', 8)
            },
            ui: {
                buttonSize: this.getCSSValue('--button-size', 32),
                iconSize: this.getCSSValue('--icon-size', 16),
                borderRadius: this.getCSSValue('--border-radius', 4)
            },
            loading: {
                batchSize: this.getCSSValue('--loading-batch-size', 150)
            },
            // Standard directory structure:
            // ./assets/
            //   ├── info/               - JSON index files (data_index.json, consolidated_datasets.json)
            //   ├── dataset_info/       - YAML metadata files (one per dataset)
            //   └── videos/             - MP4 video files (named by dataset path)
            paths: {
                assetsRoot: './assets',
                info: './assets/info',  // JSON index files following standard structure
                get datasetInfo() {
                    return `${this.assetsRoot}/dataset_info`;
                },
                get videos() {
                    return `${this.assetsRoot}/videos`;
                }
            },
            // Download command format configuration
            // Modify these values to change the download command format
            downloadCommand: {
                command: 'robocoin-download',
                hubParam: '--hub',
                datasetsParam: '--ds_lists',
                targetDirParam: '--target-dir',
                lineContinuation: ' \\',
                lineBreak: '\n',
                datasetSeparator: ' \\\n',
                // Comment text for download path instructions
                defaultPathComment: '# the default download path is ~/.cache/huggingface/lerobot/, if you want to speicifiy download dir, please add',
                targetDirComment: '# --target-dir YOUR_DOWNLOAD_DIR'
            }
        };
    }

    /**
     * Generate download command string
     * @param {string} hub - Hub name (e.g., 'modelscope', 'huggingface')
     * @param {string[]} datasets - Array of dataset paths
     * @returns {string} Generated download command
     */
    static generateDownloadCommand(hub, datasets) {
        const config = this.getConfig().downloadCommand;
        
        // Format: robocoin-download \
        let command = `${config.command}${config.lineContinuation}${config.lineBreak}`;
        
        // Format: --hub modelscope \
        command += `${config.hubParam} ${hub}${config.lineContinuation}${config.lineBreak}`;
        
        // Format: --ds_lists + each dataset on new line with continuation
        command += `${config.datasetsParam} `;
        if (datasets.length > 0) {
            const dsListContent = datasets.join(config.datasetSeparator);
            command += `${dsListContent}${config.lineBreak}`;
        } else {
            command += `${config.lineBreak}`;
        }
        
        // Add comments about download path (directly after command, no blank line)
        command += `${config.defaultPathComment}${config.lineBreak}`;
        command += `${config.targetDirComment}`;
        
        return command;
    }
}

// Export the ConfigManager
export default ConfigManager;
export { ConfigManager };

