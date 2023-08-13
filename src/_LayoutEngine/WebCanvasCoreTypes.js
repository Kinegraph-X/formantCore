/**
 * CoreTypes for Web Canvas
 */
 
 var chroma = require('src/functionals/chroma');


var CanvasTypes = {
	defaultLineWidth: 1,
	defaultLineColor: 0x777777,
	defaultLineAlpha: 1,
	defaultLineAlignement : 1,
	defaultLineDash : 0,
	itemBgColor: 0xFFFFFF,
	itemBorderColor: 0xDADADA,
	defaultBorderWidth: 0,
	defaultBorderRadius: 0,
	defaultFontSize: '14px',
	defaultFontFamily: 'Arial Narrow',
	defaultFontWeight: '400',
	defaultFontColor: 0x000000,
	defaultFontAlign: 'left',
	defaultLineHeight: 25,
	defaultSubflow: 'neutral',
	defaultHandleHeight: 57,
	defaultHandleWidth: 7,
	defaultBigSplineWidth: 12,
	defaultSplineColor: 0xDDDDDD,
	defaultSplineDash: [

	],
	defaultTensionOffset: 22,
	variableAlpha: 1,
	defaultColors: {
		"input": 0xAAAAAA,
		"neutral": 0x999999,
		"special": 0x000000
	},
	graphStartingPoint: { x: 0, y: 0 },
	defaultLineHeight: 25,
	defaultBoxWidth: 64,
	defaultBoxHeight: 64,
	defaultH_Interval: 84,
	defaultV_Interval: 12
};










CanvasTypes.LineStyle = function(obj) {
	this.lineWidth = this.default_lineWidth;
	this.lineColor = this.default_lineColor;
	this.lineAlpha = this.default_lineAlpha;
	this.lineDash = this.default_lineDash;
	if (Object.prototype.toString.call(obj) === '[object Object]')
		Object.assign(this, obj);
}

Object.defineProperty(CanvasTypes.LineStyle.prototype, 'default_lineWidth', {
	value: CanvasTypes.defaultLineWidth
});
Object.defineProperty(CanvasTypes.LineStyle.prototype, 'default_lineColor', {
	value: CanvasTypes.itemBorderColor
});
Object.defineProperty(CanvasTypes.LineStyle.prototype, 'default_lineAlpha', {
	value: CanvasTypes.defaultLineAlpha
});
Object.defineProperty(CanvasTypes.LineStyle.prototype, 'default_lineAlignement', {
	value: CanvasTypes.defaultLineAlignement
});
Object.defineProperty(CanvasTypes.LineStyle.prototype, 'default_lineDash', {
	value: CanvasTypes.defaultLineDash
});

CanvasTypes.FillStyle = function(obj) {
	this.fillColor = this.default_fillColor;
//	if (obj && isNaN(obj.fillColor))
//		console.error('this.fillColor_pre', this.fillColor, obj);
	this.fillAlpha = this.default_fillAlpha;
	if (Object.prototype.toString.call(obj) === '[object Object]')
		Object.assign(this, obj);
//	console.log('this.fillColor_post', this.fillColor);
}
Object.defineProperty(CanvasTypes.FillStyle.prototype, 'default_fillColor', {
	value: CanvasTypes.itemBgColor
});
Object.defineProperty(CanvasTypes.FillStyle.prototype, 'default_fillAlpha', {
	value: CanvasTypes.variableAlpha
});

