/**
 * @constructor MemoryMapBuffer
 */

import MemoryBufferStack from './MemoryBufferStack.js';

class MemoryMapBuffer {
	static objectType = 'MemoryMapBuffer';
	propertiesAccessGroupsBoudaries = {};

	constructor(itemSize, length) {
		this.objectType = 'MemoryMapBuffer';

		this.propAddresses = (new Uint8Array(length)).fill(255);
		this.itemSize = itemSize;
		this._buffer = new Uint8Array(length * itemSize);

		this.traverseAndJumpFunction = this.setLogicForTraverseAndJump();
		this.branchlessLoop = this.getBranchlessLoop();

	}
	getProperty(propertyName) {

		if (typeof this.propertiesStaticMap[propertyName] === 'undefined') {
			console.warn('MemoryMapBuffer:get', 'The requested property ' + propertyName + 'is not implemented', 'Returning...');
			return;
		}

		return this.occupancySolver(propertyName)
			&& this._buffer[this.propAddresses[this.propertiesStaticMap[propertyName]] * this.itemSize];
	}
	setProperty(propertyName, propertyValue) {
		if (typeof this.propertiesStaticMap[propertyName] === 'undefined') {
			console.warn('MemoryMapBuffer:set', 'The requested property ' + propertyName + 'is not implemented', 'Returning...');
			return;
		}

		if (this._byteLength >= 254) {
			console.error('CSSPropertyIdx in the MapBuffer would have been out of bounds.', 'Operation Cancelled...');
			return;
		}
		this.occupancySetter(propertyName, true);
		this._buffer[this.propAddresses[this.propertiesStaticMap[propertyName]] * this.itemSize] = propertyValue;

		this._byteLength += this.itemSize;
	}
	occupancySolver(propertyName) {
		return this.propAddresses[this.propertiesStaticMap[propertyName]] !== 255;
	}
	occupancySetter(propertyName, isSet) {
		this.propAddresses[this.propertiesStaticMap[propertyName]] = isSet ? this._byteLength : (this.unfragmentBuffer(1) && 255);
	}
	unfragmentBuffer(removedCount) {
		// Loop over occupancy and collect all props that have an address smaller than (this._byteCount - removedCOunt)
		return true;
	}
}


MemoryMapBuffer.prototype.setLogicForTraverseAndJump = MemoryBufferStack.prototype.setLogicForTraverseAndJump;
MemoryMapBuffer.prototype.getBranchlessLoop = MemoryBufferStack.prototype.getBranchlessLoop;
MemoryMapBuffer.prototype.BranchesAsArray = MemoryBufferStack.prototype.BranchesAsArray ;
MemoryMapBuffer.prototype.JumperHost = MemoryBufferStack.prototype.JumperHost;
MemoryMapBuffer.prototype.OccupancySolver = MemoryBufferStack.prototype.OccupancySolver;
MemoryMapBuffer.prototype.arrayMin = MemoryBufferStack.prototype.arrayMin;
MemoryMapBuffer.prototype.DoArrayMinFunction = MemoryBufferStack.prototype.DoArrayMinFunction;









export default MemoryMapBuffer;