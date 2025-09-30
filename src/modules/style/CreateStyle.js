/**
 * CreateStyle
 */

import Stylesheet from 'src/coreTest/styleManagement/Stylesheet';
import {styleUIDGenerator} from 'src/coreTest/UIDGenerator';

export default (uniqueID, styles) => {
    return new Stylesheet(styles, uniqueID || 'stylesheet' + styleUIDGenerator.newUID());
}