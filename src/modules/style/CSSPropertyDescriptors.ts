/**
 * @constructor CSSPropertyDescriptors
 */

type CSSPropertyDescriptorType = {
	propName : string,
	isShorthand : boolean,
	mayBeAbbreviated : boolean,
	isAlias : boolean,
	initialValue : string|number,
	expandedPropNames : string[]
}

interface CSSPropertyDescriptorMap {[key: string]: CSSPropertyDescriptorType}

export interface CSSBoundary {
	start : number,
	length : number
} 
type CSSBoundaryMap = {[key: string]: CSSBoundary}

const boundaries = {} as CSSBoundaryMap


// Derive argument type directly from the factory
type CSSPropertyDescriptorFactoryArgs = Parameters<typeof CSSPropertyDescriptorFactory>;

/**
 * @param {string} attrName
 * @param {string|number} initialValue
 * @param {boolean} isShorthand
 * @param {string[]} expandedPropNames
 * @param {boolean} mayBeAbbreviated
 * @param {boolean} [isAlias]
 * @returns {CSSPropertyDescriptorType & {propName : T}}
 */
export const CSSPropertyDescriptorFactory = <T extends string>(
	propName : T,
	initialValue : string|number,
	isShorthand : boolean,
	expandedPropNames : string[],
	mayBeAbbreviated : boolean,
	isAlias : boolean = false
) => {
	return {
		propName,
		isShorthand,
		mayBeAbbreviated,
		isAlias,
		initialValue,
		expandedPropNames
	} satisfies CSSPropertyDescriptorType & {propName : T};
}

function buildCSSPropertyDescriptorMap<
	T extends readonly (readonly [...CSSPropertyDescriptorFactoryArgs])[]
>(tuples: T) {
	return Object.fromEntries(
		tuples.map(args => [args[0], CSSPropertyDescriptorFactory(...args as CSSPropertyDescriptorFactoryArgs)])
	) as Record<T[number][0], ReturnType<typeof CSSPropertyDescriptorFactory>>;
}




