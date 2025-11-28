/**
 * @file Filter Hierarchy Helpers
 * @description Utilities for managing hierarchical object filters.
 *
 * 这些函数与具体的 FilterManager 实例解耦，通过参数传入 manager，
 * 便于后续进一步拆分和测试。
 */

import { qs } from '../dom-utils.js';

/**
 * Add object hierarchy to Map structure.
 * @param {Map<string, {children: Map, isLeaf: boolean}>} hierarchyMap
 * @param {string[]} levels
 */
export function addToHierarchy(hierarchyMap, levels) {
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
 * Count items in hierarchy recursively.
 * @param {Map<string, {children: Map, isLeaf: boolean}>} hierarchyMap
 * @returns {number}
 */
export function countHierarchyItems(hierarchyMap) {
    let count = 0;
    hierarchyMap.forEach(node => {
        if (node.children.size > 0) {
            count += countHierarchyItems(node.children);
        } else {
            count++;
        }
    });
    return count;
}

/**
 * Recursively select all leaf nodes in a hierarchy.
 * @param {import('./filter-manager.js').FilterManager} manager
 * @param {string} groupKey
 * @param {Map} hierarchyMap
 * @param {string} parentPath
 */
export function selectAllInHierarchy(manager, groupKey, hierarchyMap, parentPath = '') {
    hierarchyMap.forEach((node, value) => {
        const fullPath = parentPath ? `${parentPath}>${value}` : value;

        if (node.isLeaf || node.children.size === 0) {
            const filterId = `${groupKey}:${value}`;
            if (!manager.selectedFilters.has(filterId)) {
                manager.selectedFilters.add(filterId);
                manager.addFilterTag(filterId, manager.getFilterLabel(groupKey, value));
            }
        }

        if (node.children.size > 0) {
            selectAllInHierarchy(manager, groupKey, node.children, fullPath);
        }
    });
}

/**
 * Find a node in the hierarchy by path.
 * @param {Map} hierarchyMap
 * @param {string} path e.g. "parent>child"
 * @returns {{children: Map, isLeaf: boolean}|null}
 */
export function findHierarchyNode(hierarchyMap, path) {
    const parts = path.split('>');
    let current = hierarchyMap;

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!current.has(part)) return null;
        const node = current.get(part);
        if (i === parts.length - 1) {
            return node;
        }
        current = node.children;
    }

    return null;
}

/**
 * Recursively clear all leaf nodes.
 * @param {import('./filter-manager.js').FilterManager} manager
 * @param {string} groupKey
 * @param {Map} hierarchyMap
 * @param {string} parentPath
 */
export function clearLeafNodesRecursive(manager, groupKey, hierarchyMap, parentPath) {
    hierarchyMap.forEach((node, value) => {
        const fullPath = parentPath ? `${parentPath}>${value}` : value;

        if (node.isLeaf || node.children.size === 0) {
            const filterId = `${groupKey}:${value}`;
            if (manager.selectedFilters.has(filterId)) {
                manager.selectedFilters.delete(filterId);
                const option = manager.filterOptionCache.get(filterId);
                if (option) {
                    option.classList.remove('selected');
                }
                manager.removeFilterTag(filterId);
            }
        }

        if (node.children.size > 0) {
            clearLeafNodesRecursive(manager, groupKey, node.children, fullPath);
        }
    });
}

/**
 * Select all children in a hierarchy path.
 * @param {import('./filter-manager.js').FilterManager} manager
 * @param {string} groupKey
 * @param {string} path
 */
export function selectAllChildrenInHierarchy(manager, groupKey, path) {
    const group = manager.filterGroups[groupKey];
    if (!group || group.type !== 'hierarchical') return;

    const node = findHierarchyNode(group.values, path);
    if (!node) return;

    // Select all leaf nodes under this path
    selectAllInHierarchy(manager, groupKey, node.children, path);

    // Apply styles to currently visible options under this path
    const container = qs('#filterGroups');
    if (container) {
        const pathOption = container.querySelector(`.filter-option[data-path="${path}"]`);
        if (pathOption) {
            const wrapper = pathOption.closest('.filter-option-wrapper');
            const childrenContainer = wrapper?.querySelector('.filter-children');
            if (childrenContainer) {
                manager.applySelectedStylesToContainer(childrenContainer);
            }
        }
    }

    manager.updateTriggerCount();
    manager.scheduleFilterUpdate();
}

/**
 * Clear all children in a hierarchy path.
 * @param {import('./filter-manager.js').FilterManager} manager
 * @param {string} groupKey
 * @param {string} path
 */
export function clearAllChildrenInHierarchy(manager, groupKey, path) {
    const group = manager.filterGroups[groupKey];
    if (!group || group.type !== 'hierarchical') return;

    const node = findHierarchyNode(group.values, path);
    if (!node) return;

    // Clear all leaf nodes under this path
    clearLeafNodesRecursive(manager, groupKey, node.children, path);

    manager.updateTriggerCount();
    manager.scheduleFilterUpdate();
}

export default {
    addToHierarchy,
    countHierarchyItems,
    selectAllInHierarchy,
    findHierarchyNode,
    clearLeafNodesRecursive,
    selectAllChildrenInHierarchy,
    clearAllChildrenInHierarchy
};


