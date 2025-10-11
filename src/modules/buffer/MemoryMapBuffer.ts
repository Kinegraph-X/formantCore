/**
 * @constructor MemoryMapBuffer
 */

/**
 * MemoryMapBuffer.ts
 *
 * TypeScript rewrite of the original MemoryMapBuffer with proper imports
 * from MemoryBufferStackDependencies and full JSDoc documentation.
 *
 * This class extends MemoryBufferStack logically, inheriting its traversal
 * and branchless utilities rather than reassigning them manually.
 */

import MemoryBufferStack from './MemoryBufferStack';

/**
 * @class MemoryMapBuffer
 * @extends MemoryBufferStack
 * @classdesc Specialized buffer used for property-indexed memory mapping.
 * Maintains an address map for named properties and their occupancy state.
 */
export default class MemoryMapBuffer extends MemoryBufferStack {
  /** string tag preserved from original */
  static objectType = 'MemoryMapBuffer';

  /** Mapping of property access groups and boundaries (unused placeholder). */
  propertiesAccessGroupsBoudaries: Record<string, unknown> = {};

  /** Address lookup table (1 byte per property). Value 255 = uninitialized. */
  propAddresses: Uint8Array;

  /** Static property index map. Expected to be externally populated. */
  propertiesStaticMap: Record<string, number> = {};

  /** Total used bytes. */
  _byteLength: number = 0;

  /** Size of each item (byte count). */
  itemSize: number;

  /**
   * Construct the memory map buffer.
   * @param itemSize - bytes per property value
   * @param length - number of properties supported
   */
  constructor(itemSize: number, length: number) {
    super(itemSize, length, true);

    this._byteLength = length;
    this.propAddresses = new Uint8Array(length).fill(255);
    this.itemSize = itemSize;
    this._buffer = new Uint8Array(length * itemSize);
  }

  /**
   * Retrieve a property value by its name, if it exists in the static map and is occupied.
   * @param propertyName - property identifier
   * @returns The stored byte value (first byte of item) or undefined if missing.
   */
  getProperty(propertyName: string): number | undefined {
    if (typeof this.propertiesStaticMap[propertyName] === 'undefined') {
      console.warn(
        'MemoryMapBuffer:get',
        `The requested property ${propertyName} is not implemented. Returning...`
      );
      return;
    }

    const occupied = this.occupancySolver(propertyName);
    if (!occupied) return;

    const addressIdx = this.propAddresses[this.propertiesStaticMap[propertyName]];
    return this._buffer[addressIdx * this.itemSize];
  }

  /**
   * Set a property value by name. Automatically updates occupancy and appends if needed.
   * @param propertyName - name of the property to set
   * @param propertyValue - numeric byte to write at that property's address
   */
  setProperty(propertyName: string, propertyValue: number): void {
    if (typeof this.propertiesStaticMap[propertyName] === 'undefined') {
      console.warn(
        'MemoryMapBuffer:set',
        `The requested property ${propertyName} is not implemented. Returning...`
      );
      return;
    }

    if (this._byteLength >= 254) {
      console.error(
        'CSSPropertyIdx in the MapBuffer would have been out of bounds. Operation cancelled.'
      );
      return;
    }

    this.occupancySetter(propertyName, true);
    const addressIdx = this.propAddresses[this.propertiesStaticMap[propertyName]];
    this._buffer[addressIdx * this.itemSize] = propertyValue;
    this._byteLength += this.itemSize;
  }

  /**
   * Check whether a given property name is currently marked as occupied.
   * @param propertyName - name to query
   * @returns true if property is assigned, false otherwise
   */
  occupancySolver(propertyName: string): boolean {
    const idx = this.propertiesStaticMap[propertyName];
    return this.propAddresses[idx] !== 255;
  }

