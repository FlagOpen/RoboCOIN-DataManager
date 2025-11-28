/**
 * @file Filter Renderer
 * @description Responsible only for rendering filter UI (sidebar + options) and wiring DOM events.
 */

/// <reference path="../types.js" />

import ConfigManager from '../config.js';
import Templates from '../../templates.js';
import { qs, setHTML, removeClass, toggleClass } from '../dom-utils.js';

/**
 * @typedef {import('./filter-manager.js').FilterManager} FilterManager
 */

export class FilterRenderer {
    /**
     * @param {FilterManager} manager - Owning FilterManager instance
     */
    constructor(manager) {
        this.manager = manager;
    }

    /**
     * Render top-level filter UI (sidebar + placeholder) and select default category.
     */
    renderFilterGroups() {
        // Render categories sidebar
        this.renderCategoriesSidebar();

        // Render options content (initially empty, will be populated when category is selected)
        const container = qs('#filterGroups');
        setHTML(
            container,
            '<div class="filter-options-placeholder">Select a category from the left to view options</div>'
        );

        // Auto-select first category
        this.manager.selectCategory('scene');
    }

    /**
     * Render categories sidebar.
     */
    renderCategoriesSidebar() {
        const sidebar = qs('#filterCategoriesSidebar');
        if (!sidebar) return;

        setHTML(sidebar, '');

        // Define category display names and order
        const categoryOrder = ['frame range', 'scene', 'robot', 'end', 'action', 'object'];
        const categoryLabels = {
            'frame range': 'Frame Range',
            'scene': 'Scene',
            'robot': 'Robot Model',
            'end': 'End Effector',
            'action': 'Action',
            'object': 'Operation Object'
        };

        categoryOrder.forEach(key => {
            const group = this.manager.filterGroups[key];
            if (!group) return;

            const categoryBtn = document.createElement('div');
            categoryBtn.className = 'filter-category-btn';
            categoryBtn.dataset.category = key;

            const count = this.manager.getCategoryItemCount(key);
            categoryBtn.innerHTML = `
                <span class="category-label">${categoryLabels[key]}</span>
                <span class="category-count">${count}</span>
            `;

            categoryBtn.addEventListener('click', () => {
                this.manager.selectCategory(key);
            });

            sidebar.appendChild(categoryBtn);
        });
    }

    /**
     * Render category options in the right panel.
     * @param {string} categoryKey - The category key
     */
    renderCategoryOptions(categoryKey) {
        const container = qs('#filterGroups');
        if (!container) return;

        const group = this.manager.filterGroups[categoryKey];
        if (!group) return;

        setHTML(container, '');

        const div = document.createElement('div');
        div.className = 'filter-group';

        if (group.type === 'flat') {
            div.innerHTML = this.buildFlatFilterGroup(categoryKey, group);
        } else if (group.type === 'hierarchical') {
            div.innerHTML = this.buildHierarchicalFilterGroup(categoryKey, group);
        }

        container.appendChild(div);

        // Add click handlers for filter options
        requestAnimationFrame(() => {
            // Open the group by default
            const topLevelTitle = div.querySelector(
                '.filter-option-wrapper[data-level="0"] > .filter-option.hierarchy-name-only'
            );
            if (topLevelTitle) {
                const wrapper = topLevelTitle.closest('.filter-option-wrapper');
                const children = wrapper?.querySelector('.filter-children');
                if (children) {
                    removeClass(children, 'collapsed');
                }
            }

            const filterOptionsElements = div.querySelectorAll('.filter-option');
            filterOptionsElements.forEach(option => {
                // Handle hierarchy parent nodes (expand/collapse)
                if (option.classList.contains('hierarchy-name-only')) {
                    // Click on hierarchy item (not actions) -> expand/collapse
                    option.addEventListener('click', (e) => {
                        // Don't handle if clicking on action buttons
                        if (e.target.closest('.hierarchy-action-btn')) {
                            return;
                        }
                        // Expand/collapse children
                        const wrapper = option.closest('.filter-option-wrapper');
                        if (!wrapper) return;
                        const children = wrapper.querySelector('.filter-children');
                        if (children) {
                            toggleClass(children, 'collapsed');
                            // After expanding, apply selected states to newly visible options
                            if (!children.classList.contains('collapsed')) {
                                this.manager.applySelectedStylesToContainer(children);
                            }
                        }
                    });
                    return;
                }

                const filterKey = option.dataset.filter;
                const filterValue = option.dataset.value;

                if (filterKey && filterValue) {
                    const filterId = `${filterKey}:${filterValue}`;
                    this.manager.filterOptionCache.set(filterId, option);

                    option.addEventListener('click', (e) => {
                        if (e.target.closest('.hierarchy-toggle')) {
                            return;
                        }

                        const label =
                            option.querySelector('.filter-option-label')?.textContent?.trim() || filterValue;
                        this.manager.toggleFilterSelection(filterKey, filterValue, label, option);
                    });
                }
            });

            // Apply selected states to already selected filters in this category
            this.manager.applySelectedStylesToCategory(categoryKey);
        });
    }

    /**
     * Build flat filter group HTML.
     * @param {string} key - Filter key
     * @param {FilterGroup} group - Filter group
     * @returns {string} HTML string
     */
    buildFlatFilterGroup(key, group) {
        const baseIndent = ConfigManager.getCSSValue('--hierarchy-indent', 4);
        return Templates.buildFlatFilterGroup(key, group, baseIndent);
    }

    /**
     * Build hierarchical filter group HTML.
     * @param {string} key - Filter key
     * @param {FilterGroup} group - Filter group
     * @returns {string} HTML string
     */
    buildHierarchicalFilterGroup(key, group) {
        const buildHierarchyHTML = (map, level = 1, parentPath = '') => {
            let html = '';
            const sortedEntries = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
            const baseIndent = ConfigManager.getCSSValue('--hierarchy-indent', 4);

            sortedEntries.forEach(([value, node]) => {
                const fullPath = parentPath ? `${parentPath}>${value}` : value;
                const hasChildren = node.children.size > 0;
                const childrenHTML = hasChildren ? buildHierarchyHTML(node.children, level + 1, fullPath) : '';

                html += Templates.buildHierarchyOption(
                    key,
                    value,
                    fullPath,
                    hasChildren,
                    level,
                    baseIndent,
                    childrenHTML
                );
            });

            return html;
        };

        return Templates.buildHierarchicalFilterGroup(key, group, buildHierarchyHTML);
    }
}

export default FilterRenderer;