CanvasTypes.TextStyle = function(obj) {
	if (obj.fontColor.length === 4)
		obj.fontColor = '#' + obj.fontColor[1] + obj.fontColor[1] + obj.fontColor[2] + obj.fontColor[2] + obj.fontColor[3] + obj.fontColor[3];
	
	this.fontFamily = this.default_fontFamily;
	this.fontColor = this.default_fontColor;
	this.fontSize = this.default_fontSize;
	this.fontWeight = this.default_fontWeight;
	this.textAlign = this.default_textAlign;
	if (Object.prototype.toString.call(obj) === '[object Object]') {
//		console.log(obj.fontColor)
		if (obj.fontColor.indexOf('#') === 0)
			obj.fontColor = parseInt(obj.fontColor.slice(1), 16);
		Object.assign(this, obj);
	}
	
	// FIXME: this.fontSize.slice(0, 2) was right once upon a time, but we shall get something better from the calling code now...
//	if (this.fontSize !== CanvasTypes.defaultFontSize)
//		this.lineHeight = Number(this.fontSize.slice(0, 2)) + 5; // 	/!\ NUMBER /!\
//	else
//		this.lineHeight = Number(CanvasTypes.defaultFontSize.slice(0, 2)) + 5; // 	/!\ NUMBER /!\
}
Object.defineProperty(CanvasTypes.TextStyle.prototype, 'default_fontFamily', {
	value: CanvasTypes.defaultFontFamily
});
Object.defineProperty(CanvasTypes.TextStyle.prototype, 'default_fontColor', {
	value: CanvasTypes.defaultFontColor
});
Object.defineProperty(CanvasTypes.TextStyle.prototype, 'default_fontSize', {
	value: CanvasTypes.defaultFontSize
});
Object.defineProperty(CanvasTypes.TextStyle.prototype, 'default_fontWeight', {
	value: CanvasTypes.defaultFontWeight
});
Object.defineProperty(CanvasTypes.TextStyle.prototype, 'default_textAlign', {
	value: CanvasTypes.defaultFontAlign
});
Object.defineProperty(CanvasTypes.TextStyle.prototype, 'default_lineHeight', {
	value: CanvasTypes.defaultLineHeight
});

CanvasTypes.Position = function(obj) {
	this.x = this.default_x;
	this.y = this.default_y;
	if (Object.prototype.toString.call(obj) === '[object Object]')
		Object.assign(this, obj);
}
Object.defineProperty(CanvasTypes.Position.prototype, 'default_x', {
	value: 0
});
Object.defineProperty(CanvasTypes.Position.prototype, 'default_y', {
	value: 0
});

CanvasTypes.Size = function(obj) {
	this.width = this.default_width;
	this.height = this.default_height;
	if (Object.prototype.toString.call(obj) === '[object Object]')
		Object.assign(this, obj);
}
Object.defineProperty(CanvasTypes.Size.prototype, 'default_width', {
	value: CanvasTypes.defaultBoxWidth
});
Object.defineProperty(CanvasTypes.Size.prototype, 'default_height', {
	value: CanvasTypes.defaultBoxHeight
});

CanvasTypes.Rotation = function(obj) {
	this.x = 0;
	this.y = 0;
	this.z = 0;
	if (Object.prototype.toString.call(obj) === '[object Object]')
		Object.assign(this, obj);
}
Object.defineProperty(CanvasTypes.Size.prototype, 'default_x', {
	value: CanvasTypes.defaultRotationX
});
Object.defineProperty(CanvasTypes.Size.prototype, 'default_y', {
	value: CanvasTypes.defaultRotationY
});
Object.defineProperty(CanvasTypes.Size.prototype, 'default_z', {
	value: CanvasTypes.defaultRotationZ
});




















/** _baseShape
 * @param [lineStyle] {[number, number(hex), number]}
 * @param [fillStyle] {[number(hex), number]}
 */
CanvasTypes._baseShape = function(lineStyle, fillStyle) {
	lineStyle = lineStyle || new CanvasTypes.LineStyle();
	fillStyle = fillStyle || new CanvasTypes.FillStyle();

	this.lineWidth = lineStyle.lineWidth;
	this.lineColor = lineStyle.lineColor;
	this.lineAlpha = lineStyle.lineAlpha;
	this.lineAlignement = lineStyle.lineAlignement;
	this.lineDash = lineStyle.lineDash;
	this.fillColor = fillStyle.fillColor;
	this.fillAlpha = fillStyle.fillAlpha;
	

	this._shape = new PIXI.Graphics();
	this.draw();
}

CanvasTypes._baseShape.prototype.draw = function() {
	this._shape.lineStyle(this.lineWidth, this.lineColor, this.lineAlpha, this.lineAlignement, null, this.lineDash);
}

