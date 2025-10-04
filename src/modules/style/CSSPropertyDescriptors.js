/**
 * @constructor CSSPropertyDescriptors
 */

/**
 * @typedef {{[key: string]: string|string[]|boolean|number}} CSSPropertyDescriptorType
 */

/** @type {{[key: string]: CSSPropertyDescriptorType}} */
var CSSPropertyDescriptors = {};

/** @type {{[key: string]: {[key: string]: CSSPropertyDescriptorType}}} */
var SplittedCSSPropertyDescriptors = {};

/**
 * @param {string} attrName
 * @param {string|number} initialValue
 * @param {boolean} isShorthand
 * @param {string[]} expandedPropNames
 * @param {boolean} mayBeAbbreviated
 * @param {boolean} [isAlias]
 * @returns {CSSPropertyDescriptorType}
 */
var CSSPropertyDescriptorFactory = function(attrName, initialValue, isShorthand, expandedPropNames, mayBeAbbreviated, isAlias = false) {
	
	/** @type {CSSPropertyDescriptorType} */
	const CSSPropertyDescriptor = {
		propName : attrName,
		isShorthand : isShorthand,
		mayBeAbbreviated : mayBeAbbreviated,
		isAlias : isAlias,
		initialValue : initialValue,
		expandedPropNames : expandedPropNames
	};

	CSSPropertyDescriptors[attrName] = CSSPropertyDescriptor;
	
	return CSSPropertyDescriptor;
}

