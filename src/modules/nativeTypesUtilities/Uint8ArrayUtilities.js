/**
 * @module Uint8ArrayUtilities
 */

/**
 * 
 * @param {Uint8Array} tArr 
 * @param {number} strLength 
 * @returns 
 */
const bufferToString = (tArr, strLength) => {
    var tArray;
    if (strLength) {
        tArray = new Uint8Array(tArr.buffer, 0, strLength);
    }
    else {
        tArray = new Uint8Array(tArr.buffer);
        for(var i = 0, l = tArr.byteLength; i < l; i++) {
            if (tArray[i] === 0) {
                tArray = tArray.slice(0, i);
                break;
            }
        }
    }
    return String.fromCharCode(...Array.prototype.slice.call(tArray));
}