CanvasTypes._baseShape.prototype.reDraw = function() {
	this._shape.clear();
	this.draw();
}

/** _baseRect
 * @param [lineStyle] {[number, number(hex), number]}
 * @param [fillStyle] {[number(hex), number]}
 */
CanvasTypes._baseRect = function(size, lineStyle, fillStyle) {
	CanvasTypes._baseShape.call(this, lineStyle, fillStyle);
	this.size = size || new CanvasTypes.Size();
//	this.width = size.width;
//	this.height = size.height;
}

CanvasTypes._baseRect.prototype = Object.create(CanvasTypes._baseShape.prototype);




















/** _baseSprite
 * 
 */
CanvasTypes._baseSprite = function(texture) {
	this._shape = new PIXI.extras.TilingSprite(texture);
}

CanvasTypes._baseSprite.prototype.generateNew = function(texture) {
	this._shape.destroy();
	this._shape = new PIXI.extras.TilingSprite(texture);
}




























/** _text
 * @param text {string}
 * @param font {[string, number, string]}
 * @param fill {number(hex)}
 * @param align {string}
 */
CanvasTypes._text = function(textContent, textStyle, position, rotation) {
	textStyle = textStyle || new CanvasTypes.TextStyle();

	this.shape;
	this.text = textContent || '';
		
	this.size = new CanvasTypes.Size();
	this.position = position || new CanvasTypes.Position();
	this.rotation = rotation || new CanvasTypes.Rotation();

	this.fontFamily = textStyle.fontFamily || CanvasTypes.defaultFontFamily;
	this.fontColor = textStyle.fontColor || CanvasTypes.defaultFontColor;
	this.fontSize = textStyle.fontSize || CanvasTypes.defaultFontSize;
	this.fontWeight = textStyle.fontWeight || CanvasTypes.defaultFontWeight;
	this.textAlign = textStyle.textAlign || CanvasTypes.defaultFontAlign;
	this.lineHeight = textStyle.lineHeight || CanvasTypes.defaultLineHeight; // 	/!\ NUMBER /!\
	this.textBaseline = textStyle.textBaseline || 'alphabetic';
	this.whiteSpace = textStyle.whiteSpace || 'pre';
	this.wordWrap = textStyle.wordWrap || 'true';
	this.wordWrapWidth = this.size.width;

	this.draw();
}

CanvasTypes._text.prototype.draw = function() {

	this.shape = new PIXI.Text(this.text, {
		fontFamily: this.fontFamily,
		fontSize : this.fontSize,
		fontWeight : this.fontWeight,
		fill: this.fontColor,
		align: this.textAlign,
		lineHeight : this.lineHeight,
		textBaseline : this.textBaseline,
		whiteSpace : this.whiteSpace,
		wordWrap : this.wordWrap,
		wordWrapWidth : this.size.width
	}
	);
//	console.log(this.position);
	this.shape.position = this.position;
//	this.shape._transform.rotation = this.rotation.z;
//	this.shape.scale = { x: .5, y: .5 };
}

CanvasTypes._text.prototype.reDraw = function() {
	this.shape.destroy();
	this.draw();
}





















/** _splineShape
 * @param lineWidth {number}
 * @param color {number}
 */
CanvasTypes._splineShape = function(lineWidth, color, lineAlpha, lineDash) {
	this._baseShape = new CanvasTypes._baseShape([lineWidth, color, (typeof lineAlpha !== 'undefined' ? lineAlpha : CanvasTypes.defaultSplineAlpha), lineDash]);
	this._baseShape._shape.__type = 'splineLink';
};















/** 
 * @constructor @abstract AbstractNode
 * @param {CanvasType.Position} position 
 * @param {CanvasType.LineStyle} lineStyle 
 * @param {CanvasType.FillStyle} fillStyle 
 */