SplittedCSSPropertyDescriptors.inheritedAttributes = {
	writingMode : CSSPropertyDescriptorFactory('writingMode', '', false, [], false, false),
	textDirection : CSSPropertyDescriptorFactory('textDirection', '', false, [], false, false),
	direction : CSSPropertyDescriptorFactory('direction', '', false, [], false, false),
	captionSide : CSSPropertyDescriptorFactory('captionSide', '', false, [], false, false),
	listStyleType : CSSPropertyDescriptorFactory('listStyleType', '', false, [], false, false),
	listStylePosition : CSSPropertyDescriptorFactory('listStylePosition', '', false, [], false, false),
	visibility : CSSPropertyDescriptorFactory('visibility', '', false, [], false, false),
	font : CSSPropertyDescriptorFactory('font', '', true, ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle'], false, false),
	fontFamily : CSSPropertyDescriptorFactory('fontFamily', '', false, [], false, false),
	fontSize : CSSPropertyDescriptorFactory('fontSize', '', false, [], false, false),
	fontWeight  : CSSPropertyDescriptorFactory('fontWeight', '', false, [], false, false),
	fontStyle : CSSPropertyDescriptorFactory('fontStyle', '', false, [], false, false),
	fontVariant : CSSPropertyDescriptorFactory('fontVariant', '', false, [], false, false),
	fontFeatureSettings : CSSPropertyDescriptorFactory('fontFeatureSettings', '', false, [], false, false),
	src : CSSPropertyDescriptorFactory('src', '', false, [], false, false),	// only present in a @font-face rule
	lineHeight : CSSPropertyDescriptorFactory('lineHeight', '', false, [], false, false),
	color : CSSPropertyDescriptorFactory('color', '#000000', false, [], false, false), // the CSS spec says "depends on the user-agent" : https://www.w3.org/TR/2011/REC-CSS2-20110607/propidx.html#q24.0
	textOrientation : CSSPropertyDescriptorFactory('textOrientation', '', false, [], false, false),
	textAlign : CSSPropertyDescriptorFactory('textAlign', '', false, ['textAlignAll', 'textAlignLast'], false, false),
	textAlignAll : CSSPropertyDescriptorFactory('textAlignAll', '', false, [], false, false),
	textAlignLast : CSSPropertyDescriptorFactory('textAlignLast', '', false, [], false, false),
	textTransform : CSSPropertyDescriptorFactory('textTransform', '', false, [], false, false),
	textDecoration : CSSPropertyDescriptorFactory('textDecoration', '', false, [], false, false),
	textShadow : CSSPropertyDescriptorFactory('textShadow', '', false, [], false, false),
	cursor : CSSPropertyDescriptorFactory('cursor', 'auto', false, [], false, false),
	pointerEvents : CSSPropertyDescriptorFactory('pointerEvents', 'auto', false, [], false, false),
	borderCollapse : CSSPropertyDescriptorFactory('borderCollapse', '', false, [], false, false),
	whiteSpace : CSSPropertyDescriptorFactory('whiteSpace', '', false, [], false, false),
	speak : CSSPropertyDescriptorFactory('speak', 'auto', false, [], false, false),									// auto | always | never
	wordBreak : CSSPropertyDescriptorFactory('wordBreak', 'normal', false, [], false, false),
	wordSpacing : CSSPropertyDescriptorFactory('wordSpacing', 'normal', false, [], false, false),
	lineBreak : CSSPropertyDescriptorFactory('lineBreak', 'auto', false, [], false, false),
	hyphens : CSSPropertyDescriptorFactory('hyphens', 'manual', false, [], false, false),
	overflowWrap : CSSPropertyDescriptorFactory('overflowWrap', 'auto', false, [], false, false),						// The wordWrap property is an alias for overflowWrap
	wordWrap : CSSPropertyDescriptorFactory('wordWrap', 'auto', false, [], false, false),								// The overflowWrap property is an alias for wordWrap
	letterSpacing : CSSPropertyDescriptorFactory('letterSpacing', 'normal', false, [], false, false),					// normal | <length>
	fontVariantLigatures : CSSPropertyDescriptorFactory('fontVariantLigatures', '', false, [], false, false),
	// dash-prefixed properties (specific to a UA) are rendered with an Uppercase first letter by our translation function
	WebkitFontSmoothing : CSSPropertyDescriptorFactory('WebkitFontSmoothing', '', false, [], false, false),
	WebkitFontFeatureSettings : CSSPropertyDescriptorFactory('WebkitFontFeatureSettings', '', false, [], false, false),
	WebkitFontVariantLigatures : CSSPropertyDescriptorFactory('WebkitFontVariantLigatures', '', false, [], false, false),
	
	WebkitTapHighlightColor : CSSPropertyDescriptorFactory('WebkitTapHighlightColor', 'black', false, [], false)
}

SplittedCSSPropertyDescriptors.locallyEffectiveAttributes = {
	display : CSSPropertyDescriptorFactory('display', 'inline', false, [], false, false),
	overflow : CSSPropertyDescriptorFactory('overflow', 'visible', false, [], false, false),
	overflowX : CSSPropertyDescriptorFactory('overflowX', '', false, [], false, false),
	overflowY : CSSPropertyDescriptorFactory('overflowY', '', false, [], false, false),
	verticalAlign : CSSPropertyDescriptorFactory('verticalAlign', 'baseline', false, [], false, false),
	clear : CSSPropertyDescriptorFactory('clear', '', false, [], false, false),
	float : CSSPropertyDescriptorFactory('float', '', false, [], false, false),
	position : CSSPropertyDescriptorFactory('position', '', false, [], false, false),
	resize : CSSPropertyDescriptorFactory('resize', 'none', false, [], false, false),
	
	flex : CSSPropertyDescriptorFactory('flex', '0 1 auto', true, ['flexGrow', 'flexShrink', 'flexBasis'], false, false),
	flexFlow : CSSPropertyDescriptorFactory('flexFlow', 'row nowrap', true, ['flexDirection', 'flexWrap'], false, false),
	flexDirection : CSSPropertyDescriptorFactory('flexDirection', 'row', false, [], false, false),
	flexWrap : CSSPropertyDescriptorFactory('flexWrap', 'nowrap', false, [], false, false),
	flexGrow : CSSPropertyDescriptorFactory('flexGrow', 0, false, [], false, false),
	flexShrink : CSSPropertyDescriptorFactory('flexShrink', 1, false, [], false, false),
	flexBasis : CSSPropertyDescriptorFactory('flexBasis', 'auto', false, [], false, false),
	justifyContent : CSSPropertyDescriptorFactory('justifyContent', 'flex-start', false, [], false, false), 
	alignItems : CSSPropertyDescriptorFactory('alignItems', 'stretch', false, [], false, false),
	alignSelf : CSSPropertyDescriptorFactory('alignSelf', 'auto', false, [], false, false),
	alignContent : CSSPropertyDescriptorFactory('alignContent', 'stretch', false, [], false, false),
	gap : CSSPropertyDescriptorFactory('gap', 'normal', false, [], false, false),
	
	gridTemplateRows : CSSPropertyDescriptorFactory('gridTemplateRows', '', false, [], false, false),
	gridTemplateColumns : CSSPropertyDescriptorFactory('gridTemplateColumns', '', false, [], false, false),
	
	gridRow : CSSPropertyDescriptorFactory('gridRow', '', false, [], false, false),
	gridColumn : CSSPropertyDescriptorFactory('gridColumn', '', false, [], false, false),
	
	tabSize : CSSPropertyDescriptorFactory('tabSize', '', false, [], false, false),
	MozTabSize : CSSPropertyDescriptorFactory('MozTabSize', '', false, [], false, false),
	
	opacity : CSSPropertyDescriptorFactory('opacity', '1', false, [], false, false),
	zIndex : CSSPropertyDescriptorFactory('zIndex', '1', false, [], false)
}

SplittedCSSPropertyDescriptors.boxModelAttributes = {
	boxSizing : CSSPropertyDescriptorFactory('boxSizing', 'content-box', false, [], false, false),
	// dash-prefixed properties (specific to a UA) are rendered with an Uppercase first letter by our translation function
	MozBoxSizing : CSSPropertyDescriptorFactory('MozBoxSizing', 'content-box', false, [], false, false),
	width : CSSPropertyDescriptorFactory('width', 'auto', false, [], false, false),
	height : CSSPropertyDescriptorFactory('height', 'auto', false, [], false, false),
	minWidth : CSSPropertyDescriptorFactory('minWidth', 'auto', false, [], false, false),
	minHeight : CSSPropertyDescriptorFactory('minHeight', 'auto', false, [], false, false),
	maxWidth : CSSPropertyDescriptorFactory('maxWidth', 'auto', false, [], false, false),
	maxHeight : CSSPropertyDescriptorFactory('maxHeight', 'auto', false, [], false, false),
	top : CSSPropertyDescriptorFactory('top', 'auto', false, [], false, false),
	left : CSSPropertyDescriptorFactory('left', 'auto', false, [], false, false),
	right : CSSPropertyDescriptorFactory('right', 'auto', false, [], false, false),
	bottom : CSSPropertyDescriptorFactory('bottom', 'auto', false, [], false, false),

	padding : CSSPropertyDescriptorFactory('padding', 0, true, ['paddingBlockStart', 'paddingInlineEnd', 'paddingBlockEnd', 'paddingInlineStart'], true),
	margin : CSSPropertyDescriptorFactory('margin', 0, true, ['marginBlockStart', 'marginInlineEnd', 'marginBlockEnd', 'marginInlineStart'], true),
	border : CSSPropertyDescriptorFactory('border', 0, true, ['borderWidth', 'borderStyle', 'borderColor'], false, false),
	
	// TODO: Should be accounted by an alias mechanism: theses props exist but are not the ones we request
	paddingTop : CSSPropertyDescriptorFactory('paddingTop', 0, false, ['paddingBlockStart'], false, true),
	paddingRight : CSSPropertyDescriptorFactory('paddingRight', 0, false, ['paddingInlineEnd'], false, true),
	paddingBottom : CSSPropertyDescriptorFactory('paddingBottom', 0, false, ['paddingBlockEnd'], false, true),
	paddingLeft : CSSPropertyDescriptorFactory('paddingLeft', 0, false, ['paddingInlineStart'], false, true),
	
	paddingBlockStart : CSSPropertyDescriptorFactory('paddingBlockStart', 0, false, [], false, false),
	paddingInlineEnd : CSSPropertyDescriptorFactory('paddingInlineEnd', 0, false, [], false, false),
	paddingBlockEnd : CSSPropertyDescriptorFactory('paddingBlockEnd', 0, false, [], false, false),
	paddingInlineStart : CSSPropertyDescriptorFactory('paddingInlineStart', 0, false, [], false, false),
	
	// TODO: Should be accounted by an alias mechanism: theses props exist but are not the ones we request
	marginTop : CSSPropertyDescriptorFactory('marginTop', 0, false, ['marginBlockStart'], false, true),
	marginRight : CSSPropertyDescriptorFactory('marginRight', 0, false, ['marginInlineEnd'], false, true),
	marginBottom : CSSPropertyDescriptorFactory('marginBottom', 0, false, ['marginBlockEnd'], false, true),
	marginLeft : CSSPropertyDescriptorFactory('marginLeft', 0, false, ['marginInlineStart'], false, true),
	
	marginBlockStart : CSSPropertyDescriptorFactory('marginBlockStart', 0, false, [], false, false),
	marginBlockEnd : CSSPropertyDescriptorFactory('marginBlockEnd', 0, false, [], false, false),
	marginInlineStart : CSSPropertyDescriptorFactory('marginInlineStart', 0, false, [], false, false),
	marginInlineEnd : CSSPropertyDescriptorFactory('marginInlineEnd', 0, false, [], false, false),
	
	// TODO: Should be accounted by an alias mechanism: theses props exist but are not the ones we request
	borderTop : CSSPropertyDescriptorFactory('borderTop', '0 medium #000000', false, ['borderBlockStart'], false, true),
	borderRight : CSSPropertyDescriptorFactory('borderRight', '0 medium #000000', false, ['borderInlineEnd'], false, true),
	borderBottom : CSSPropertyDescriptorFactory('borderBottom', '0 medium #000000', false, ['borderBlockEnd'], false, true),
	borderLeft : CSSPropertyDescriptorFactory('borderLeft', '0 medium #000000', false, ['borderInlineStart'], false, true),

	borderBlockStart : CSSPropertyDescriptorFactory('borderBlockStart', '0 medium #000000', true, ['borderBlockStartWidth', 'borderBlockStartStyle', 'borderBlockStartColor'], false, false),
	borderBlockEnd : CSSPropertyDescriptorFactory('borderBlockEnd', '0 medium #000000', true, ['borderBlockEndWidth', 'borderBlockEndStyle', 'borderBlockEndColor'], false, false),
	borderInlineStart : CSSPropertyDescriptorFactory('borderInlineStart', '0 medium #000000', true, ['borderInlineStartWidth', 'borderInlineStartStyle', 'borderInlineStartColor'], false, false),
	borderInlineEnd : CSSPropertyDescriptorFactory('borderInlineEnd', '0 medium #000000', true, ['borderInlineEndWidth', 'borderInlineEndStyle', 'borderInlineEndColor'], false, false),

	borderWidth : CSSPropertyDescriptorFactory('borderWidth', 0, true, ['borderBlockStartWidth', 'borderInlineEndWidth', 'borderBlockEndWidth', 'borderInlineStartWidth'], true),
	borderBlockStartWidth : CSSPropertyDescriptorFactory('borderBlockStartWidth', 0, false, [], false, false),
	borderBlockEndWidth : CSSPropertyDescriptorFactory('borderBlockEndWidth', 0, false, [], false, false),
	borderInlineStartWidth : CSSPropertyDescriptorFactory('borderInlineStartWidth', 0, false, [], false, false),
	borderInlineEndWidth : CSSPropertyDescriptorFactory('borderInlineEndWidth', 0, false, [], false, false),

	borderStyle : CSSPropertyDescriptorFactory('borderStyle', 'none', true, ['borderBlockStartStyle', 'borderInlineEndStyle', 'borderBlockEndStyle', 'borderInlineStartStyle'], true),
	borderBlockStartStyle : CSSPropertyDescriptorFactory('borderBlockStartStyle', 'none', false, [], false, false),
	borderBlockEndStyle : CSSPropertyDescriptorFactory('borderBlockEndStyle', 'none', false, [], false, false),
	borderInlineStartStyle : CSSPropertyDescriptorFactory('borderInlineStartStyle', 'none', false, [], false, false),
	borderInlineEndStyle : CSSPropertyDescriptorFactory('borderInlineEndStyle', 'none', false, [], false, false),

	borderColor : CSSPropertyDescriptorFactory('borderColor', '#000000', true, ['borderBlockStartColor', 'borderInlineEndColor', 'borderBlockEndColor', 'borderInlineStartColor'], true),
	borderBlockStartColor : CSSPropertyDescriptorFactory('borderBlockStartColor', '#000000', false, [], false, false),
	borderBlockEndColor : CSSPropertyDescriptorFactory('borderBlockEndColor', '#000000', false, [], false, false),
	borderInlineStartColor : CSSPropertyDescriptorFactory('borderInlineStartColor', '#000000', false, [], false, false),
	borderInlineEndColor : CSSPropertyDescriptorFactory('borderInlineEndColor', '#000000', false, [], false, false),

	borderRadius : CSSPropertyDescriptorFactory('borderRadius', '', true, ['borderStartStartRadius', 'borderEndStartRadius', 'borderEndEndRadius', 'borderStartEndRadius'], true, false),
	// dash-prefixed properties (specific to a UA) are rendered with an Uppercase first letter by our translation function
	MozBorderRadius : CSSPropertyDescriptorFactory('MozBorderRadius', '', true, ['borderStartStartRadius', 'borderEndStartRadius', 'borderEndEndRadius', 'borderEndStartRadius'], false, false),
	WebkitBorderRadius : CSSPropertyDescriptorFactory('WebkitBorderRadius', '', true, ['borderStartStartRadius', 'borderEndStartRadius', 'borderEndEndRadius', 'borderEndStartRadius'], false, false),
	borderTopLeftRadius : CSSPropertyDescriptorFactory('borderTopLeftRadius', '', false, [], false, false),
	borderTopRightRadius : CSSPropertyDescriptorFactory('borderTopRightRadius', '', false, [], false, false),
	borderBottomRightRadius : CSSPropertyDescriptorFactory('borderBottomRightRadius', '', false, [], false, false),
	borderBottomLeftRadius : CSSPropertyDescriptorFactory('borderBottomLeftRadius', '', false, [], false, false),
	borderStartStartRadius : CSSPropertyDescriptorFactory('borderStartStartRadius', '', false, [], false, false),
	borderEndStartRadius : CSSPropertyDescriptorFactory('borderEndStartRadius', '', false, [], false, false),
	borderEndEndRadius : CSSPropertyDescriptorFactory('borderEndEndRadius', '', false, [], false, false),
	borderStartEndRadius : CSSPropertyDescriptorFactory('borderStartEndRadius', '', false, [], false)
}

SplittedCSSPropertyDescriptors.strictlyLocalAttributes = {
	background : CSSPropertyDescriptorFactory('background', 'transparent', true, ['backgroundColor', 'backgroundImage', 'backgroundRepeat', 'backgroundPosition', 'backgroundAttachment', 'backgroundOrigin', 'backgroundClip'], false, false),
	backgroundColor : CSSPropertyDescriptorFactory('backgroundColor', 'transparent', false, [], false, false),
	objectFit : CSSPropertyDescriptorFactory('objectFit', 'fill', false, [], false, false),
	
	// CSSOM properties are not supported by Browsers for now : change the "isShorthand" (first) flag to true when available
	backgroundPosition : CSSPropertyDescriptorFactory('backgroundPosition', '0% 0%', true, ['backgroundPositionY', 'backgroundPositionX'], false, false),
	backgroundPositionX : CSSPropertyDescriptorFactory('backgroundPositionLeft', '0%', false, [], false, false),
	backgroundPositionY : CSSPropertyDescriptorFactory('backgroundPositionTop', '0%', false, [], false, false),
	backgroundSize : CSSPropertyDescriptorFactory('backgroundSize', 'auto auto', true, [], false, false),
	backgroundImage : CSSPropertyDescriptorFactory('backgroundImage', 'none', false, [], false, false),
	backgroundAttachment : CSSPropertyDescriptorFactory('backgroundAttachment', '', false, [], false, false),
	backgroundRepeat : CSSPropertyDescriptorFactory('backgroundRepeat', 'repeat', false, [], false, false),
	backgroundOrigin : CSSPropertyDescriptorFactory('backgroundOrigin', 'repeat', false, [], false, false),
	backgroundClip : CSSPropertyDescriptorFactory('backgroundClip', 'repeat', false, [], false, false),
	boxShadow : CSSPropertyDescriptorFactory('boxShadow', 'none', false, [], false, false),
	
	// CSSOM properties are not supported by Browsers for now : change the "isShorthand" (first) flag to true when available
	outline : CSSPropertyDescriptorFactory('outline', '', false, ['outlineColor', 'outlineStyle', 'outlineWidth', ], false, false),
	// not supported by Browsers for now : change the "isShorthand" and "mayBeAbbreviated" (two) flags to true when available
	outlineColor : CSSPropertyDescriptorFactory('outlineColor', 'none', false, ['outlineColorBlockStart', 'outlineColorInlineEnd', 'outlineColorBlockEnd', 'outlineColorInlineStart'], false),
	outlineStyle : CSSPropertyDescriptorFactory('outlineStyle', 'none', false, ['outlineStyleBlockStart', 'outlineStyleInlineEnd', 'outlineStyleBlockEnd', 'outlineStyleInlineStart'], false),
	outlineWidth : CSSPropertyDescriptorFactory('outlineWidth', 'none', false, ['outlineWidthBlockStart', 'outlineWidthInlineEnd', 'outlineWidthBlockEnd', 'outlineWidthInlineStart'], false),
	
	outlineColorBlockStart : CSSPropertyDescriptorFactory('outlineColorBlockStart', 0, false, [], false, false),
	outlineColorInlineEnd : CSSPropertyDescriptorFactory('outlineColorInlineEnd', 0, false, [], false, false),
	outlineColorBlockEnd : CSSPropertyDescriptorFactory('outlineColorBlockEnd', 0, false, [], false, false),
	outlineColorInlineStart : CSSPropertyDescriptorFactory('outlineColorInlineStart', 0, false, [], false, false),
	
	outlineStyleBlockStart : CSSPropertyDescriptorFactory('outlineStyleBlockStart', 0, false, [], false, false),
	outlineStyleInlineEnd : CSSPropertyDescriptorFactory('outlineStyleInlineEnd', 0, false, [], false, false),
	outlineStyleBlockEnd : CSSPropertyDescriptorFactory('outlineStyleBlockEnd', 0, false, [], false, false),
	outlineStyleInlineStart : CSSPropertyDescriptorFactory('outlineStyleInlineStart', 0, false, [], false, false),
	
	outlineWidthBlockStart : CSSPropertyDescriptorFactory('outlineWidthBlockStart', 0, false, [], false, false),
	outlineWidthInlineEnd : CSSPropertyDescriptorFactory('outlineWidthInlineEnd', 0, false, [], false, false),
	outlineWidthBlockEnd : CSSPropertyDescriptorFactory('outlineWidthBlockEnd', 0, false, [], false, false),
	outlineWidthInlineStart : CSSPropertyDescriptorFactory('outlineWidthInlineStart', 0, false, [], false, false),
	
	content : CSSPropertyDescriptorFactory('content', 'normal', false, [], false, false),									// normal | none | [ <content-replacement> | <content-list> ] [/ [ <string> | <counter> ]+ ]?
	
	animation : CSSPropertyDescriptorFactory('animation', 'normal', false, [], false, false),
	animationName : CSSPropertyDescriptorFactory('animationName', 'none', false, [], false, false),
	animationDuration : CSSPropertyDescriptorFactory('animationDuration', '1', false, [], false, false),
	animationIterationCount : CSSPropertyDescriptorFactory('animationIterationCount', '1', false, [], false, false),
	animationIterationFunction : CSSPropertyDescriptorFactory('animationIterationFunction', '', false, [], false, false),
	animationTimingFunction : CSSPropertyDescriptorFactory('animationTimingFunction', '', false, [], false, false),
	animationDelay : CSSPropertyDescriptorFactory('animationDelay', '0', false, [], false, false)
}




/** @type {{[key: string]: object}} */
var boundaries = {},
	c = 0,
	l = 0;
for (var groupName in SplittedCSSPropertyDescriptors) {
	l = Object.keys(SplittedCSSPropertyDescriptors[groupName]).length;
	boundaries[groupName] = {
		start : 0,
		length : l
	};
	// c += l;
}
// DEBUG: stdAttributes is the complete list of attributes for a given CSS rule (to be deleted)
boundaries.stdAttributes = {
	start : 0,
	length : c
}



/** @typedef {'inheritedAttributes'|'locallyEffectiveAttributes'|'boxModelAttributes'|'strictlyLocalAttributes'} CSSCategory enumeration of CSS property groups*/

/** 
 *  runtime enumeration of CSS property groups
 * @type {{[key: string]: CSSCategory}}
 */
const categories = {
	inheritedAttributes : 'inheritedAttributes',
	locallyEffectiveAttributes : 'locallyEffectiveAttributes',
	boxModelAttributes : 'boxModelAttributes',
	strictlyLocalAttributes : 'strictlyLocalAttributes',
}

/** @type {Map<CSSCategory, string[]>} */
const knownAttributesMapByCagegory = new Map();
knownAttributesMapByCagegory.set(categories.inheritedAttributes, Object.keys(SplittedCSSPropertyDescriptors.inheritedAttributes));
knownAttributesMapByCagegory.set(categories.locallyEffectiveAttributes, Object.keys(SplittedCSSPropertyDescriptors.locallyEffectiveAttributes));
knownAttributesMapByCagegory.set(categories.boxModelAttributes, Object.keys(SplittedCSSPropertyDescriptors.boxModelAttributes));
knownAttributesMapByCagegory.set(categories.strictlyLocalAttributes, Object.keys(SplittedCSSPropertyDescriptors.strictlyLocalAttributes));

const propToCategory = new Map(Object.entries(SplittedCSSPropertyDescriptors).flatMap(([cat, map]) => Object.keys(map).map(p => [p, cat])));



export {
	categories,
	propToCategory,
	CSSPropertyDescriptors as allCSSPropertyDescriptors,
	SplittedCSSPropertyDescriptors as splittedCSSPropertyDescriptors,
	boundaries,
	knownAttributesMapByCagegory,
};