// Our master list — the *only* source of truth
export const inheritedCSSPropertyTuples = [
	['writingMode', '', false, [], false, false],
	['textDirection', '', false, [], false, false],
	['direction', '', false, [], false, false],
	['captionSide', '', false, [], false, false],
	['listStyleType', '', false, [], false, false],
	['listStylePosition', '', false, [], false, false],
	['visibility', '', false, [], false, false],
	['font', '', true, ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle'], false, false],
	['fontFamily', '', false, [], false, false],
	['fontSize', '', false, [], false, false],
	['fontWeight', '', false, [], false, false],
	['fontStyle', '', false, [], false, false],
	['fontVariant', '', false, [], false, false],
	['fontFeatureSettings', '', false, [], false, false],
	['lineHeight', '', false, [], false, false],
	['color', '#000000', false, [], false, false],
	['textOrientation', '', false, [], false, false],
	['textAlign', '', false, ['textAlignAll', 'textAlignLast'], false, false],
	['textAlignAll', '', false, [], false, false],
	['textAlignLast', '', false, [], false, false],
	['textTransform', '', false, [], false, false],
	['textDecoration', '', false, [], false, false],
	['textShadow', '', false, [], false, false],
	['cursor', 'auto', false, [], false, false],
	['pointerEvents', 'auto', false, [], false, false],
	['borderCollapse', '', false, [], false, false],
	['whiteSpace', '', false, [], false, false],
	['speak', 'auto', false, [], false, false],
	['wordBreak', 'normal', false, [], false, false],
	['wordSpacing', 'normal', false, [], false, false],
	['lineBreak', 'auto', false, [], false, false],
	['hyphens', 'manual', false, [], false, false],
	['overflowWrap', 'auto', false, [], false, false],
	['wordWrap', 'auto', false, [], false, false],
	['letterSpacing', 'normal', false, [], false, false],
	['fontVariantLigatures', '', false, [], false, false],
	['WebkitFontSmoothing', '', false, [], false, false],
	['WebkitFontFeatureSettings', '', false, [], false, false],
	['WebkitFontVariantLigatures', '', false, [], false, false],
	['WebkitTapHighlightColor', 'black', false, [], false, false],
] as const satisfies readonly CSSPropertyDescriptorFactoryArgs[];

export const inheritedCSSPropertyDescriptors = buildCSSPropertyDescriptorMap(inheritedCSSPropertyTuples);
export type InheritedCSSPropertyName = typeof inheritedCSSPropertyTuples[number][0];
export const inheritedCSSPropertyKeys = inheritedCSSPropertyTuples.map(t => t[0]) as readonly InheritedCSSPropertyName[];
boundaries.inheritedSupportedCSSProperties = {
	start : 0,
	length : Object.keys(inheritedCSSPropertyDescriptors).length
};



export const otherCSSPropertyTuples = [
  ['src', '', false, [], false, false],
  ['display', 'inline', false, [], false, false],
  ['overflow', 'visible', false, [], false, false],
  ['overflowX', '', false, [], false, false],
  ['overflowY', '', false, [], false, false],
  ['verticalAlign', 'baseline', false, [], false, false],
  ['clear', '', false, [], false, false],
  ['float', '', false, [], false, false],
  ['position', '', false, [], false, false],
  ['resize', 'none', false, [], false, false],
  ['flex', '0 1 auto', true, ['flexGrow','flexShrink','flexBasis'], false, false],
  ['flexFlow', 'row nowrap', true, ['flexDirection','flexWrap'], false, false],
  ['flexDirection', 'row', false, [], false, false],
  ['flexWrap', 'nowrap', false, [], false, false],
  ['flexGrow', 0, false, [], false, false],
  ['flexShrink', 1, false, [], false, false],
  ['flexBasis', 'auto', false, [], false, false],
  ['justifyContent', 'flex-start', false, [], false, false],
  ['alignItems', 'stretch', false, [], false, false],
  ['alignSelf', 'auto', false, [], false, false],
  ['alignContent', 'stretch', false, [], false, false],
  ['gap', 'normal', false, [], false, false],
  ['gridTemplateRows', '', false, [], false, false],
  ['gridTemplateColumns', '', false, [], false, false],
  ['gridRow', '', false, [], false, false],
  ['gridColumn', '', false, [], false, false],
  ['tabSize', '', false, [], false, false],
  ['MozTabSize', '', false, [], false, false],
  ['opacity', '1', false, [], false, false],
  ['zIndex', '1', false, [], false],
  /* Formerly Box Model */
  ['boxSizing', 'content-box', false, [], false, false],
  ['MozBoxSizing', 'content-box', false, [], false, false],
  ['width', 'auto', false, [], false, false],
  ['height', 'auto', false, [], false, false],
  ['minWidth', 'auto', false, [], false, false],
  ['minHeight', 'auto', false, [], false, false],
  ['maxWidth', 'auto', false, [], false, false],
  ['maxHeight', 'auto', false, [], false, false],
  ['top', 'auto', false, [], false, false],
  ['left', 'auto', false, [], false, false],
  ['right', 'auto', false, [], false, false],
  ['bottom', 'auto', false, [], false, false],
  ['padding', 0, true, ['paddingBlockStart','paddingInlineEnd','paddingBlockEnd','paddingInlineStart'], true],
  ['margin', 0, true, ['marginBlockStart','marginInlineEnd','marginBlockEnd','marginInlineStart'], true],
  ['border', 0, true, ['borderWidth','borderStyle','borderColor'], false, false],
  ['paddingTop', 0, false, ['paddingBlockStart'], false, true],
  ['paddingRight', 0, false, ['paddingInlineEnd'], false, true],
  ['paddingBottom', 0, false, ['paddingBlockEnd'], false, true],
  ['paddingLeft', 0, false, ['paddingInlineStart'], false, true],
  ['paddingBlockStart', 0, false, [], false, false],
  ['paddingInlineEnd', 0, false, [], false, false],
  ['paddingBlockEnd', 0, false, [], false, false],
  ['paddingInlineStart', 0, false, [], false, false],
  ['marginTop', 0, false, ['marginBlockStart'], false, true],
  ['marginRight', 0, false, ['marginInlineEnd'], false, true],
  ['marginBottom', 0, false, ['marginBlockEnd'], false, true],
  ['marginLeft', 0, false, ['marginInlineStart'], false, true],
  ['marginBlockStart', 0, false, [], false, false],
  ['marginBlockEnd', 0, false, [], false, false],
  ['marginInlineStart', 0, false, [], false, false],
  ['marginInlineEnd', 0, false, [], false, false],
  ['borderTop', '0 medium #000000', false, ['borderBlockStart'], false, true],
  ['borderRight', '0 medium #000000', false, ['borderInlineEnd'], false, true],
  ['borderBottom', '0 medium #000000', false, ['borderBlockEnd'], false, true],
  ['borderLeft', '0 medium #000000', false, ['borderInlineStart'], false, true],
  ['borderBlockStart', '0 medium #000000', true, ['borderBlockStartWidth','borderBlockStartStyle','borderBlockStartColor'], false, false],
  ['borderBlockEnd', '0 medium #000000', true, ['borderBlockEndWidth','borderBlockEndStyle','borderBlockEndColor'], false, false],
  ['borderInlineStart', '0 medium #000000', true, ['borderInlineStartWidth','borderInlineStartStyle','borderInlineStartColor'], false, false],
  ['borderInlineEnd', '0 medium #000000', true, ['borderInlineEndWidth','borderInlineEndStyle','borderInlineEndColor'], false, false],
  ['borderWidth', 0, true, ['borderBlockStartWidth','borderInlineEndWidth','borderBlockEndWidth','borderInlineStartWidth'], true],
  ['borderBlockStartWidth', 0, false, [], false, false],
  ['borderBlockEndWidth', 0, false, [], false, false],
  ['borderInlineStartWidth', 0, false, [], false, false],
  ['borderInlineEndWidth', 0, false, [], false, false],
  ['borderStyle', 'none', true, ['borderBlockStartStyle','borderInlineEndStyle','borderBlockEndStyle','borderInlineStartStyle'], true],
  ['borderBlockStartStyle', 'none', false, [], false, false],
  ['borderBlockEndStyle', 'none', false, [], false, false],
  ['borderInlineStartStyle', 'none', false, [], false, false],
  ['borderInlineEndStyle', 'none', false, [], false, false],
  ['borderColor', '#000000', true, ['borderBlockStartColor','borderInlineEndColor','borderBlockEndColor','borderInlineStartColor'], true],
  ['borderBlockStartColor', '#000000', false, [], false, false],
  ['borderBlockEndColor', '#000000', false, [], false, false],
  ['borderInlineStartColor', '#000000', false, [], false, false],
  ['borderInlineEndColor', '#000000', false, [], false, false],
  ['borderRadius', '', true, ['borderStartStartRadius','borderEndStartRadius','borderEndEndRadius','borderStartEndRadius'], true, false],
  ['MozBorderRadius', '', true, ['borderStartStartRadius','borderEndStartRadius','borderEndEndRadius','borderEndStartRadius'], false, false],
  ['WebkitBorderRadius', '', true, ['borderStartStartRadius','borderEndStartRadius','borderEndEndRadius','borderEndStartRadius'], false, false],
  ['borderTopLeftRadius', '', false, [], false, false],
  ['borderTopRightRadius', '', false, [], false, false],
  ['borderBottomRightRadius', '', false, [], false, false],
  ['borderBottomLeftRadius', '', false, [], false, false],
  ['borderStartStartRadius', '', false, [], false, false],
  ['borderEndStartRadius', '', false, [], false, false],
  ['borderEndEndRadius', '', false, [], false, false],
  ['borderStartEndRadius', '', false, [], false],
  /* Formerly local properties */
  ['background', 'transparent', true, ['backgroundColor','backgroundImage','backgroundRepeat','backgroundPosition','backgroundAttachment','backgroundOrigin','backgroundClip'], false, false],
  ['backgroundColor', 'transparent', false, [], false, false],
  ['objectFit', 'fill', false, [], false, false],
  ['backgroundPosition', '0% 0%', true, ['backgroundPositionY','backgroundPositionX'], false, false],
  ['backgroundPositionX', '0%', false, [], false, false],
  ['backgroundPositionY', '0%', false, [], false, false],
  ['backgroundSize', 'auto auto', true, [], false, false],
  ['backgroundImage', 'none', false, [], false, false],
  ['backgroundAttachment', '', false, [], false, false],
  ['backgroundRepeat', 'repeat', false, [], false, false],
  ['backgroundOrigin', 'repeat', false, [], false, false],
  ['backgroundClip', 'repeat', false, [], false, false],
  ['boxShadow', 'none', false, [], false, false],
  ['outline', '', false, ['outlineColor','outlineStyle','outlineWidth'], false, false],
  ['outlineColor', 'none', false, ['outlineColorBlockStart','outlineColorInlineEnd','outlineColorBlockEnd','outlineColorInlineStart'], false],
  ['outlineStyle', 'none', false, ['outlineStyleBlockStart','outlineStyleInlineEnd','outlineStyleBlockEnd','outlineStyleInlineStart'], false],
  ['outlineWidth', 'none', false, ['outlineWidthBlockStart','outlineWidthInlineEnd','outlineWidthBlockEnd','outlineWidthInlineStart'], false],
  ['outlineColorBlockStart', 0, false, [], false, false],
  ['outlineColorInlineEnd', 0, false, [], false, false],
  ['outlineColorBlockEnd', 0, false, [], false, false],
  ['outlineColorInlineStart', 0, false, [], false, false],
  ['outlineStyleBlockStart', 0, false, [], false, false],
  ['outlineStyleInlineEnd', 0, false, [], false, false],
  ['outlineStyleBlockEnd', 0, false, [], false, false],
  ['outlineStyleInlineStart', 0, false, [], false, false],
  ['outlineWidthBlockStart', 0, false, [], false, false],
  ['outlineWidthInlineEnd', 0, false, [], false, false],
  ['outlineWidthBlockEnd', 0, false, [], false, false],
  ['outlineWidthInlineStart', 0, false, [], false, false],
  ['content', 'normal', false, [], false, false],
  ['animation', 'normal', false, [], false, false],
  ['animationName', 'none', false, [], false, false],
  ['animationDuration', '1', false, [], false, false],
  ['animationIterationCount', '1', false, [], false, false],
  ['animationIterationFunction', '', false, [], false, false],
  ['animationTimingFunction', '', false, [], false, false],
  ['animationDelay', '0', false, [], false, false]
] as const satisfies readonly CSSPropertyDescriptorFactoryArgs[];

export const otherCSSPropertyDescriptors = buildCSSPropertyDescriptorMap(otherCSSPropertyTuples);
export type OtherCSSPropertyName = typeof otherCSSPropertyTuples[number][0];
export const otherCSSPropertyKeys = otherCSSPropertyTuples.map(t => t[0]) as readonly OtherCSSPropertyName[];
boundaries.otherSupportedCSSProperties = {
	start : 0,
	length : boundaries.ineritedCSSPropertyDescriptors.length + Object.keys(otherCSSPropertyDescriptors).length
};

// DEBUG: allSupportedCSSProperties is the complete list of attributes for a given CSS rule
export type AllSupportedCSSPropertyNames = InheritedCSSPropertyName | OtherCSSPropertyName;
export const allCSSPropertyKeys = [...otherCSSPropertyKeys, ...inheritedCSSPropertyKeys] as readonly AllSupportedCSSPropertyNames[];
boundaries.allSupportedCSSProperties = {
	start : 0,
	length : boundaries.ineritedCSSPropertyDescriptors.length + boundaries.otherCSSPropertyDescriptors.length
}

export const bufferBoundaries = boundaries;

/**
 * enumeration of CSS property groups
 */
export type CSSCategory = 'inheritedProperties'|'otherProperties' 

/** 
 *  runtime enumeration of CSS property groups
 * @type {{[key: string]: CSSCategory}}
 */
export const categories = {
	inheritedProperties : 'inheritedProperties',
	otherProperties : 'otherProperties',
}

export const splittedCSSPropertyDescriptors = {
	inheritedProperties : inheritedCSSPropertyDescriptors,
	otherProperties : otherCSSPropertyDescriptors
} as Record<CSSCategory, CSSPropertyDescriptorMap>

export const CSSPropertyDescriptors = Object.assign({}, inheritedCSSPropertyDescriptors, otherCSSPropertyDescriptors) as CSSPropertyDescriptorMap


export const propToCategory = new Map(Object.entries(splittedCSSPropertyDescriptors).flatMap(([cat, map]) => Object.keys(map).map(p => [p, cat])));