CanvasTypes.AbstractNode = function(position, lineStyle, fillStyle) {
	this.lineStyle = lineStyle || new CanvasTypes.LineStyle();
	this.fillStyle = fillStyle || new CanvasTypes.FillStyle();
	this.position = position || new CanvasTypes.Position();

	this._baseShape = new CanvasTypes._baseShape(this.position, this.lineStyle, this.fillStyle);
	this.shape = this._baseShape._shape;
	this.shape.__type = 'AbstractNode';
}


CanvasTypes.AbstractNode.prototype.draw = function() {		// Pure Virtual

};

CanvasTypes.AbstractNode.prototype.reDraw = function() {	// Defaulted Virtual
	this.shape.clear();
	this.draw();
}







CanvasTypes.AbstractBox = function(position, size, lineStyle, fillStyle, borderRadius, borderWidth, debug) {
	this.debug = debug;
	CanvasTypes.AbstractNode.call(this, position, lineStyle, fillStyle);
	
	this.size =  new CanvasTypes.Size({
		width: size ? size.width : CanvasTypes.defaultBoxWidth,
		height: size ? size.height : CanvasTypes.defaultBoxHeight
	});
	this.borderRadius = borderRadius || CanvasTypes.defaultBorderRadius;
	this.borderWidth = borderWidth || CanvasTypes.defaultBorderWidth;
	
	this._baseShape = new CanvasTypes._baseRect(this.size, this.lineStyle, this.fillStyle);
	this.shape = this._baseShape._shape;
	this.shape.__type = 'AbstractBox';

	// this.draw();
}
CanvasTypes.AbstractBox.prototype = Object.create(CanvasTypes.AbstractNode.prototype);

CanvasTypes.AbstractBox.prototype.draw = function() {
	this._baseShape._shape.beginFill(this.fillStyle.fillColor, this.fillStyle.fillAlpha);
	this._baseShape._shape.drawRoundedRect(this.position.x, this.position.y, this.size.width - this.borderWidth, this.size.height - this.borderWidth, this.borderRadius);
	this._baseShape._shape.endFill();
	
	if (this.debug) {
		this._baseShape._shape.lineStyle(1, 0xFAFA44, this.lineStyle.lineAlpha, this.lineStyle.lineAlignement, null, this.lineStyle.lineDash);
		
		this._baseShape._shape.moveTo(this.position.x, this.position.y);
		this._baseShape._shape.lineTo(this.position.x + this.size.width - this.borderWidth, this.position.y);
		this._baseShape._shape.lineTo(this.position.x + this.size.width - this.borderWidth, this.position.y + this.size.height - this.borderWidth);
		this._baseShape._shape.lineTo(this.position.x, this.position.y + this.size.height - this.borderWidth);
		this._baseShape._shape.lineTo(this.position.x, this.position.y);
	}
	else if (this.borderWidth) {
		// lineStyle (width, color, alpha, alignment, native) 
		this._baseShape._shape.lineStyle(this.lineStyle.lineWidth, this.lineStyle.lineColor, this.lineStyle.lineAlpha, this.lineStyle.lineAlignement, null, this.lineStyle.lineDash);
		
		this._baseShape._shape.moveTo(this.position.x, this.position.y);
		this._baseShape._shape.lineTo(this.position.x + this.size.width - this.borderWidth, this.position.y);
		this._baseShape._shape.lineTo(this.position.x + this.size.width - this.borderWidth, this.position.y + this.size.height - this.borderWidth);
		this._baseShape._shape.lineTo(this.position.x, this.position.y + this.size.height - this.borderWidth);
		this._baseShape._shape.lineTo(this.position.x, this.position.y);
	}
};






CanvasTypes.AbstractRidgeBorderBox = function(position, size, lineStyle, fillStyle, borderRadius, borderWidth) {
	CanvasTypes.AbstractBox.call(this, position, size, lineStyle, fillStyle, borderRadius);

	this.shape.__type = 'AbstractRidgeBorderBox';

	//	this.draw();
}
CanvasTypes.AbstractRidgeBorderBox.prototype = Object.create(CanvasTypes.AbstractBox.prototype);

