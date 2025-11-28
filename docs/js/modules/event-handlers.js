/**
 * @file Event Handlers Module
 * @description Centralizes all event binding and handling logic
 */

/// <reference path="../types.js" />

import ConfigManager from './config.js';
import { debounce } from './virtual-scroll.js';
import { selectAllChildrenInHierarchy, clearAllChildrenInHierarchy } from './@filter/filter-hierarchy.js';
import DownloadManager from './download-manager.js';

/**
 * Event Handlers Manager Class
 */
export class EventHandlers {
    /**
     * @param {Object} managers - Object containing all manager instances
     * @param {Object} managers.filter - Filter manager
     * @param {Object} managers.videoGrid - Video grid manager
     * @param {Object} managers.selectionPanel - Selection panel manager
     * @param {Object} managers.ui - UI utilities
     * @param {Set<string>} selectedDatasets - Selected dataset paths
     * @param {Map<string, Dataset>} datasetMap - Dataset map
     */
    constructor(managers, selectedDatasets, datasetMap) {
        this.managers = managers;
        this.selectedDatasets = selectedDatasets;
        this.datasetMap = datasetMap;
        this.config = ConfigManager.getConfig();
    }

    /**
     * Bind all events
     */
    bindEvents() {
        this.bindFilterEvents();
        this.bindVideoGridEvents();
        this.bindSelectionListEvents();
        this.bindToolbarEvents();
        this.bindResizeEvents();
        this.bindScrollEvents();
    }

