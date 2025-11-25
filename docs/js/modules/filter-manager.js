/**
 * @file Filter Manager Module
 * @description Manages dataset filtering, filter UI, and filter state
 */

/// <reference path="../types.js" />

import ConfigManager from './config.js';
import Templates from '../templates.js';

/**
 * Filter Manager Class
 * Manages all filtering operations and UI
 */
export class FilterManager {
    /**
     * @param {Dataset[]} datasets - All datasets
     */
    constructor(datasets) {
        this.datasets = datasets;

        /** @type {Object<string, FilterGroup>} */
        this.filterGroups = {};

        /** @type {Set<string>} */
        this.selectedFilters = new Set();

        /** @type {Map<string, HTMLElement>} */
        this.filterOptionCache = new Map();

        /** @type {number|null} */
        this.pendingFilterUpdate = null;

        // Filter Finder state
        this.filterFinderMatches = [];
        this.filterFinderCurrentIndex = -1;

        // Static count cache for UI display (only calculated once at initialization)
        this.staticFilterCounts = new Map();
    }

    /**
     * Build filter groups from datasets
     */
    buildFilterGroups() {
        const groups = {
            'scene': {
                title: 'scene',
                values: new Set(),
                type: 'flat'
            },
            'robot': {
                title: 'robot',
                values: new Set(),
                type: 'flat'
            },
            'end': {
                title: 'end effector',
                values: new Set(),
                type: 'flat'
            },
            'action': {
                title: 'action',
                values: new Set(),
                type: 'flat'
            },
            'object': {
                title: 'operation object',
                values: new Map(),
                type: 'hierarchical'
            }
        };

        // Collect all filter options
        this.datasets.forEach(ds => {
            // Flat multi-value fields
            if (ds.scenes) {
                ds.scenes.forEach(scene => groups.scene.values.add(scene));
            }
            if (ds.robot) {
                const robots = Array.isArray(ds.robot) ? ds.robot : [ds.robot];
                robots.forEach(r => groups.robot.values.add(r));
            }
            if (ds.endEffector) {
                groups.end.values.add(ds.endEffector);
            }
            if (ds.actions) {
                ds.actions.forEach(action => groups.action.values.add(action));
            }

            // Hierarchical object field
            if (ds.objects) {
                ds.objects.forEach(obj => {
                    this.addToHierarchy(groups.object.values, obj.hierarchy);
                });
            }
        });

        this.filterGroups = groups;

        // Render UI
        this.renderFilterGroups();
    }

    /**
     * Add object hierarchy to Map structure
     * @param {Map} hierarchyMap - Hierarchy map
     * @param {string[]} levels - Hierarchy levels
     */
    addToHierarchy(hierarchyMap, levels) {
        if (!levels || levels.length === 0) return;

        let current = hierarchyMap;
        levels.forEach((level, idx) => {
            if (!current.has(level)) {
                current.set(level, {
                    children: new Map(),
                    isLeaf: idx === levels.length - 1
                });
            }
            current = current.get(level).children;
        });
    }

    /**
     * Render filter groups to UI
     */
    renderFilterGroups() {
        // Render categories sidebar
        this.renderCategoriesSidebar();

        // Render options content (initially empty, will be populated when category is selected)
        const container = document.getElementById('filterGroups');
        if (container) {
            container.innerHTML = '<div class="filter-options-placeholder">Select a category from the left to view options</div>';
        }

        // Auto-select first category
        this.selectCategory('scene');
    }

    /**
     * Render categories sidebar
     */
    renderCategoriesSidebar() {
        const sidebar = document.getElementById('filterCategoriesSidebar');
        if (!sidebar) return;

        sidebar.innerHTML = '';

        // Define category display names and order
        const categoryOrder = ['scene', 'robot', 'end', 'action', 'object'];
        const categoryLabels = {
            'scene': 'Scene',
            'robot': 'Robot Model',
            'end': 'End Effector',
            'action': 'Action',
            'object': 'Operation Object'
        };

        categoryOrder.forEach(key => {
            const group = this.filterGroups[key];
            if (!group) return;

            const categoryBtn = document.createElement('div');
            categoryBtn.className = 'filter-category-btn';
            categoryBtn.dataset.category = key;

            const count = this.getCategoryItemCount(key);
            categoryBtn.innerHTML = `
                <span class="category-label">${categoryLabels[key]}</span>
                <span class="category-count">${count}</span>
            `;

            categoryBtn.addEventListener('click', () => {
                this.selectCategory(key);
            });

            sidebar.appendChild(categoryBtn);
        });
    }