CanvasTypes.AbstractRidgeBorderBox.prototype.draw = function() {
	var tensionFactor = this.borderRadius * .075;
	var tensionFactorComplement = this.borderRadius * .025;
	var halvedBorderWidth = Math.max(1, this.borderWidth / 2);
	this.borderRadius = this.width / 2;
	var yStart = Math.floor((this.borderWidth - 0.001) / 2);
	var offsetedHalfWidth = this.width / 2 - halvedBorderWidth;
	var offsetedHalfHeight = this.height / 2 - halvedBorderWidth;

	this._baseShape._shape.beginFill(this._baseShape.fillColor, 1);
	this._baseShape._shape.drawRoundedRect(this.position.x, this.position.y, this.width - this.borderWidth, this.height - this.borderWidth, this.borderRadius);
	this._baseShape._shape.endFill();

	this.shape.lineStyle(this._baseShape.lineWidth, this._baseShape.lineColor, this.lineStyle.lineAlpha, this.lineStyle.lineAlignement, null, this.lineStyle.lineDash);
	this.shape.moveTo(this.borderRadius, yStart);

	this.shape.lineTo(this.width - this.borderRadius, yStart);
	this.shape.bezierCurveTo(this.width - this.borderRadius + tensionFactor, yStart, this.width - halvedBorderWidth, 0 + tensionFactorComplement, this.width - halvedBorderWidth, 0 + this.borderRadius);
	this.shape.lineTo(this.width + offsetedHalfWidth, this.height - this.borderRadius);
	this.shape.bezierCurveTo(this.width - halvedBorderWidth, this.height - tensionFactorComplement, this.width - tensionFactorComplement, this.height - halvedBorderWidth, this.width - this.borderRadius, this.height - halvedBorderWidth);

	// To be continued...
};











CanvasTypes.AbstractDisc = function(position, size, lineStyle, fillStyle) {
	size = new CanvasTypes.Size(size);
	borderRadius = this.borderRadius = size.width / 2;
	CanvasTypes.AbstractBox.call(this, position, size, lineStyle, fillStyle, borderRadius);

	//	this.draw();
}
CanvasTypes.AbstractDisc.prototype = Object.create(CanvasTypes.AbstractBox.prototype);















CanvasTypes.NodeHandleDefaults = {
	width: 12,
	borderWidth: 1,
	fillColor: 0xDDDDDD,
	borderColor: 0x777777
};


CanvasTypes.NodeHandle = function(position) {
	var size = new CanvasTypes.Size({
		width: CanvasTypes.NodeHandleDefaults.width,
		height: CanvasTypes.NodeHandleDefaults.width
	});
	var fillStyle = new CanvasTypes.FillStyle({
		fillColor: CanvasTypes.NodeHandleDefaults.fillColor
	});
	var lineStyle = new CanvasTypes.LineStyle({
		lineWidth: CanvasTypes.NodeHandleDefaults.borderWidth,
		lineColor: CanvasTypes.NodeHandleDefaults.borderColor
	});

	var borderRadius = this.borderRadius = size / 2;
	CanvasTypes.AbstractDisc.call(this, position, size, lineStyle, fillStyle, borderRadius);

	//	this.draw();
}
CanvasTypes.NodeHandle.prototype = Object.create(CanvasTypes.AbstractDisc.prototype);










CanvasTypes.NodeShapeDefaults = {
	width: 113,
	height: 113,
	borderWidth: 0,
	fillColor: 0xFFFFFF,
	fillAlpha : 1,
	borderColor: 0xAAAAAA00,
	borderRadius: 0
};


CanvasTypes.NodeShape = function(position, size, lineStyle, fillStyle, borderRadius, borderWidth, debug) {
	CanvasTypes.AbstractBox.call(this, position, size, lineStyle, fillStyle, borderRadius, borderWidth, debug);
	this.draw();
}
CanvasTypes.NodeShape.prototype = Object.create(CanvasTypes.AbstractBox.prototype);









CanvasTypes.InputShapeDefaults = {
	width: 227,
	height: 27,
	borderWidth: 1,
	fillColor: 0xFFFFFF,
	borderColor: 0x999999,
	borderRadius: 3
};

