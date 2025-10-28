/**
 * CreateStyle
 */

import Stylesheet from './Stylesheet';
import {styleUIDGenerator} from '../UIDGenerator.js';

import {
    type RawRule,
} from './CSSPropertyDescriptors.js';

/**
 * @param {string} uniqueID name of the stylesheet from the template
 * @param {RawRule[]} styles styleRules
 */
export default (
    uniqueID : string|null,
    styles : RawRule[]
) => {
    return new Stylesheet(styles, uniqueID || 'stylesheet' + styleUIDGenerator.newUID());
}