    /**
     * Bind filter-related events
     */
    bindFilterEvents() {
        // Search box (debounced)
        const searchBox = document.getElementById('searchBox');
        if (searchBox) {
            searchBox.addEventListener('input', debounce(() => {
                document.dispatchEvent(new CustomEvent('filtersChanged'));
            }, 150));
        }

        // Filter dropdown events
        const filterTriggerBtn = document.getElementById('filterTriggerBtn');
        const filterDropdownClose = document.getElementById('filterDropdownClose');
        const filterDropdownOverlay = document.getElementById('filterDropdownOverlay');

        if (filterTriggerBtn) {
            filterTriggerBtn.addEventListener('click', () => {
                this.managers.ui.openFilterDropdown();
                // Initialize tooltips when dropdown opens
                this.managers.filter.initializeFilters();
                // Focus search input when dropdown opens
                setTimeout(() => {
                    const searchInput = document.getElementById('filterFinderInput');
                    if (searchInput) {
                        searchInput.focus();
                    }
                }, 100);
            });
        }

        if (filterDropdownClose) {
            filterDropdownClose.addEventListener('click', () => {
                this.managers.ui.closeFilterDropdown();
                // Clear search when closing
                const searchInput = document.getElementById('filterFinderInput');
                if (searchInput) {
                    searchInput.value = '';
                    this.managers.filter.clearFilterSearch();
                }
            });
        }

        if (filterDropdownOverlay) {
            filterDropdownOverlay.addEventListener('click', (e) => {
                if (e.target.id === 'filterDropdownOverlay') {
                    this.managers.ui.closeFilterDropdown();
                    // Clear search when closing
                    const searchInput = document.getElementById('filterFinderInput');
                    if (searchInput) {
                        searchInput.value = '';
                        this.managers.filter.clearFilterSearch();
                    }
                }
            });
        }

        // Filter finder (search) events
        this.bindFilterFinderEvents();

        // Reset filters button
        const resetFiltersBtn = document.getElementById('resetFiltersBtn');
        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', () => {
                this.addClickAnimation(resetFiltersBtn);
                document.getElementById('searchBox').value = '';
                this.managers.filter.resetFilters();
            });
        }

        // Hub selection buttons
        const hubBtnHuggingFace = document.getElementById('hubBtnHuggingFace');
        const hubBtnModelScope = document.getElementById('hubBtnModelScope');

        if (hubBtnHuggingFace) {
            hubBtnHuggingFace.addEventListener('click', () => {
                this.managers.selectionPanel.setHub('huggingface');
                DownloadManager.setCurrentHub('huggingface');
                this.updateHubButtons('huggingface');
            });
        }

        if (hubBtnModelScope) {
            hubBtnModelScope.addEventListener('click', () => {
                this.managers.selectionPanel.setHub('modelscope');
                DownloadManager.setCurrentHub('modelscope');
                this.updateHubButtons('modelscope');
            });
        }

        // Initialize hub button states
        this.updateHubButtons(this.managers.selectionPanel.currentHub);

        // Quick-action buttons and tooltips (event delegation)
        this.bindFilterDropdownEvents();
    }

    /**
     * Update hub button states
     * @param {string} activeHub - Active hub name ('huggingface' or 'modelscope')
     */
    updateHubButtons(activeHub) {
        const hubBtnHuggingFace = document.getElementById('hubBtnHuggingFace');
        const hubBtnModelScope = document.getElementById('hubBtnModelScope');

        if (hubBtnHuggingFace) {
            if (activeHub === 'huggingface') {
                hubBtnHuggingFace.classList.add('active');
            } else {
                hubBtnHuggingFace.classList.remove('active');
            }
        }

        if (hubBtnModelScope) {
            if (activeHub === 'modelscope') {
                hubBtnModelScope.classList.add('active');
            } else {
                hubBtnModelScope.classList.remove('active');
            }
        }
    }

    /**
     * Bind filter finder (search) events
     */
    bindFilterFinderEvents() {
        const filterFinderInput = document.getElementById('filterFinderInput');
        const filterFinderPrev = document.getElementById('filterFinderPrev');
        const filterFinderNext = document.getElementById('filterFinderNext');

        if (!filterFinderInput) return;

        // Search input event
        filterFinderInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            this.managers.filter.searchFilterOptions(query);
        });

        // Previous/Next button events
        if (filterFinderPrev) {
            filterFinderPrev.addEventListener('click', () => {
                this.managers.filter.navigateFilterMatch('prev');
            });
        }

        if (filterFinderNext) {
            filterFinderNext.addEventListener('click', () => {
                this.managers.filter.navigateFilterMatch('next');
            });
        }

        // Keyboard shortcuts
        filterFinderInput.addEventListener('keydown', (e) => {
            // Escape: clear search
            if (e.key === 'Escape') {
                filterFinderInput.value = '';
                this.managers.filter.clearFilterSearch();
                filterFinderInput.blur();
                return;
            }

            // Arrow keys: navigate matches
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (filterFinderInput.value.trim()) {
                    this.managers.filter.navigateFilterMatch('prev');
                }
                return;
            }

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (filterFinderInput.value.trim()) {
                    this.managers.filter.navigateFilterMatch('next');
                }
                return;
            }

            // Enter: select current match or navigate to next
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = filterFinderInput.value.trim();
                if (!query) return;

                const currentMatch = this.managers.filter.filterFinderMatches[this.managers.filter.filterFinderCurrentIndex];
                if (currentMatch && currentMatch.element) {
                    const option = currentMatch.element;
                    const filterKey = option.dataset.filter;
                    const filterValue = option.dataset.value;
                    if (filterKey && filterValue) {
                        const label = option.querySelector('.filter-option-label')?.textContent?.trim() || filterValue;
                        this.managers.filter.toggleFilterSelection(filterKey, filterValue, label, option);
                    }
                }
                return;
            }
        });

        // Global Ctrl+F / Cmd+F shortcut to focus search
        document.addEventListener('keydown', (e) => {
            // Check if filter dropdown is open
            const overlay = document.getElementById('filterDropdownOverlay');
            if (!overlay || !overlay.classList.contains('active')) return;

            // Ctrl+F or Cmd+F
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                filterFinderInput.focus();
                filterFinderInput.select();
            }
        });
    }

    /**
     * Bind filter dropdown events (quick-actions and tooltips)
     */
    bindFilterDropdownEvents() {
        const filterGroups = document.getElementById('filterGroups');
        if (!filterGroups) return;

        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        // Hierarchy action buttons (All/Clear buttons for all levels)
        filterGroups.addEventListener('click', (e) => {
            const hierarchyActionBtn = e.target.closest('.hierarchy-action-btn');
            if (hierarchyActionBtn) {
                e.stopPropagation(); // Prevent menu collapse

                const action = hierarchyActionBtn.dataset.action;

                // Top-level group buttons (have data-group)
                const groupKey = hierarchyActionBtn.dataset.group;
                if (groupKey) {
                    if (action === 'select-all') {
                        this.managers.filter.selectAllInGroup(groupKey);
                    } else if (action === 'clear-group') {
                        this.managers.filter.clearGroup(groupKey);
                    }
                    return;
                }

                // Hierarchy item buttons (have data-key and data-path)
                const key = hierarchyActionBtn.dataset.key;
                const path = hierarchyActionBtn.dataset.path;
                if (key && path) {
                    if (action === 'select-all-children') {
                        selectAllChildrenInHierarchy(this.managers.filter, key, path);
                    } else if (action === 'clear-all-children') {
                        clearAllChildrenInHierarchy(this.managers.filter, key, path);
                    }
                    return;
                }
            }
        });

    }

    /**
     * Bind video grid events (event delegation)
     */
    bindVideoGridEvents() {
        const grid = document.getElementById('videoGrid');
        if (!grid) return;

        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        // Hover overlay timers (desktop / non-touch only)
        this._hoverOverlayShowTimeout = null;
        this._hoverOverlayHideTimeout = null;
        this._hoverOverlayActiveCard = null;

        // Event delegation: click on video-card
        grid.addEventListener('click', (e) => {
            try {
                // Clickable title inside hover overlay
                const hoverTitle = e.target.closest('.video-hover-title');
                if (hoverTitle && this.managers && this.managers.ui) {
                    e.stopPropagation();
                    const detailPath = hoverTitle.dataset.path;
                    if (detailPath) {
                        this.managers.ui.showDetailModal(detailPath, this.datasetMap);
                    }
                    return;
                }

                // Allow clicks on the autoplay preview video to also toggle selection
                // so users can click anywhere on the video pane (thumbnail or video)
                const card = e.target.closest('.video-card');
                if (!card) return;

                const path = card.dataset.path;
                if (!path) return;

                if (this.managers && this.managers.selectionPanel) {
                    this.toggleSelection(path);
                }
            } catch (error) {
                console.error('Error in video grid click handler:', error);
            }
        });

        // Desktop hover: show in-card hover overlay with detailed info
        if (!isTouchDevice) {
            grid.addEventListener('mouseover', (e) => {
                const card = e.target.closest('.video-card');
                if (!card || !grid.contains(card)) return;

                const path = card.dataset.path;
                if (!path) return;

                // Cancel any pending hide while moving between cards
                if (this._hoverOverlayHideTimeout) {
                    clearTimeout(this._hoverOverlayHideTimeout);
                    this._hoverOverlayHideTimeout = null;
                }

                // Debounce show to avoid flicker when quickly moving across cards
                if (this._hoverOverlayShowTimeout) {
                    clearTimeout(this._hoverOverlayShowTimeout);
                }

                const hoverDelay = this.config?.timing?.hoverDelay || 800;
                this._hoverOverlayShowTimeout = setTimeout(() => {
                    // Hide any previously active overlay
                    if (this._hoverOverlayActiveCard && this._hoverOverlayActiveCard !== card) {
                        this._hoverOverlayActiveCard.classList.remove('hover-overlay-visible');
                    }
                    card.classList.add('hover-overlay-visible');
                    this._hoverOverlayActiveCard = card;
                    this._hoverOverlayShowTimeout = null;
                }, hoverDelay);
            });

            grid.addEventListener('mouseout', (e) => {
                const card = e.target.closest('.video-card');
                if (!card || !grid.contains(card)) return;

                const related = /** @type {HTMLElement|null} */ (e.relatedTarget);
                const stayingInSameCard = !!(related && card.contains(related));

                // If still inside the same card (including overlay), don't hide
                if (stayingInSameCard) {
                    return;
                }

                // Cancel pending show
                if (this._hoverOverlayShowTimeout) {
                    clearTimeout(this._hoverOverlayShowTimeout);
                    this._hoverOverlayShowTimeout = null;
                }

                // Immediately remove hover overlay
                card.classList.remove('hover-overlay-visible');
                if (this._hoverOverlayActiveCard === card) {
                    this._hoverOverlayActiveCard = null;
                }
            });
        }

        // Video load error handling
        grid.addEventListener('error', (e) => {
            if (e.target.tagName === 'VIDEO') {
                const card = e.target.closest('.video-card');
                if (card) {
                    const errorDiv = card.querySelector('.video-error');
                    if (errorDiv) errorDiv.style.display = 'block';
                }
            }
        }, true);
    }

    /**
     * Bind selection list events (event delegation)
     */
    bindSelectionListEvents() {
        const list = document.getElementById('selectionList');
        if (!list) return;

        // Click events
        list.addEventListener('click', (e) => {
            const item = e.target.closest('.selection-item');
            if (!item) return;

            const path = item.dataset.path;
            if (!path) return;

            // Remove button
            if (e.target.closest('.btn-remove')) {
                e.stopPropagation();
                this.managers.selectionPanel.listDatasets.delete(path);
                this.managers.selectionPanel.markListChanged();
                this.managers.videoGrid.updateCardStyles();
                this.managers.selectionPanel.updateSelectionPanel();
                return;
            }

            // Detail button
            if (e.target.closest('.btn-detail')) {
                e.stopPropagation();
                this.managers.ui.showDetailModal(path, this.datasetMap);
                return;
            }

            // Toggle selection
            if (this.selectedDatasets.has(path)) {
                this.selectedDatasets.delete(path);
            } else {
                this.selectedDatasets.add(path);
            }
            this.managers.videoGrid.updateCardStyles();
            this.managers.selectionPanel.updateSelectionPanel();
        });
    }

    /**
     * Add click animation to button
     * @param {HTMLElement} button - Button element
     */
    addClickAnimation(button) {
        if (!button) return;

        // Remove existing animation class if present
        button.classList.remove('click-animate');

        // Force reflow to ensure class removal is processed
        void button.offsetWidth;

        // Add animation class
        button.classList.add('click-animate');

        // Remove class after animation completes (300ms)
        setTimeout(() => {
            button.classList.remove('click-animate');
        }, 300);
    }

    /**
     * Bind toolbar button events
     */
    bindToolbarEvents() {
        // Select/Deselect all
        const selectAllBtn = document.getElementById('selectAllBtn');
        const deselectAllBtn = document.getElementById('deselectAllBtn');

        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => {
                this.addClickAnimation(selectAllBtn);
                this.selectAllFiltered();
            });
        }

        if (deselectAllBtn) {
            deselectAllBtn.addEventListener('click', () => {
                this.addClickAnimation(deselectAllBtn);
                this.deselectAllFiltered();
            });
        }


        // Import/Export
        const importBtn = document.getElementById('importBtn');
        const importFile = document.getElementById('importFile');
        const exportBtn = document.getElementById('exportBtn');
        const copyCodeBtn = document.getElementById('copyCodeBtn');

        if (importBtn) {
            importBtn.addEventListener('click', () => {
                importFile.click();
            });
        }

        if (importFile) {
            importFile.addEventListener('change', (e) => {
                // 传入回调函数，在导入完成后更新视频网格样式
                this.managers.selectionPanel.handleImportFile(
                    e,
                    this.managers.filter.datasets,
                    () => {
                        // 导入完成后更新视频网格样式
                        this.managers.videoGrid.updateCardStyles();
                    }
                );
            });
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.managers.selectionPanel.exportSelection();
            });
        }

        if (copyCodeBtn) {
            copyCodeBtn.addEventListener('click', () => {
                this.managers.selectionPanel.copyCode();
            });
        }

        // Code detail button toggle
        const codeDetailBtn = document.getElementById('codeDetailBtn');
        const codeDetailPanel = document.getElementById('codeDetailPanel');
        if (codeDetailBtn && codeDetailPanel) {
            const codeDetailContent = codeDetailPanel.querySelector('.code-detail-content');

            // Load content from CSS variable
            const loadDetailContent = () => {
                const computedStyle = getComputedStyle(document.documentElement);
                const tooltipText = computedStyle.getPropertyValue('--code-detail-tooltip-text').trim();
                // Remove quotes if present
                let cleanText = tooltipText.replace(/^["']|["']$/g, '');
                // Convert \n to actual newlines for display
                cleanText = cleanText.replace(/\\n/g, '\n');
                if (codeDetailContent) {
                    codeDetailContent.textContent = cleanText;
                }
            };

            loadDetailContent();

            codeDetailBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isExpanded = codeDetailPanel.classList.contains('expanded');

                if (isExpanded) {
                    codeDetailPanel.classList.remove('expanded');
                    codeDetailBtn.classList.remove('active');
                } else {
                    codeDetailPanel.classList.add('expanded');
                    codeDetailBtn.classList.add('active');
                }
            });

            // Close panel when clicking outside
            document.addEventListener('click', (e) => {
                if (codeDetailPanel.classList.contains('expanded') &&
                    !codeDetailPanel.contains(e.target) &&
                    !codeDetailBtn.contains(e.target)) {
                    codeDetailPanel.classList.remove('expanded');
                    codeDetailBtn.classList.remove('active');
                }
            });
        }
    }

    /**
     * Bind window resize events
     */
    bindResizeEvents() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const filteredDatasets = this.managers.filter.applyFilters(
                    document.getElementById('searchBox')?.value || ''
                );
                this.managers.videoGrid.renderVideoGrid(filteredDatasets);
            }, 200);
        });
    }

    /**
     * Bind scroll events for virtual scrolling
     */
    bindScrollEvents() {
        // Video grid scroll
        const gridContainer = document.querySelector('.video-grid-container');
        if (gridContainer) {
            let videoScrollTicking = false;

            // Use passive listener for better scroll performance
            gridContainer.addEventListener('scroll', () => {
                if (!videoScrollTicking) {
                    window.requestAnimationFrame(() => {
                        const filteredDatasets = this.managers.filter.applyFilters(
                            document.getElementById('searchBox')?.value || ''
                        );
                        this.managers.videoGrid.renderVideoGrid(filteredDatasets);
                        videoScrollTicking = false;
                    });
                    videoScrollTicking = true;
                }
            }, { passive: true });
        }

        // Selection list scroll
        const selectionList = document.getElementById('selectionList');
        if (selectionList) {
            let selectionScrollTicking = false;

            // Use passive listener for better scroll performance
            selectionList.addEventListener('scroll', () => {
                if (!selectionScrollTicking) {
                    window.requestAnimationFrame(() => {
                        this.managers.selectionPanel.updateSelectionPanel();
                        selectionScrollTicking = false;
                    });
                    selectionScrollTicking = true;
                }
            }, { passive: true });
        }
    }

    /**
     * Toggle dataset selection
     * @param {string} path - Dataset path
     */
    toggleSelection(path) {
        if (this.selectedDatasets.has(path)) {
            this.selectedDatasets.delete(path);
            this.managers.selectionPanel.listDatasets.delete(path);
            this.managers.selectionPanel.markListChanged();
        } else {
            this.selectedDatasets.add(path);
            this.managers.selectionPanel.listDatasets.add(path);
            this.managers.selectionPanel.markListChanged();
        }
        this.managers.videoGrid.updateCardStyles();
        this.managers.selectionPanel.updateSelectionPanel();
    }

    /**
     * Select all filtered datasets
     */
    selectAllFiltered() {
        const filteredDatasets = this.managers.filter.applyFilters(
            document.getElementById('searchBox')?.value || ''
        );
        filteredDatasets.forEach(ds => {
            this.selectedDatasets.add(ds.path);
            this.managers.selectionPanel.listDatasets.add(ds.path);
        });
        this.managers.selectionPanel.markListChanged();
        this.managers.videoGrid.updateCardStyles();
        this.managers.selectionPanel.updateSelectionPanel();
    }

    /**
     * Deselect all filtered datasets
     */
    deselectAllFiltered() {
        const filteredDatasets = this.managers.filter.applyFilters(
            document.getElementById('searchBox')?.value || ''
        );
        filteredDatasets.forEach(ds => {
            this.selectedDatasets.delete(ds.path);
            this.managers.selectionPanel.listDatasets.delete(ds.path);
        });
        this.managers.selectionPanel.markListChanged();
        this.managers.videoGrid.updateCardStyles();
        this.managers.selectionPanel.updateSelectionPanel();
    }
}

export default EventHandlers;