CanvasTypes.InputShape = function(position, size) {

	var fillStyle = new CanvasTypes.FillStyle({
		fillColor: CanvasTypes.InputShapeDefaults.fillColor
	});
	var lineStyle = new CanvasTypes.LineStyle({
		lineWidth: CanvasTypes.InputShapeDefaults.borderWidth,
		lineColor: CanvasTypes.InputShapeDefaults.borderColor
	});

	CanvasTypes.AbstractBox.call(this, position, size, lineStyle, fillStyle, CanvasTypes.InputShapeDefaults.borderRadius, CanvasTypes.InputShapeDefaults.borderWidth);

	this.draw();
}
CanvasTypes.InputShape.prototype = Object.create(CanvasTypes.AbstractBox.prototype);

CanvasTypes.InputShape.prototype.draw = function() {
	// lineStyle (width, color, alpha, alignment, native) 
	this._baseShape._shape.beginFill(this.fillStyle.fillColor, this.fillStyle.fillAlpha);
	this._baseShape._shape.drawRoundedRect(this.position.x, this.position.y, this.size.width - this.borderWidth, this.size.height - this.borderWidth, this.borderRadius);
	this._baseShape._shape.endFill();
	
	if (this.borderWidth) {
		this.shape.lineStyle(this.lineStyle.lineWidth, this.lineStyle.lineColor, this.lineStyle.lineAlpha, this.lineAlignement, null, this.lineStyle.lineDash);
		
		this.shape.moveTo(this.position.x, this.position.y);
		this.shape.lineTo(this.position.x + this.size.width - this.borderWidth, this.position.y);
		this.shape.lineTo(this.position.x + this.size.width - this.borderWidth, this.position.y + this.size.height - this.borderWidth);
		this.shape.lineTo(this.position.x, this.position.y + this.size.height - this.borderWidth);
		this.shape.lineTo(this.position.x, this.position.y);
	}
//	this.shape.lineTo(
		//		[
		//		new Vector(this.position.x + size * 0.39363, this.position.y + size * 0.79),
		//		new Vector(this.position.x + size * 0.16, this.position.y + size * 0.5549),
		//		new Vector(this.position.x + size * 0.27347, this.position.y + size * 0.44071),
		//		new Vector(this.position.x + size * 0.39694, this.position.y + size * 0.5649),
		//		new Vector(this.position.x + size * 0.72983, this.position.y + size * 0.23),
		//		new Vector(this.position.x + size * 0.84, this.position.y + size * 0.34085),
		//		new Vector(this.position.x + size * 0.39363, this.position.y + size * 0.79)
		//		]
//	);
}







CanvasTypes.ButtonShapeDefaults = {
	borderWidth: 1,
	fillColor: 0xF5F5F5,
	borderColor: 0xAFAFAF,
	borderRadius: 3
};

CanvasTypes.ButtonShape = function(position, size) {

	var fillStyle = new CanvasTypes.FillStyle({
		fillColor: CanvasTypes.ButtonShapeDefaults.fillColor
	});
	var lineStyle = new CanvasTypes.LineStyle({
		lineWidth: CanvasTypes.ButtonShapeDefaults.borderWidth,
		lineColor: CanvasTypes.ButtonShapeDefaults.borderColor
	});

	CanvasTypes.AbstractBox.call(this, position, size, lineStyle, fillStyle, CanvasTypes.ButtonShapeDefaults.borderRadius, CanvasTypes.ButtonShapeDefaults.borderWidth);

	this.draw();
}
CanvasTypes.ButtonShape.prototype = Object.create(CanvasTypes.AbstractBox.prototype);

