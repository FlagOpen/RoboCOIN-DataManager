/**
 * @file Filter State Module
 * @description Encapsulates filter selection state and provides helper APIs.
 *
 * 该模块只负责“选中哪些 filterId（key:value）”这一纯状态，不包含任何 DOM 操作。
 */

/**
 * FilterState
 * Wraps the Set<string> of filter ids (e.g. "scene:indoor").
 */
export class FilterState {
    /**
     * @param {Set<string>=} backingSet Optional backing Set to use.
     */
    constructor(backingSet) {
        /** @type {Set<string>} */
        this._set = backingSet || new Set();
    }

    /**
     * Get underlying Set instance.
     * @returns {Set<string>}
     */
    get raw() {
        return this._set;
    }

    /**
     * Build filterId from key/value.
     * @param {string} key
     * @param {string} value
     * @returns {string}
     */
    static buildId(key, value) {
        return `${key}:${value}`;
    }

    /**
     * Add a filter selection.
     * @param {string} key
     * @param {string} value
     */
    add(key, value) {
        this._set.add(FilterState.buildId(key, value));
    }

    /**
     * Remove a filter selection.
     * @param {string} key
     * @param {string} value
     */
    delete(key, value) {
        this._set.delete(FilterState.buildId(key, value));
    }

    /**
     * Check whether a filter is selected.
     * @param {string} key
     * @param {string} value
     * @returns {boolean}
     */
    has(key, value) {
        return this._set.has(FilterState.buildId(key, value));
    }

    /**
     * Clear all selections.
     */
    clear() {
        this._set.clear();
    }

    /**
     * Iterate over raw filter ids.
     * @param {(filterId: string) => void} callback
     */
    forEach(callback) {
        this._set.forEach(callback);
    }

    /**
     * Current selection count.
     * @returns {number}
     */
    get size() {
        return this._set.size;
    }
}

export default FilterState;


