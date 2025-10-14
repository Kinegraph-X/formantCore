/**
 * @module Uint8ArrayUtilities
 */

/**
 * 
 * @param {Uint8Array} tArr 
 * @param {number} strLength 
 * @returns 
 */
export const bufferToString = (tArr, strLength) => {
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

/**
 * 
 * @param {Uint8Array} tArr 
 * @param {number} strStart 
 * @param {number} [strLength] 
 * @returns 
 */
export const bufferToPartialString = (tArr, strStart, strLength) => {
    var tArray;
    if (strLength) {
        tArray = new Uint8Array(tArr.buffer, strStart, strLength);
    }
    else {
        tArray = new Uint8Array(tArr.buffer);
        for(var i = strStart, l = tArr.byteLength; i < l; i++) {
            if (tArray[i] === 0) {
                tArray = tArray.slice(strStart, i);
                break;
            }
        }
    }
    return String.fromCharCode(...Array.prototype.slice.call(tArray));
}