/**
 * @file HTML Templates Module
 * @description Contains all HTML template generation functions for the RoboCOIN application
 */

/// <reference path="./types.js" />

const Templates = {
    /**
     * Filter Group Templates
     */

    /**
     * Build flat filter group HTML
     * @param {string} key - Filter key
     * @param {FilterGroup} group - Filter group
     * @param {number} baseIndent - Base indentation
     * @returns {string} HTML string
     */
    buildFlatFilterGroup(key, group, baseIndent) {
        return `
            <div class="filter-option-wrapper" data-level="0">
                <div class="filter-option hierarchy-name-only" data-group-key="${key}">
                    <div class="filter-option-label">
                        <span class="hierarchy-label">${group.title}</span>
                    </div>
                    <div class="hierarchy-actions">
                        <button class="hierarchy-action-btn select-all" data-group="${key}" data-action="select-all" title="Select all in ${group.title}">All</button>
                        <button class="hierarchy-action-btn clear-all" data-group="${key}" data-action="clear-group" title="Clear ${group.title}">✕ Clear</button>
                    </div>
                </div>
                <div class="filter-children collapsed" data-group="${key}">
                    ${Array.from(group.values).sort().map(val => this.buildFlatFilterOption(key, val, baseIndent)).join('')}
                </div>
            </div>
        `;
    },

    /**
     * Build flat filter option HTML
     * @param {string} key - Filter key
     * @param {string} val - Filter value
     * @param {number} baseIndent - Base indentation
     * @returns {string} HTML string
     */
    buildFlatFilterOption(key, val, baseIndent) {
        return `
            <div class="filter-option-wrapper" style="margin-left: ${baseIndent}px;" data-level="1">
                <div class="filter-option" data-filter="${key}" data-value="${val}">
                    <div class="filter-option-label">
                        <span>${val}</span>
                    </div>
                    <div class="filter-option-count" data-count="${key}-${val}">0</div>
                </div>
            </div>
        `;
    },

    /**
     * Build hierarchical filter group HTML
     * @param {string} key - Filter key
     * @param {FilterGroup} group - Filter group
     * @param {Function} buildHierarchyHTML - Function to build hierarchy HTML
     * @returns {string} HTML string
     */
    buildHierarchicalFilterGroup(key, group, buildHierarchyHTML) {
        return `
            <div class="filter-option-wrapper" data-level="0">
                <div class="filter-option hierarchy-name-only" data-group-key="${key}">
                    <div class="filter-option-label">
                        <span class="hierarchy-label">${group.title}</span>
                    </div>
                    <div class="hierarchy-actions">
                        <button class="hierarchy-action-btn select-all" data-group="${key}" data-action="select-all" title="Select all in ${group.title}">All</button>
                        <button class="hierarchy-action-btn clear-all" data-group="${key}" data-action="clear-group" title="Clear ${group.title}">✕ Clear</button>
                    </div>
                </div>
                <div class="filter-children collapsed" data-group="${key}">
                    ${buildHierarchyHTML(group.values)}
                </div>
            </div>
        `;
    },

    buildHierarchyOption(key, value, fullPath, hasChildren, level, baseIndent, childrenHTML = '') {
        const indent = baseIndent;

        if (hasChildren) {
            return `
                <div class="filter-option-wrapper" style="margin-left: ${indent}px;" data-level="${level}">
                    <div class="filter-option hierarchy-name-only" data-path="${fullPath}">
                        <div class="filter-option-label">
                            <span class="hierarchy-label">${value}</span>
                        </div>
                        <div class="hierarchy-actions">
                            <button class="hierarchy-action-btn select-all" data-key="${key}" data-path="${fullPath}" data-action="select-all-children" title="Select all children">All</button>
                            <button class="hierarchy-action-btn clear-all" data-key="${key}" data-path="${fullPath}" data-action="clear-all-children" title="Clear all children">✕ Clear</button>
                        </div>
                    </div>
                    <div class="filter-children collapsed">
                        ${childrenHTML}
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="filter-option-wrapper" style="margin-left: ${indent}px;" data-level="${level}">
                    <div class="filter-option" data-filter="${key}" data-value="${value}">
                        <div class="filter-option-label">
                            <span>${value}</span>
                        </div>
                        <div class="filter-option-count" data-count="${key}-${fullPath}">0</div>
                    </div>
                </div>
            `;
        }
    },

    /**
     * Video Card Templates
     */

    /**
     * Build video card HTML
     * @param {Dataset} ds - Dataset object
     * @param {Function} formatMetaTags - Function to format meta tags
     * @param {Function} formatHoverOverlay - Function to format hover overlay
     * @param {Set<string>} listDatasets - Set of dataset paths in cart
     * @returns {string} HTML string
     */
    buildVideoCard(ds, formatMetaTags, formatHoverOverlay, listDatasets) {
        return `
            <div class="video-thumbnail" data-video-url="${ds.video_url}">
                <img src="${ds.thumbnail_url}" 
                     alt="${ds.name}" 
                     class="thumbnail-image"
                     loading="lazy"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <div class="video-error" style="display:none;">No Thumbnail</div>
                <div class="play-indicator" style="display:none;">▶</div>
                ${listDatasets.has(ds.path) ? '<div class="video-success-badge">✓</div>' : ''}
            </div>
            <div class="video-info">
                <div class="video-title">${ds.name}</div>
                <div class="video-tags">${formatMetaTags(ds)}</div>
            </div>
            <div class="video-hover-overlay">${formatHoverOverlay(ds)}</div>
        `;
    },

    buildVideoTag(text, more = '') {
        const moreHtml = more ? `<sup class="tag-count">${more}</sup>` : '';
        return `<span class="video-tag"><span class="tag-text">${text}</span>${moreHtml}</span>`;
    },

    buildVideoErrorBadge() {
        return '<div class="video-error" style="display:none;">No Video</div>';
    },

    buildVideoSuccessBadge() {
        return '<div class="video-success-badge">✓</div>';
    },

    /**
     * Hover Overlay Templates
     */
    buildHoverOverlay(ds) {
        let html = `<div class="hover-title">${ds.name}</div>`;

        // Scene information
        if (ds.scenes && ds.scenes.length > 0) {
            html += this.buildHoverInfoGroup('scene', ds.scenes.map(s => this.buildHoverTag(s)).join(''));
        }

        // Robot model
        if (ds.robot) {
            const robots = Array.isArray(ds.robot) ? ds.robot : [ds.robot];
            html += this.buildHoverInfoGroup('robot', robots.map(r => this.buildHoverTag(r)).join(''));
        }

        // End effector
        if (ds.endEffector) {
            html += this.buildHoverInfoGroup('end effector', this.buildHoverTag(ds.endEffector));
        }

        // Actions
        if (ds.actions && ds.actions.length > 0) {
            html += this.buildHoverInfoGroup(`action(${ds.actions.length})`, ds.actions.map(a => this.buildHoverTag(a)).join(''));
        }

        // Objects
        if (ds.objects && ds.objects.length > 0) {
            const objectChains = ds.objects.map(obj => obj.hierarchy.join(' → '));
            html += this.buildHoverInfoGroup(
                `operation object(${ds.objects.length})`,
                objectChains.map(chain => this.buildHoverTag(chain)).join('')
            );
        }

        // Description
        if (ds.description) {
            html += this.buildHoverInfoGroup('discription', ds.description, false);
        }

        return html;
    },

    buildHoverInfoGroup(label, content, useTags = true) {
        return `
            <div class="hover-info-group">
                <div class="hover-info-label">${label}</div>
                <div class="hover-info-content${useTags ? ' tags' : ''}">${content}</div>
            </div>
        `;
    },

    buildHoverTag(text) {
        return `<span class="hover-tag">${text}</span>`;
    },

    /**
     * Selection Panel Templates
     */
    buildEmptyCartHint() {
        return `
            <div class="empty-cart-hint">
                <div class="hint-title">🛒 <strong>Your cart is empty</strong> 💭</div>
                <div class="hint-subtitle">👋 ✨ <strong>Quick Start Guide:</strong> 🚀</div>
                <div class="hint-steps">
                    ${this.buildHintStep(1, '🔍 Filter datasets (left panel)')}
                    ${this.buildHintArrow()}
                    ${this.buildHintStep(2, '✅ Select items (click cards or "select all")')}
                    ${this.buildHintArrow()}
                    ${this.buildHintStep(3, '🎯 Add to cart (green button)')}
                    ${this.buildHintArrow()}
                    ${this.buildHintStep(4, '📋 Review & manage (view/remove items)')}
                    ${this.buildHintArrow()}
                    ${this.buildHintStep(5, '📦 Choose source & copy download code!')}
                </div>
            </div>
        `;
    },

    buildHintStep(number, text) {
        return `
            <div class="hint-step">
                <span class="step-number">${number}</span>
                <span class="step-text">${text}</span>
            </div>
        `;
    },

    buildHintArrow() {
        return '<div class="hint-arrow">↓</div>';
    },

    buildSelectionItem(ds) {
        return `
            <div class="selection-item-name">${ds.name}</div>
            <button class="btn-detail" data-path="${ds.path}" title="View details">...</button>
            <button class="btn-remove" data-path="${ds.path}">×</button>
        `;
    },

    /**
     * Detail Modal Templates
     */
    buildDetailModal(dataset) {
        const scenesText = Array.isArray(dataset.scenes) && dataset.scenes.length > 0
            ? dataset.scenes.join(', ')
            : 'N/A';

        const actionsText = Array.isArray(dataset.actions) && dataset.actions.length > 0
            ? dataset.actions.join(', ')
            : 'N/A';

        let objectsHTML = 'N/A';
        if (Array.isArray(dataset.objects) && dataset.objects.length > 0) {
            objectsHTML = dataset.objects.map(obj => {
                const hierarchyText = obj.hierarchy.join(' > ');
                return `<div style="margin-bottom: 4px;">• ${obj.name} (${hierarchyText})</div>`;
            }).join('');
        }

        return `
            <div class="detail-modal">
                <div class="detail-modal-header">
                    <h3 class="detail-modal-title">${dataset.name}</h3>
                    <button class="detail-modal-close">×</button>
                </div>
                <div class="detail-modal-body">
                    ${this.buildDetailVideo(dataset.video_url)}
                    ${this.buildDetailInfoGrid(dataset, scenesText, actionsText, objectsHTML)}
                </div>
            </div>
        `;
    },

    buildDetailVideo(videoUrl) {
        return `
            <div class="detail-video-container">
                <video autoplay loop muted playsinline preload="auto">
                    <source src="${videoUrl}" type="video/mp4">
                    <div class="video-error">Video not found</div>
                </video>
            </div>
        `;
    },

    buildDetailInfoGrid(dataset, scenesText, actionsText, objectsHTML) {
        return `
            <div class="detail-info-grid">
                ${this.buildDetailInfoItem('Dataset Path', dataset.path)}
                ${this.buildDetailInfoItem('Dataset Name', dataset.name)}
                ${this.buildDetailInfoItem('Task Description', dataset.description || 'N/A')}
                ${this.buildDetailInfoItem('Device Model (Robot)', dataset.robot || 'N/A')}
                ${this.buildDetailInfoItem('End Effector Type', dataset.endEffector || 'N/A')}
                ${this.buildDetailInfoItem('Operation Platform Height', dataset.platformHeight !== undefined ? dataset.platformHeight : 'N/A')}
                ${this.buildDetailInfoItem('Scene Type', scenesText)}
                ${this.buildDetailInfoItem('Atomic Actions', actionsText)}
                ${this.buildDetailInfoItem('Operation Objects', objectsHTML)}
            </div>
        `;
    },

    buildDetailInfoItem(label, value) {
        return `
            <div class="detail-info-item">
                <div class="detail-info-label">${label}</div>
                <div class="detail-info-value">${value}</div>
            </div>
        `;
    },

    /**
     * Hover Preview Templates
     */
    buildHoverPreview(dataset) {
        const sceneText = Array.isArray(dataset.scenes) && dataset.scenes.length > 0
            ? dataset.scenes.slice(0, 2).join(', ') + (dataset.scenes.length > 2 ? '...' : '')
            : 'N/A';

        const actionText = Array.isArray(dataset.actions) && dataset.actions.length > 0
            ? dataset.actions.slice(0, 2).join(', ') + (dataset.actions.length > 2 ? '...' : '')
            : 'N/A';

        const robotText = dataset.robot || 'N/A';

        return `
            <div class="hover-preview-video">
                <video src="${dataset.video_url}" autoplay loop muted preload="auto"></video>
            </div>
            <div class="hover-preview-info">
                <div class="hover-preview-title">${dataset.name}</div>
                <div class="hover-preview-meta">
                    ${this.buildHoverPreviewMetaItem('Robot', robotText)}
                    ${this.buildHoverPreviewMetaItem('Scene', sceneText)}
                    ${this.buildHoverPreviewMetaItem('Action', actionText)}
                </div>
            </div>
        `;
    },

    buildHoverPreviewMetaItem(label, value) {
        return `<div class="hover-preview-meta-item"><strong>${label}:</strong> ${value}</div>`;
    }
};

export default Templates;