  /**
   * Set or clear the occupancy flag for a property.
   * @param propertyName - name of the property
   * @param isSet - whether to set or clear the flag
   */
  occupancySetter(propertyName: string, isSet: boolean): void {
    const idx = this.propertiesStaticMap[propertyName];
    this.propAddresses[idx] = isSet ? this._byteLength : 0;
  }

  /**
   * Placeholder method for compacting/unfragmenting the property buffer.
   * In a real implementation, this would rebuild the propAddresses table.
   * @param removedCount - number of removed properties
   * @returns true (currently a stub)
   */
  unfragmentBuffer(removedCount: number): boolean {
    // TODO: Implement defragmentation logic when removing properties
    return true;
  }
}


// import MemoryBufferStack from './MemoryBufferStack.js';

// class MemoryMapBuffer {
// 	static objectType = 'MemoryMapBuffer';
// 	propertiesAccessGroupsBoudaries = {};

// 	constructor(itemSize, length) {
// 		this.objectType = 'MemoryMapBuffer';

// 		this.propAddresses = (new Uint8Array(length)).fill(255);
// 		this.itemSize = itemSize;
// 		this._buffer = new Uint8Array(length * itemSize);

// 		this.traverseAndJumpFunction = this.setLogicForTraverseAndJump();
// 		this.branchlessLoop = this.getBranchlessLoop();

// 	}
// 	getProperty(propertyName) {

// 		if (typeof this.propertiesStaticMap[propertyName] === 'undefined') {
// 			console.warn('MemoryMapBuffer:get', 'The requested property ' + propertyName + 'is not implemented', 'Returning...');
// 			return;
// 		}

// 		return this.occupancySolver(propertyName)
// 			&& this._buffer[this.propAddresses[this.propertiesStaticMap[propertyName]] * this.itemSize];
// 	}
// 	setProperty(propertyName, propertyValue) {
// 		if (typeof this.propertiesStaticMap[propertyName] === 'undefined') {
// 			console.warn('MemoryMapBuffer:set', 'The requested property ' + propertyName + 'is not implemented', 'Returning...');
// 			return;
// 		}

// 		if (this._byteLength >= 254) {
// 			console.error('CSSPropertyIdx in the MapBuffer would have been out of bounds.', 'Operation Cancelled...');
// 			return;
// 		}
// 		this.occupancySetter(propertyName, true);
// 		this._buffer[this.propAddresses[this.propertiesStaticMap[propertyName]] * this.itemSize] = propertyValue;

// 		this._byteLength += this.itemSize;
// 	}
// 	occupancySolver(propertyName) {
// 		return this.propAddresses[this.propertiesStaticMap[propertyName]] !== 255;
// 	}
// 	occupancySetter(propertyName, isSet) {
// 		this.propAddresses[this.propertiesStaticMap[propertyName]] = isSet ? this._byteLength : (this.unfragmentBuffer(1) && 255);
// 	}
// 	unfragmentBuffer(removedCount) {
// 		// Loop over occupancy and collect all props that have an address smaller than (this._byteCount - removedCOunt)
// 		return true;
// 	}
// }


// MemoryMapBuffer.prototype.setLogicForTraverseAndJump = MemoryBufferStack.prototype.setLogicForTraverseAndJump;
// MemoryMapBuffer.prototype.getBranchlessLoop = MemoryBufferStack.prototype.getBranchlessLoop;
// MemoryMapBuffer.prototype.BranchesAsArray = MemoryBufferStack.prototype.BranchesAsArray ;
// MemoryMapBuffer.prototype.JumperHost = MemoryBufferStack.prototype.JumperHost;
// MemoryMapBuffer.prototype.OccupancySolver = MemoryBufferStack.prototype.OccupancySolver;
// MemoryMapBuffer.prototype.arrayMin = MemoryBufferStack.prototype.arrayMin;
// MemoryMapBuffer.prototype.DoArrayMinFunction = MemoryBufferStack.prototype.DoArrayMinFunction;









// export default MemoryMapBuffer;