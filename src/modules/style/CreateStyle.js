/**
 * CreateStyle
 */

import Stylesheet from './Stylesheet.js';
import {styleUIDGenerator} from '../UIDGenerator.js';

export default (uniqueID, styles) => {
    return new Stylesheet(styles, uniqueID || 'stylesheet' + styleUIDGenerator.newUID());
}