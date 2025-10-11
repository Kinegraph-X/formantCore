import BinarySlice from './BinarySlice.js';


/**
 * BinarySchemaFactory is a utility class for creating binary data schemas 
 * with named properties and fixed offsets.
 * 
 * It enables efficient, structured access to binary buffers 
 * by defining property locations and sizes once, 
 * then reusing those definitions across instances—
 * reducing memory and improving performance.
 * 
 * One primary use of BinarySchemaFactory is in CSSSelectorsList, 
 * where it defines a binary layout for compacted CSS selector data.
 */

/**
 * KeysFromTuple<T> — given a readonly tuple of string literals,
 * T[number] yields the union of those literal names.
 */
// type KeysFromTuple<T extends readonly string[]> = T[number];

/**
 * BinarySchema built from a tuple-like props parameter.
 * T is the readonly tuple of property names.
 * 
 * Represents the structure of a binary schema, with each property describing a slice
 * and metadata stored on its prototype.
 */
export type BinarySchemaFromTuple<T extends readonly string[]> = {
  readonly objectType: 'BinarySchema';
  /** Schema name identifier */
  readonly _name: string;
  /** Total computed byte size for all properties */
  readonly size: number;
} & {
  /** Dynamically generated binary slice properties */
  readonly [K in T[number]]: BinarySlice;
};

/**
 * BinarySchema built from an object map of BinarySlice values.
 * T is the original mapping type (keys must be strings).
 */
// export type BinarySchemaFromMap<T extends Record<string, BinarySlice>> = {
//   readonly objectType: 'BinarySchema';
//   readonly _name: string;
//   /** Total computed byte size for all properties */
//   readonly size: number;
// } & T;

export type BinarySchema<T extends readonly string[]> = BinarySchemaFromTuple<T>


/**
 * Static factory for generating binary schemas from property definitions.
 * 
 * This is the type-safe rewrite of the legacy `BinarySchemaFactory`.
 * 
 * It consumes a static property list (declared `as const`) and
 * either:
 *  - generates {@link BinarySlice}s given per-property sizes, or
 *  - consumes already-instantiated `BinarySlice` definitions.
 *
 * Example:
 * ```ts
 * const cssProps = [
 *   'tokenType',
 *   'propertyValue',
 *   'propertyType',
 *   'repr',
 *   'reprLength',
 *   'unit',
 *   'isInitialValue'
 * ] as const;
 *
 * const cssSchema = BinarySchemaFactory.createSchema(cssProps, [1, 2, 1, 32, 1, 2, 1], 'CSSSchema');
 * ```
 */
export class BinarySchemaFactory {
  static readonly objectType = 'BinarySchemaFactory';
  static reservedNames = new Set(['objectType', '_name', 'size']);

  private constructor() {
    throw new Error('BinarySchemaFactory is a static class and cannot be instantiated.');
  }

  /**
   * Create a new binary schema instance from a list of property names and byte sizes.
   * @param props - A readonly list of property names (`as const`).
   * @param sizes - The corresponding byte lengths.
   * @param name - The logical name of the schema (used for debugging and metadata).
   * @returns A typed schema object with prototype metadata and BinarySlice properties.
   */
  static createSchema<const T extends readonly string[]>(
    props: T,
    sizes: readonly number[],
    name: string
  ): BinarySchemaFromTuple<T> {
    if (props.length !== sizes.length) {
      throw new Error(`BinarySchemaFactory: props and sizes arrays must have equal length`);
    }

    // Create the dynamic schema object
    const schema = Object.create(null) as Record<string, BinarySlice>;
    let offset = 0;

    for (let i = 0; i < props.length; i++) {
      const propName = props[i];
      const propSize = sizes[i];
      schema[propName] = new BinarySlice(offset, propSize);
      offset += propSize;
    }

    // Define metadata on the prototype (ensuring no name collision)
    for (const prop of props) {
      if (BinarySchemaFactory.reservedNames.has(prop)) {
        throw new Error(
          `BinarySchemaFactory: property name "${prop}" collides with reserved metadata keys`
        );
      }
    }

    const proto = {
      objectType: 'BinarySchema' as const,
      _name: name,
      size: offset,
    };

    Object.setPrototypeOf(schema, proto);

    return schema as unknown as BinarySchemaFromTuple<T>;
  }

  /**
   * Creates a binary schema directly from an object literal
   * of pre-instantiated BinarySlice values.
   * 
   * This overload is useful when constructing slices manually.
   *
   * @param name - Schema name for identification.
   * @param sliceMap - Object literal mapping property names to BinarySlice instances.
   */
//   static fromSlices<const T extends Record<string, BinarySlice>>(
//     name: string,
//     sliceMap: T
//   ): BinarySchemaFromMap<T> {
//     const props = Object.keys(sliceMap);

//     let size = 0;
//     for (const slice of Object.values(sliceMap)) {
//       size = Math.max(size, slice.start + slice.length);
//     }

//     for (const prop of props) {
//       if (BinarySchemaFactory.reservedNames.has(prop)) {
//         throw new Error(
//           `BinarySchemaFactory: property name "${prop}" collides with reserved metadata keys`
//         );
//       }
//     }

//     const proto = {
//       objectType: 'BinarySchema' as const,
//       _name: name,
//       size,
//     };

//     Object.setPrototypeOf(sliceMap, proto);
//     return sliceMap as unknown as BinarySchemaFromMap<T>;
//   }
}
