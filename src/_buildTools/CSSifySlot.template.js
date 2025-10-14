/**
 * CSSifySlot.template.js
 * -----------------------
 * Defines reusable ES template fragments used by the CSSify-from-DB Rollup plugin.
 * 
 * Each exported template is a deferred template literal: it’s a function
 * that, when invoked with arguments, generates a code snippet to be injected
 * into a component source file.
 * 
 * No caching logic is used anymore — all templates define explicit style blocks.
 */

/**
 * Helper: Defer the execution of a tagged template literal.
 * Returns a function that, when called, interpolates the given values.
 * "otherStrings" is the rest of the original string-chunks-array, re-affected as an array
 * @param {string} firstStringChunk
 * @param {...unknown} discardedExpressions
 */
function defer(/** @type {TemplateStringsArray} */  [firstStringChunk, ...otherStrings], ...discardedExpressions) {
	/** @param {string[]} values*/
  return (...values) => otherStrings.reduce((acc, str, i) => acc + values[i] + str, firstStringChunk);
}

/**
 * Exported templates:
 * 
 * @example
 * CSSifyTemplates[0]("mybuttonStyles_a2b4f6c1", "MyButton", "{ color: 'red' }")
 * // =>
 * "const mybuttonStyles_a2b4f6c1 = [
 *    /** @CSSifySlot styleSlotName : MyButton *\/
 *    { color: 'red' }
 * ];"
 *
 * CSSifyTemplates[1]("mybuttonStyles_a2b4f6c1")
 * // =>
 * "\n  sWrapper : CreateStyle(mybuttonStyles_a2b4f6c1)"
 * 
 */
export default [
  // Template 0: styles array
  defer`
  	/* @CSSifySlot styleSlotName : ${null} */
    const ${null}Styles = ${null};`,
  // Template 1: style wrapper creation
  defer`
    sWrapper : CreateStyle(${null}Styles)`
];