    /**
     * Select a category and show its options in the right panel
     * @param {string} categoryKey - The category key to select
     */
    selectCategory(categoryKey) {
        // Update sidebar selection
        const sidebar = document.getElementById('filterCategoriesSidebar');
        if (sidebar) {
            sidebar.querySelectorAll('.filter-category-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            const selectedBtn = sidebar.querySelector(`[data-category="${categoryKey}"]`);
            if (selectedBtn) {
                selectedBtn.classList.add('selected');
            }
        }

        // Clear any active search when switching categories
        this.clearFilterSearch();

        // Render category options in right panel
        this.renderCategoryOptions(categoryKey);

        // Update filter counts when category is selected/opened
        this.updateStaticCountsForCategory(categoryKey);

        // Re-apply current search query if any
        const searchInput = document.getElementById('filterFinderInput');
        if (searchInput && searchInput.value.trim()) {
            this.searchFilterOptions(searchInput.value.trim());
        }
    }

    /**
     * Render category options in the right panel
     * @param {string} categoryKey - The category key
     */
    renderCategoryOptions(categoryKey) {
        const container = document.getElementById('filterGroups');
        if (!container) return;

        const group = this.filterGroups[categoryKey];
        if (!group) return;

        container.innerHTML = '';

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
            const topLevelTitle = div.querySelector('.filter-option-wrapper[data-level="0"] > .filter-option.hierarchy-name-only');
            if (topLevelTitle) {
                const wrapper = topLevelTitle.closest('.filter-option-wrapper');
                const children = wrapper?.querySelector('.filter-children');
                if (children) {
                    children.classList.remove('collapsed');
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
                            children.classList.toggle('collapsed');
                            // After expanding, apply selected states to newly visible options
                            if (!children.classList.contains('collapsed')) {
                                this.applySelectedStylesToContainer(children);
                            }
                        }
                    });
                    return;
                }

                const filterKey = option.dataset.filter;
                const filterValue = option.dataset.value;

