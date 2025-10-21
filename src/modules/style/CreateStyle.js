/**
 * CreateStyle
 */

import Stylesheet from './Stylesheet.js';
import {styleUIDGenerator} from '../UIDGenerator.js';

/**
 * @param {string} uniqueID name of the stylesheet from the template
 * @param {{[key: string]: string}[]} styles styleRules
 */
export default (uniqueID, styles) => {
    return new Stylesheet(styles, uniqueID || 'stylesheet' + styleUIDGenerator.newUID());
}