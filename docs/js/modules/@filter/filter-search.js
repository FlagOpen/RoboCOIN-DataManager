/**
 * @file Filter Search Helper
 * @description Encapsulates Filter Finder (search/navigate/highlight) logic for filters.
 */

import { qs, addClass, removeClass } from '../dom-utils.js';

export class FilterSearchHelper {
    /**
     * @param {import('./filter-manager.js').FilterManager} manager
     * @param {Object|null} robotAliasManager
     */
    constructor(manager, robotAliasManager) {
        this.manager = manager;
        this.robotAliasManager = robotAliasManager || null;

        /** @type {{element: HTMLElement, text: string, wrapper: HTMLElement|null}[]} */
        this.matches = [];
        /** @type {number} */
        this.currentIndex = -1;
    }

    /**
     * Execute search over filter options.
     * @param {string} query
     */
    search(query) {
        this.clear(false);

        const filterContent = qs('#filterGroups');
        if (!filterContent) return;

        const allOptions = filterContent.querySelectorAll('.filter-option');
        const allWrappers = filterContent.querySelectorAll('.filter-option-wrapper');

        if (!query) {
            allWrappers.forEach(wrapper => {
                removeClass(wrapper, 'filter-search-hidden');
            });
            this.updateUI();
            return;
        }

        const queryLower = query.toLowerCase();

        allOptions.forEach(option => {
            const labelElement = option.querySelector('.filter-option-label, .hierarchy-label');
            if (!labelElement) return;

            const text = labelElement.textContent.trim();
            const textLower = text.toLowerCase();

            let matches = textLower.includes(queryLower);

            if (!matches) {
                const filterKey = option.dataset.filter;
                const filterValue = option.dataset.value;

                if (
                    filterKey === 'robot' &&
                    filterValue &&
                    this.robotAliasManager &&
                    typeof this.robotAliasManager.getSearchTokensForRobot === 'function'
                ) {
                    const tokens = this.robotAliasManager.getSearchTokensForRobot(filterValue);
                    matches = tokens.some(token =>
                        typeof token === 'string' &&
                        token.toLowerCase().includes(queryLower)
                    );
                }
            }

            if (matches) {
                addClass(option, 'highlight-match');
                this.matches.push({
                    element: option,
                    text,
                    wrapper: option.closest('.filter-option-wrapper')
                });
            }
        });

        allWrappers.forEach(wrapper => {
            const hasMatch = wrapper.querySelector('.highlight-match') !== null;
            const hasMatchingDescendant = Array.from(wrapper.querySelectorAll('.filter-option-wrapper')).some(
                child => child.querySelector('.highlight-match') !== null
            );

            if (hasMatch || hasMatchingDescendant) {
                removeClass(wrapper, 'filter-search-hidden');
                let parent = wrapper.parentElement?.closest('.filter-children');
                while (parent) {
                    if (parent.classList.contains('collapsed')) {
                        removeClass(parent, 'collapsed');
                    }
                    parent = parent.parentElement?.closest('.filter-children');
                }
                const filterGroup = wrapper.closest('.filter-group');
                if (filterGroup && filterGroup.classList.contains('collapsed')) {
                    removeClass(filterGroup, 'collapsed');
                }
            } else {
                addClass(wrapper, 'filter-search-hidden');
            }
        });

        if (this.matches.length > 0) {
            this.currentIndex = 0;
            this.highlightCurrent();
        }

        this.updateUI();
    }

    /**
     * Navigate to next/previous match.
     * @param {'next'|'prev'} direction
     */
    navigate(direction) {
        if (this.matches.length === 0) return;

        if (this.currentIndex >= 0 && this.currentIndex < this.matches.length) {
            removeClass(this.matches[this.currentIndex].element, 'current-match');
        }

        if (direction === 'next') {
            this.currentIndex = (this.currentIndex + 1) % this.matches.length;
        } else {
            this.currentIndex = (this.currentIndex - 1 + this.matches.length) % this.matches.length;
        }

        this.highlightCurrent();
        this.updateUI();
    }

    /**
     * Highlight current match and scroll into view.
     */
    highlightCurrent() {
        if (this.currentIndex < 0 || this.currentIndex >= this.matches.length) {
            return;
        }

        const match = this.matches[this.currentIndex];
        const option = match.element;

        addClass(option, 'current-match');

        let parent = option.closest('.filter-children');
        while (parent) {
            if (parent.classList.contains('collapsed')) {
                removeClass(parent, 'collapsed');
            }
            parent = parent.parentElement?.closest('.filter-children');
        }

        const filterGroup = option.closest('.filter-group');
        if (filterGroup && filterGroup.classList.contains('collapsed')) {
            removeClass(filterGroup, 'collapsed');
        }

        const filterContent = qs('#filterGroups');
        if (filterContent && option) {
            const optionRect = option.getBoundingClientRect();
            const contentRect = filterContent.getBoundingClientRect();

            if (optionRect.top < contentRect.top || optionRect.bottom > contentRect.bottom) {
                option.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    /**
     * Clear search highlights and hidden wrappers.
     * @param {boolean} [update=true]
     */
    clear(update = true) {
        const filterContent = qs('#filterGroups');
        if (filterContent) {
            filterContent.querySelectorAll('.filter-option.highlight-match').forEach(el => {
                removeClass(el, 'highlight-match');
                removeClass(el, 'current-match');
            });

            filterContent.querySelectorAll('.filter-option-wrapper.filter-search-hidden').forEach(wrapper => {
                removeClass(wrapper, 'filter-search-hidden');
            });
        }

        this.matches = [];
        this.currentIndex = -1;
        if (update) {
            this.updateUI();
        }
    }

    /**
     * Update Filter Finder UI (counter and buttons).
     */
    updateUI() {
        const countElement = qs('#filterFinderCount');
        const prevBtn = qs('#filterFinderPrev');
        const nextBtn = qs('#filterFinderNext');

        if (!countElement || !prevBtn || !nextBtn) return;

        const total = this.matches.length;
        const current = total > 0 ? this.currentIndex + 1 : 0;

        countElement.textContent = `${current}/${total}`;

        const hasMatches = total > 0;
        prevBtn.disabled = !hasMatches;
        nextBtn.disabled = !hasMatches;
    }
}

export default FilterSearchHelper;