                if (filterKey && filterValue) {
                    const filterId = `${filterKey}:${filterValue}`;
                    this.filterOptionCache.set(filterId, option);

                    option.addEventListener('click', (e) => {
                        if (e.target.closest('.hierarchy-toggle')) {
                            return;
                        }

                        const label = option.querySelector('.filter-option-label')?.textContent?.trim() || filterValue;
                        this.toggleFilterSelection(filterKey, filterValue, label, option);
                    });
                }
            });

            // Apply selected states to already selected filters in this category
            this.applySelectedStylesToCategory(categoryKey);
        });
    }

    /**
     * Get the count of items in a category
     * @param {string} categoryKey - The category key
     * @returns {number} Count of items
     */
    getCategoryItemCount(categoryKey) {
        const group = this.filterGroups[categoryKey];
        if (!group) return 0;

        if (group.type === 'flat') {
            return group.values.size;
        } else if (group.type === 'hierarchical') {
            return this.countHierarchyItems(group.values);
        }
        return 0;
    }

    /**
     * Count items in hierarchy recursively
     * @param {Map} hierarchyMap - Hierarchy map
     * @returns {number} Count of items
     */
    countHierarchyItems(hierarchyMap) {
        let count = 0;
        hierarchyMap.forEach(node => {
            if (node.children.size > 0) {
                count += this.countHierarchyItems(node.children);
            } else {
                count++;
            }
        });
        return count;
    }

    /**
     * Build flat filter group HTML
     * @param {string} key - Filter key
     * @param {FilterGroup} group - Filter group
     * @returns {string} HTML string
     */
    buildFlatFilterGroup(key, group) {
        const baseIndent = ConfigManager.getCSSValue('--hierarchy-indent', 4);
        return Templates.buildFlatFilterGroup(key, group, baseIndent);
    }

    /**
     * Build hierarchical filter group HTML
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

                html += Templates.buildHierarchyOption(key, value, fullPath, hasChildren, level, baseIndent, childrenHTML);
            });

            return html;
        };

        return Templates.buildHierarchicalFilterGroup(key, group, buildHierarchyHTML);
    }

    /**
     * Toggle filter selection
     * @param {string} filterKey - Filter key
     * @param {string} filterValue - Filter value
     * @param {string} filterLabel - Filter label
     * @param {HTMLElement} optionElement - Option element
     */
    toggleFilterSelection(filterKey, filterValue, filterLabel, optionElement) {
        const filterId = `${filterKey}:${filterValue}`;

        if (this.selectedFilters.has(filterId)) {
            this.selectedFilters.delete(filterId);
            if (optionElement) {
                optionElement.classList.remove('selected');
            }
            this.removeFilterTag(filterId);
        } else {
            this.selectedFilters.add(filterId);
            if (optionElement) {
                optionElement.classList.add('selected');
            }
            this.addFilterTag(filterId, filterLabel);
        }

        this.updateTriggerCount();
        this.scheduleFilterUpdate();
    }

    /**
     * Add filter tag to UI
     * @param {string} filterId - Filter ID
     * @param {string} filterLabel - Filter label
     */
    addFilterTag(filterId, filterLabel) {
        const container = document.getElementById('filterTagsContainer');
        if (!container) return;

        const [filterKey, filterValue] = filterId.split(':');
        const label = filterLabel || this.getFilterLabel(filterKey, filterValue);

        const tag = document.createElement('div');
        tag.className = 'filter-tag';
        tag.dataset.filterId = filterId;
        tag.innerHTML = `
            <span class="filter-tag-text">${label}</span>
            <button class="filter-tag-close" data-filter-id="${filterId}">✕</button>
        `;

        const closeBtn = tag.querySelector('.filter-tag-close');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeFilterTagById(filterId);
        });

        container.appendChild(tag);
    }

    /**
     * Remove filter tag from UI
     * @param {string} filterId - Filter ID
     */
    removeFilterTag(filterId) {
        const container = document.getElementById('filterTagsContainer');
        if (!container) return;

        const tag = container.querySelector(`.filter-tag[data-filter-id="${filterId}"]`);
        if (tag) {
            tag.remove();
        }
    }

    /**
     * Remove filter by tag click
     * @param {string} filterId - Filter ID
     */
    removeFilterTagById(filterId) {
        this.selectedFilters.delete(filterId);

        const option = this.filterOptionCache.get(filterId);
        if (option) {
            option.classList.remove('selected');
        }

        this.removeFilterTag(filterId);
        this.updateTriggerCount();
        this.scheduleFilterUpdate();
    }

    /**
     * Render all filter tags
     */
    renderFilterTags() {
        const container = document.getElementById('filterTagsContainer');
        if (!container) return;

        container.innerHTML = '';

        if (this.selectedFilters.size === 0) {
            return;
        }

        this.selectedFilters.forEach(filterId => {
            const [filterKey, filterValue] = filterId.split(':');
            const filterLabel = this.getFilterLabel(filterKey, filterValue);
            this.addFilterTag(filterId, filterLabel);
        });
    }

    /**
     * Update trigger count badge
     */
    updateTriggerCount() {
        const countEl = document.getElementById('filterTriggerCount');
        if (!countEl) return;

        if (this.selectedFilters.size > 0) {
            countEl.textContent = this.selectedFilters.size;
        } else {
            countEl.textContent = '';
        }
    }

    /**
     * Update filter option styles
     */
    updateFilterOptionStyles() {
        this.filterOptionCache.forEach((element, filterId) => {
            if (this.selectedFilters.has(filterId)) {
                element.classList.add('selected');
            } else {
                element.classList.remove('selected');
            }
        });
    }

    /**
     * Apply selected styles to all options in a specific category
     * @param {string} categoryKey - The category key
     */
    applySelectedStylesToCategory(categoryKey) {
        this.selectedFilters.forEach(filterId => {
            if (filterId.startsWith(`${categoryKey}:`)) {
                const option = this.filterOptionCache.get(filterId);
                if (option) {
                    option.classList.add('selected');
                }
            }
        });
    }

    /**
     * Apply selected styles to all options within a container (including nested)
     * @param {HTMLElement} container - The container element
     */
    applySelectedStylesToContainer(container) {
        if (!container) return;
        
        const options = container.querySelectorAll('.filter-option[data-filter][data-value]');
        options.forEach(option => {
            const filterKey = option.dataset.filter;
            const filterValue = option.dataset.value;
            if (filterKey && filterValue) {
                const filterId = `${filterKey}:${filterValue}`;
                if (this.selectedFilters.has(filterId)) {
                    option.classList.add('selected');
                }
            }
        });
    }

    /**
     * Get human-readable filter label
     * @param {string} filterKey - Filter key
     * @param {string} filterValue - Filter value
     * @returns {string} Filter label
     */
    getFilterLabel(filterKey, filterValue) {
        const keyLabels = {
            'scene': 'Scene',
            'robot': 'Robot',
            'end': 'End Effector',
            'action': 'Action',
            'object': 'Object'
        };

        const keyLabel = keyLabels[filterKey] || filterKey;
        return `${keyLabel}: ${filterValue}`;
    }

    /**
     * Schedule filter update (debounced)
     */
    scheduleFilterUpdate() {
        if (this.pendingFilterUpdate) {
            clearTimeout(this.pendingFilterUpdate);
        }

        this.pendingFilterUpdate = setTimeout(() => {
            // Trigger filter update event
            document.dispatchEvent(new CustomEvent('filtersChanged'));
            this.pendingFilterUpdate = null;
        }, 150);
    }

    /**
     * Apply filters to datasets
     * @param {string} searchQuery - Search query
     * @returns {Dataset[]} Filtered datasets
     */
    applyFilters(searchQuery = '') {
        const filters = {};

        // Collect selected filters
        this.selectedFilters.forEach(filterId => {
            const [key, value] = filterId.split(':');
            if (!filters[key]) filters[key] = [];
            filters[key].push(value);
        });

        const filtered = this.datasets.filter(ds => {
            if (searchQuery && !ds.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            for (const [key, values] of Object.entries(filters)) {
                let match = false;

                if (key === 'scene') {
                    match = ds.scenes && ds.scenes.some(v => values.includes(v));
                } else if (key === 'robot') {
                    const robots = Array.isArray(ds.robot) ? ds.robot : [ds.robot];
                    match = robots.some(r => values.includes(r));
                } else if (key === 'end') {
                    match = values.includes(ds.endEffector);
                } else if (key === 'action') {
                    match = ds.actions && ds.actions.some(a => values.includes(a));
                } else if (key === 'object') {
                    match = ds.objects && ds.objects.some(obj =>
                        obj.hierarchy.some(h => values.includes(h))
                    );
                }

                if (!match) return false;
            }

            return true;
        });

        return filtered;
    }

    /**
     * Reset all filters
     */
    resetFilters() {
        if (this.pendingFilterUpdate) {
            clearTimeout(this.pendingFilterUpdate);
            this.pendingFilterUpdate = null;
        }

        this.selectedFilters.clear();
        this.updateFilterOptionStyles();

        const container = document.getElementById('filterTagsContainer');
        if (container) {
            container.innerHTML = '';
        }

        this.updateTriggerCount();
        this.scheduleFilterUpdate();
        // Reset should also trigger re-render because it changed the video-grid height

    }

    /**
     * Search filter options (Filter Finder)
     * @param {string} query - Search query
     */
    searchFilterOptions(query) {
        this.clearFilterSearch();

        // Only search in the options content (right panel), not in sidebar categories
        const filterContent = document.getElementById('filterGroups');
        if (!filterContent) return;

        const allOptions = filterContent.querySelectorAll('.filter-option');
        const allWrappers = filterContent.querySelectorAll('.filter-option-wrapper');
        this.filterFinderMatches = [];

        if (!query) {
            // Show all options when query is empty
            allWrappers.forEach(wrapper => {
                wrapper.classList.remove('filter-search-hidden');
            });
            this.updateFilterFinderUI();
            return;
        }

        const queryLower = query.toLowerCase();

        // First pass: find all matching options
        allOptions.forEach(option => {
            const labelElement = option.querySelector('.filter-option-label, .hierarchy-label');
            if (!labelElement) return;

            const text = labelElement.textContent.trim();
            const matches = text.toLowerCase().includes(queryLower);

            if (matches) {
                option.classList.add('highlight-match');
                this.filterFinderMatches.push({
                    element: option,
                    text: text,
                    wrapper: option.closest('.filter-option-wrapper')
                });
            }
        });

        // Second pass: hide/show wrappers based on matches
        // Show wrapper if it or any of its descendants match
        allWrappers.forEach(wrapper => {
            const hasMatch = wrapper.querySelector('.highlight-match') !== null;
            const hasMatchingDescendant = Array.from(wrapper.querySelectorAll('.filter-option-wrapper')).some(
                child => child.querySelector('.highlight-match') !== null
            );

            if (hasMatch || hasMatchingDescendant) {
                wrapper.classList.remove('filter-search-hidden');
                // Expand parent collapsed items to show matches
                let parent = wrapper.parentElement?.closest('.filter-children');
                while (parent) {
                    if (parent.classList.contains('collapsed')) {
                        parent.classList.remove('collapsed');
                    }
                    parent = parent.parentElement?.closest('.filter-children');
                }
                // Expand filter group
                const filterGroup = wrapper.closest('.filter-group');
                if (filterGroup && filterGroup.classList.contains('collapsed')) {
                    filterGroup.classList.remove('collapsed');
                }
            } else {
                // Hide wrapper if it doesn't match and has no matching descendants
                wrapper.classList.add('filter-search-hidden');
            }
        });

        if (this.filterFinderMatches.length > 0) {
            this.filterFinderCurrentIndex = 0;
            this.highlightCurrentMatch();
        }

        this.updateFilterFinderUI();
    }

    /**
     * Navigate to next/previous match
     * @param {string} direction - 'next' or 'prev'
     */
    navigateFilterMatch(direction) {
        if (this.filterFinderMatches.length === 0) return;

        if (this.filterFinderCurrentIndex >= 0 && this.filterFinderCurrentIndex < this.filterFinderMatches.length) {
            this.filterFinderMatches[this.filterFinderCurrentIndex].element.classList.remove('current-match');
        }

        if (direction === 'next') {
            this.filterFinderCurrentIndex = (this.filterFinderCurrentIndex + 1) % this.filterFinderMatches.length;
        } else {
            this.filterFinderCurrentIndex = (this.filterFinderCurrentIndex - 1 + this.filterFinderMatches.length) % this.filterFinderMatches.length;
        }

        this.highlightCurrentMatch();
        this.updateFilterFinderUI();
    }

    /**
     * Highlight current match
     */
    highlightCurrentMatch() {
        if (this.filterFinderCurrentIndex < 0 || this.filterFinderCurrentIndex >= this.filterFinderMatches.length) {
            return;
        }

        const match = this.filterFinderMatches[this.filterFinderCurrentIndex];
        const option = match.element;

        option.classList.add('current-match');

        // Expand all parent collapsed items
        let parent = option.closest('.filter-children');
        while (parent) {
            if (parent.classList.contains('collapsed')) {
                parent.classList.remove('collapsed');
            }
            parent = parent.parentElement?.closest('.filter-children');
        }

        // Expand filter group
        const filterGroup = option.closest('.filter-group');
        if (filterGroup && filterGroup.classList.contains('collapsed')) {
            filterGroup.classList.remove('collapsed');
        }

        // Scroll into view
        const filterContent = document.getElementById('filterGroups');
        if (filterContent && option) {
            const optionRect = option.getBoundingClientRect();
            const contentRect = filterContent.getBoundingClientRect();

            if (optionRect.top < contentRect.top || optionRect.bottom > contentRect.bottom) {
                option.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    /**
     * Clear filter search
     */
    clearFilterSearch() {
        // Only clear search highlights in the options content (right panel)
        const filterContent = document.getElementById('filterGroups');
        if (filterContent) {
            filterContent.querySelectorAll('.filter-option.highlight-match').forEach(el => {
                el.classList.remove('highlight-match', 'current-match');
            });

            // Show all wrappers in options content
            filterContent.querySelectorAll('.filter-option-wrapper.filter-search-hidden').forEach(wrapper => {
                wrapper.classList.remove('filter-search-hidden');
            });
        }

        this.filterFinderMatches = [];
        this.filterFinderCurrentIndex = -1;
        this.updateFilterFinderUI();
    }

    /**
     * Update Filter Finder UI
     */
    updateFilterFinderUI() {
        const countElement = document.getElementById('filterFinderCount');
        const prevBtn = document.getElementById('filterFinderPrev');
        const nextBtn = document.getElementById('filterFinderNext');

        if (!countElement || !prevBtn || !nextBtn) return;

        const total = this.filterFinderMatches.length;
        const current = total > 0 ? this.filterFinderCurrentIndex + 1 : 0;

        countElement.textContent = `${current}/${total}`;

        const hasMatches = total > 0;
        prevBtn.disabled = !hasMatches;
        nextBtn.disabled = !hasMatches;
    }

    /**
     * Select all filters in a group
     * @param {string} groupKey - Filter group key
     */
    selectAllInGroup(groupKey) {
        const group = this.filterGroups[groupKey];
        if (!group) return;

        if (group.type === 'flat') {
            group.values.forEach(value => {
                const filterId = `${groupKey}:${value}`;
                if (!this.selectedFilters.has(filterId)) {
                    this.selectedFilters.add(filterId);
                    this.addFilterTag(filterId, this.getFilterLabel(groupKey, value));
                }
            });
        } else if (group.type === 'hierarchical') {
            // Select all leaf nodes in hierarchy
            this.selectAllInHierarchy(groupKey, group.values);
        }

        // Apply styles to currently visible (cached and rendered) options
        this.applySelectedStylesToCategory(groupKey);

        this.updateTriggerCount();
        this.scheduleFilterUpdate();
    }

    /**
     * Select all in hierarchy recursively
     * @param {string} groupKey - Filter group key
     * @param {Map} hierarchyMap - Hierarchy map
     * @param {string} parentPath - Parent path
     */
    selectAllInHierarchy(groupKey, hierarchyMap, parentPath = '') {
        hierarchyMap.forEach((node, value) => {
            const fullPath = parentPath ? `${parentPath}>${value}` : value;

            if (node.isLeaf) {
                const filterId = `${groupKey}:${value}`;
                if (!this.selectedFilters.has(filterId)) {
                    this.selectedFilters.add(filterId);
                    this.addFilterTag(filterId, this.getFilterLabel(groupKey, value));
                }
            }

            if (node.children.size > 0) {
                this.selectAllInHierarchy(groupKey, node.children, fullPath);
            }
        });
    }

    /**
     * Clear all filters in a group
     * @param {string} groupKey - Filter group key
     */
    clearGroup(groupKey) {
        const filtersToRemove = [];

        this.selectedFilters.forEach(filterId => {
            const [key] = filterId.split(':');
            if (key === groupKey) {
                filtersToRemove.push(filterId);
            }
        });

        filtersToRemove.forEach(filterId => {
            this.selectedFilters.delete(filterId);
            const option = this.filterOptionCache.get(filterId);
            if (option) {
                option.classList.remove('selected');
            }
            this.removeFilterTag(filterId);
        });

        this.updateTriggerCount();
        this.scheduleFilterUpdate();
    }

    /**
     * Select all children in a hierarchy path
     * @param {string} groupKey - Filter group key
     * @param {string} path - Hierarchy path
     */
    selectAllChildrenInHierarchy(groupKey, path) {
        const group = this.filterGroups[groupKey];
        if (!group || group.type !== 'hierarchical') return;

        // Find the node at the given path
        const node = this.findHierarchyNode(group.values, path);
        if (!node) return;

        // Select all leaf nodes under this path
        this.selectLeafNodesRecursive(groupKey, node.children, path);

        // Apply styles to currently visible options under this path
        const container = document.getElementById('filterGroups');
        if (container) {
            const pathOption = container.querySelector(`.filter-option[data-path="${path}"]`);
            if (pathOption) {
                const wrapper = pathOption.closest('.filter-option-wrapper');
                const childrenContainer = wrapper?.querySelector('.filter-children');
                if (childrenContainer) {
                    this.applySelectedStylesToContainer(childrenContainer);
                }
            }
        }

        this.updateTriggerCount();
        this.scheduleFilterUpdate();
    }

    /**
     * Clear all children in a hierarchy path
     * @param {string} groupKey - Filter group key
     * @param {string} path - Hierarchy path
     */
    clearAllChildrenInHierarchy(groupKey, path) {
        const group = this.filterGroups[groupKey];
        if (!group || group.type !== 'hierarchical') return;

        // Find the node at the given path
        const node = this.findHierarchyNode(group.values, path);
        if (!node) return;

        // Clear all leaf nodes under this path
        this.clearLeafNodesRecursive(groupKey, node.children, path);

        this.updateTriggerCount();
        this.scheduleFilterUpdate();
    }

    /**
     * Find a node in the hierarchy by path
     * @param {Map} hierarchyMap - Hierarchy map
     * @param {string} path - Path to find (e.g., "parent>child")
     * @returns {Object|null} Node or null
     */
    findHierarchyNode(hierarchyMap, path) {
        const parts = path.split('>');
        let current = hierarchyMap;

        for (const part of parts) {
            if (!current.has(part)) return null;
            const node = current.get(part);
            if (parts.indexOf(part) === parts.length - 1) {
                return node;
            }
            current = node.children;
        }

        return null;
    }

    /**
     * Select all leaf nodes recursively
     * @param {string} groupKey - Filter group key
     * @param {Map} hierarchyMap - Hierarchy map
     * @param {string} parentPath - Parent path
     */
    selectLeafNodesRecursive(groupKey, hierarchyMap, parentPath) {
        hierarchyMap.forEach((node, value) => {
            const fullPath = parentPath ? `${parentPath}>${value}` : value;

            if (node.isLeaf || node.children.size === 0) {
                // This is a leaf node, select it
                const filterId = `${groupKey}:${value}`;
                if (!this.selectedFilters.has(filterId)) {
                    this.selectedFilters.add(filterId);
                    this.addFilterTag(filterId, this.getFilterLabel(groupKey, value));
                }
            }

            if (node.children.size > 0) {
                this.selectLeafNodesRecursive(groupKey, node.children, fullPath);
            }
        });
    }

    /**
     * Clear all leaf nodes recursively
     * @param {string} groupKey - Filter group key
     * @param {Map} hierarchyMap - Hierarchy map
     * @param {string} parentPath - Parent path
     */
    clearLeafNodesRecursive(groupKey, hierarchyMap, parentPath) {
        hierarchyMap.forEach((node, value) => {
            const fullPath = parentPath ? `${parentPath}>${value}` : value;

            if (node.isLeaf || node.children.size === 0) {
                // This is a leaf node, clear it
                const filterId = `${groupKey}:${value}`;
                if (this.selectedFilters.has(filterId)) {
                    this.selectedFilters.delete(filterId);
                    const option = this.filterOptionCache.get(filterId);
                    if (option) {
                        option.classList.remove('selected');
                    }
                    this.removeFilterTag(filterId);
                }
            }

            if (node.children.size > 0) {
                this.clearLeafNodesRecursive(groupKey, node.children, fullPath);
            }
        });
    }

    /**
     * Initialize filter system
     */
    initializeFilters() {
        // Calculate initial counts
        this.updateFilterCounts();

        // Calculate static counts for UI display (only once at initialization)
        this.calculateStaticFilterCounts();
    }

    /**
     * Calculate static filter counts for UI display (only called once at initialization)
     */
    calculateStaticFilterCounts() {
        this.staticFilterCounts.clear();

        // Count for each filter option
        for (const [key, group] of Object.entries(this.filterGroups)) {
            if (group.type === 'flat') {
                group.values.forEach(value => {
                    const count = this.calculateAffectedCount(key, value);
                    this.staticFilterCounts.set(`${key}:${value}`, count);
                });
            } else if (group.type === 'hierarchical') {
                this.calculateStaticHierarchyCounts(key, group.values);
            }
        }
    }

    /**
     * Calculate static hierarchy counts recursively
     * @param {string} key - Filter key
     * @param {Map} hierarchyMap - Hierarchy map
     */
    calculateStaticHierarchyCounts(key, hierarchyMap) {
        hierarchyMap.forEach((node, value) => {
            const count = this.calculateAffectedCount(key, value);
            this.staticFilterCounts.set(`${key}:${value}`, count);

            if (node.children.size > 0) {
                this.calculateStaticHierarchyCounts(key, node.children);
            }
        });
    }

    /**
     * Update static counts for a specific category and refresh UI
     * @param {string} categoryKey - The category key to update
     */
    updateStaticCountsForCategory(categoryKey) {
        const group = this.filterGroups[categoryKey];
        if (!group) return;

        // Recalculate counts for this category
        if (group.type === 'flat') {
            group.values.forEach(value => {
                const count = this.calculateAffectedCount(categoryKey, value);
                this.staticFilterCounts.set(`${categoryKey}:${value}`, count);
            });
        } else if (group.type === 'hierarchical') {
            this.calculateStaticHierarchyCounts(categoryKey, group.values);
        }

        // Update the UI counts for this category
        this.updateUICountsForCategory(categoryKey);
    }

    /**
     * Update UI counts for a specific category
     * @param {string} categoryKey - The category key to update
     */
    updateUICountsForCategory(categoryKey) {
        const container = document.getElementById('filterGroups');
        if (!container) return;

        // Find all count elements in the current category
        container.querySelectorAll('[data-count]').forEach(el => {
            // Get the filter option element that contains this count element
            const optionElement = el.closest('.filter-option');
            if (!optionElement) return;

            // Get filter key and value from the option element
            const filterKey = optionElement.dataset.filter;
            const filterValue = optionElement.dataset.value;

            // Only update counts for the current category
            if (filterKey === categoryKey && filterKey && filterValue) {
                const count = this.getStaticCount(filterKey, filterValue);
                el.textContent = count;
            }
        });
    }

    /**
     * Update filter counts for all options
     */
    updateFilterCounts() {
        this.filterCounts.clear();

        // Count for each filter option
        for (const [key, group] of Object.entries(this.filterGroups)) {
            if (group.type === 'flat') {
                group.values.forEach(value => {
                    const count = this.calculateAffectedCount(key, value);
                    this.filterCounts.set(`${key}:${value}`, count);
                });
            } else if (group.type === 'hierarchical') {
                this.updateHierarchyCounts(key, group.values);
            }
        }
    }

    /**
     * Update hierarchy counts recursively
     * @param {string} key - Filter key
     * @param {Map} hierarchyMap - Hierarchy map
     */
    updateHierarchyCounts(key, hierarchyMap) {
        hierarchyMap.forEach((node, value) => {
            const count = this.calculateAffectedCount(key, value);
            this.filterCounts.set(`${key}:${value}`, count);

            if (node.children.size > 0) {
                this.updateHierarchyCounts(key, node.children);
            }
        });
    }

    /**
     * Calculate affected count for a filter
     * @param {string} filterKey - Filter key
     * @param {string} filterValue - Filter value
     * @returns {number} Count of matching datasets
     */
    calculateAffectedCount(filterKey, filterValue) {
        let count = 0;

        this.datasets.forEach(ds => {
            let match = false;

            if (filterKey === 'scene') {
                match = ds.scenes && ds.scenes.includes(filterValue);
            } else if (filterKey === 'robot') {
                const robots = Array.isArray(ds.robot) ? ds.robot : [ds.robot];
                match = robots.includes(filterValue);
            } else if (filterKey === 'end') {
                match = ds.endEffector === filterValue;
            } else if (filterKey === 'action') {
                match = ds.actions && ds.actions.includes(filterValue);
            } else if (filterKey === 'object') {
                match = ds.objects && ds.objects.some(obj =>
                    obj.hierarchy.includes(filterValue)
                );
            }

            if (match) count++;
        });

        return count;
    }

    /**
     * Get static count for a filter option
     * @param {string} filterKey - Filter key
     * @param {string} filterValue - Filter value
     * @returns {number} Static count
     */
    getStaticCount(filterKey, filterValue) {
        return this.staticFilterCounts.get(`${filterKey}:${filterValue}`) || 0;
    }
}

export default FilterManager;