CanvasTypes.ButtonShape.prototype.draw = function() {
	// lineStyle (width, color, alpha, alignment, native) 
	this._baseShape._shape.beginFill(this.fillStyle.fillColor, this.fillStyle.fillAlpha);
	this._baseShape._shape.drawRoundedRect(this.position.x, this.position.y, this.size.width - this.borderWidth, this.size.height - this.borderWidth, this.borderRadius);
	this._baseShape._shape.endFill();
	
	if (this.borderWidth) {
		this.shape.lineStyle(this.lineStyle.lineWidth, chroma(this.lineStyle.lineColor).brighten(.5).num(), this.lineStyle.lineAlpha, this.lineAlignement, null, this.lineStyle.lineDash);
		
		this.shape.moveTo(this.position.x, this.position.y);
		this.shape.lineTo(this.position.x + this.size.width - this.borderWidth, this.position.y);
		this.shape.lineStyle(this.lineStyle.lineWidth, chroma(this.lineStyle.lineColor).darken(.9).num(), this.lineStyle.lineAlpha, this.lineAlignement, null, this.lineStyle.lineDash);
		this.shape.lineTo(this.position.x + this.size.width - this.borderWidth, this.position.y + this.size.height - this.borderWidth);
		this.shape.lineTo(this.position.x, this.position.y + this.size.height - this.borderWidth);
		this.shape.lineStyle(this.lineStyle.lineWidth, chroma(this.lineStyle.lineColor).brighten(.5).num(), this.lineStyle.lineAlpha, this.lineAlignement, null, this.lineStyle.lineDash);
		this.shape.lineTo(this.position.x, this.position.y);
	}
}











// tree = parseTree(node)
// stack = parseStackingContexts(tree);
// renderStack(stack);


// if (!styles.isVisible()) return
// this.renderStackContent(stack)
//=>
	// 1. the background and borders of the element forming the stacking context.
	// this.renderNodeBackgroundAndBorders(stack.element) // === **paint** arg
		// styles = paint.container.styles;
		//borders = [
		//	{ style: styles.borderTopStyle, color: styles.borderTopColor },
		//	{ style: styles.borderRightStyle, color: styles.borderRightColor },
		//	{ style: styles.borderBottomStyle, color: styles.borderBottomColor },
		//	{ style: styles.borderLeftStyle, color: styles.borderLeftColor }
		//];
		// calculateBackgroundCurvedPaintingArea(getBackgroundValueForIndex(styles.backgroundClip, 0), paint.curves)
		// this.path(backgroundPaintingArea);
		// this.renderBackgroundImage(paint.container)
		// border = borders_1[_i];
		// this.renderBorder(border.color, side, paint.curves)
		// // curvePoints are vectors
		// parsePathForBorder(curvePoints, side)
		// => this.path(parsePathForBorder(curvePoints, side));
	
	// Looping through the 1st level children, render nodes
		// for (const child of stack.negativeZIndex) {
			// child = _a[_i];
			// this.renderStack(child) ........ see above
		// }
	
	// If () 3. For all its in-flow, non-positioned, block-level descendants in tree order:
		// this.renderNodeContent(stack.element) === **paint**
	
	
	// If (standard ?) Looping through the 1st level children, render nodes
		// for (const child of stack.nonInlineLevel) {
			// child = _a[_i];
			// this.renderNode(child)........ see above
		// }
	
	// If () stack.nonPositionedFloats
		// for (const child of stack.nonPositionedInlineLevel) {
			// child = _a[_i];
			// this.renderStack(child)........ see above
		// }
	
	// If () stack.nonPositionedInlineLevel
		// for (const child of stack.inlineLevel) {
			// child = _a[_i];
			// this.renderStack(child)........ see above
		// }
	
	
	// If () stack.inlineLevel : render child nodes
		// for (const child of stack.inlineLevel) {
			// child = _a[_i];
			// this.renderNode(child)........ see above
		// }
	
	// If () zeroOrAutoZIndexOrTransformedOrOpacity
		// for (const child of stack.zeroOrAutoZIndexOrTransformedOrOpacity) {
			// child = _a[_i];
			// this.renderStack(child)
		// }
	
	// If () positiveZIndex
		// for (const child of stack.positiveZIndex) {
			// child = _a[_i];
			// this.renderStack(child)
		// }
	
	// Finally: text & positionned content
		// this.renderNodeContent(paint)
	









































module.exports = CanvasTypes;