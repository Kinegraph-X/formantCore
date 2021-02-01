/**
 * CoreTypes for Web Canvas
 */


var CanvasTypes = {
	defaultLineWidth : 1,
	defaultLineColor : 0x777777,
	defaultLineAlpha : 1,
	itemBgColor : 0xFFFFFF,
	itemBorderColor : 0xDADADA,
	defaultBorderWidth : 1,
	defaultFontSize : '24px',
	defaultFontFamily : 'Arial Narrow',
	defaultFontWeight : '400',
	defaultFontColor : 0x000000,
	defaultFontAlign : 'left',
	defaultLineHeight : 29,
	defaultSubflow : 'neutral',
	defaultHandleHeight : 57,
	defaultHandleWidth : 7,
	defaultSplineWidth : 4,
	defaultBigSplineWidth : 12,
	defaultSplineColor : 0xDDDDDD,
	defaultSplineDash : [
		
	],
	defaultSplineAlpha : .64,
	defaultTensionOffset : 22,
	variableAlpha : 1,
	defaultColors : {
		"input" : 0xAAAAAA,
		"neutral" : 0x999999,
		"special" : 0x000000
	},
	graphStartingPoint : {x : 0, y : 0},
	defaultBoxWidth : 64,
	defaultBoxHeight : 64,
	defaultBorderRadius : 2,
	defaultH_Interval : 84,
	defaultV_Interval : 12
};










CanvasTypes.LineStyle = function(obj) {
	if (Object.prototype.toString.call(obj) === '[object Object]')
		Object.assign(this, obj);
}

Object.defineProperty(CanvasTypes.prototype, 'lineWidth', {
	value : CanvasTypes.defaultLineWidth
});
Object.defineProperty(CanvasTypes.prototype, 'color', {
	value : CanvasTypes.itemBorderColor
});
Object.defineProperty(CanvasTypes.prototype, 'lineAlpha', {
	value : CanvasTypes.defaultSplineAlpha
});
Object.defineProperty(CanvasTypes.prototype, 'lineDash', {
	value : CanvasTypes.defaultSplineDash
});

CanvasTypes.FillStyle = function(obj) {
	if (Object.prototype.toString.call(obj) === '[object Object]')
		Object.assign(this, obj);
}
Object.defineProperty(CanvasTypes.prototype, 'fillColor', {
	value : CanvasTypes.itemBgColor
});
Object.defineProperty(CanvasTypes.prototype, 'fillAlpha', {
	value : CanvasTypes.variableAlpha
});

CanvasTypes.textStyle = function(obj) {
	if (Object.prototype.toString.call(obj) === '[object Object]')
		Object.assign(this, obj);

	if (this.fontSize !== CanvasTypes.options.defaultFontSize)
		this.lineHeight =  Number(this.fontSize.slice(0, 2)) + 5;
	else
		this.lineHeight = CanvasTypes.options.defaultFontSize;
}
Object.defineProperty(CanvasTypes.prototype, 'fontFamily', {
	value : CanvasTypes.defaultFontFamily
});
Object.defineProperty(CanvasTypes.prototype, 'fontColor', {
	value : CanvasTypes.defaultFontColor
});
Object.defineProperty(CanvasTypes.prototype, 'fontSize', {
	value : CanvasTypes.defaultFontSize
});
Object.defineProperty(CanvasTypes.prototype, 'fontWeight', {
	value : CanvasTypes.defaultFontWeight
});
Object.defineProperty(CanvasTypes.prototype, 'textAlign', {
	value : CanvasTypes.defaultFontAlign
});
Object.defineProperty(CanvasTypes.prototype, 'lineHeight', {
	value : CanvasTypes.defaultLineHeight
});

CanvasTypes.Position = function(obj) {
	if (Object.prototype.toString.call(obj) === '[object Object]')
		Object.assign(this, obj);
}
Object.defineProperty(CanvasTypes.prototype, 'x', {
	value : 0
});
Object.defineProperty(CanvasTypes.prototype, 'y', {
	value : 0
});

CanvasTypes.Size = function(obj) {
	if (Object.prototype.toString.call(obj) === '[object Object]')
		Object.assign(this, obj);
}
Object.defineProperty(CanvasTypes.prototype, 'width', {
	value : CanvasTypes.defaultBoxWidth
});
Object.defineProperty(CanvasTypes.prototype, 'height', {
	value : CanvasTypes.defaultBoxHeight
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
	this.lineDash =  lineStyle.lineDash;
	this.fillColor = fillStyle.fillColor;
	this.fillAlpha = fillStyle.fillAlpha;

	this._shape = new PIXI.Graphics();
	this.draw();
}

CanvasTypes._baseShape.prototype.draw = function() {
	this._shape.lineStyle(this.lineWidth, this.lineColor, this.lineAlpha, this.lineDash);
}

CanvasTypes._baseShape.prototype.clear = function () {
	this._shape.clear();
	this.draw();
}

/** _baseRect
 * @param [lineStyle] {[number, number(hex), number]}
 * @param [fillStyle] {[number(hex), number]}
 */
CanvasTypes._baseRect = function(size, lineStyle, fillStyle) {
	CanvasTypes._baseShape.call(this, lineStyle, fillStyle);
	size = size || new CanvasTypes.Size();
	this.width = size.width;
	this.height = size.height;
}

CanvasTypes._baseShape.prototype = Object.create(CanvasTypes._baseShape.prototype);




















/** _baseSprite
 * 
 */
CanvasTypes._baseSprite = function(texture) {
	this._shape = new PIXI.extras.TilingSprite(texture);
}

CanvasTypes._baseSprite.prototype.generateNew = function (texture) {
	this._shape.destroy();
	this._shape = new PIXI.extras.TilingSprite(texture);
}




























/** _text
 * @param text {string}
 * @param font {[string, number, string]}
 * @param fill {number(hex)}
 * @param align {string}
 */
CanvasTypes._text = function (textContent, textStyle, position, rotation) {
	textStyle = textStyle || new CanvasTypes.TextStyle();
	
	this._text;
	this.text = textContent || '';
	
	this.fontFamily = textStyle.fontFamily || CanvasTypes.options.defaultFontFamily;
	this.fontColor = textStyle.textColor || CanvasTypes.options.defaultFontColor;
	this.fontSize = textStyle.fontSize || CanvasTypes.options.defaultFontSize;
	this.fontWeight = textStyle.fontWeight || CanvasTypes.options.defaultFontWeight;
	this.textAlign = textStyle.textAlign || CanvasTypes.options.defaultFontAlign;
	this.lineHeight = textStyle.lineHeight || Number(font[1].slice(0, 2)) + 5;
	
	this.position = position || new CanvasTypes.Position();
	this.rotation = rotation || new CanvasTypes.Rotation();
	
	this.draw();
}

CanvasTypes._text.prototype.draw = function() {
	
	this._text = new PIXI.Text(this.text, {
		font : this.fontWeight + ' ' + this.fontSize + ' ' + this.fontFamily,
		fill : this.fontColor,
		align : this.textAlign,
		lineHeight : this.lineHeight
		}
	);
	this._text.position = this.position
	this._text.rotation = this.rotation
	this._text.scale = {x : .5, y : .5};
}

CanvasTypes._text.prototype.reDraw = function () {
	this.draw();
}





















/** _splineShape
 * @param lineWidth {number}
 * @param color {number}
 */
CanvasTypes._splineShape = function(lineWidth, color, lineAlpha, lineDash) {
	this._baseShape = new CanvasTypes._baseShape([lineWidth, color, (typeof lineAlpha !== 'undefined' ? lineAlpha : CanvasTypes.options.defaultSplineAlpha), lineDash]);
	this._baseShape._shape.__type = 'splineLink';
};
















CanvasTypes.AbstractNode = function(position, lineStyle, fillStyle) {
	this.lineStyle = lineStyle || new CanvasTypes.LineStyle();
	this.fillStyle = fillStyle || new CanvasTypes.FillStyle();
	this.position = position || new CanvasTypes.Position();
	
	this._baseShape = new CanvasTypes._baseShape(position, this.lineStyle, this.fillStyle);
	this.shape = this._baseShape._shape;
	this.shape.__type = 'AbstractNode';
}


CanvasTypes.AbstractNode.prototype.draw = function() {		// Pure Virtual

};

CanvasTypes.AbstractNode.prototype.reDraw = function () {	// Defaulted Virtual
	this._baseShape.clear();
	this.draw();
}







CanvasTypes.AbstractBox = function(position, size, lineStyle, fillStyle, borderRadius, borderWidth) {
	CanvasTypes.AbstractNode.call(this, position, lineStyle, fillStyle);

	this.borderRadius = borderRadius || CanvasTypes.defaultBorderRadius;
	this.borderWidth = borderWidth || CanvasTypes.defaultBorderWidth;
	this._baseShape = new CanvasTypes._baseRect(size, lineStyle, fillStyle);
	this.shape = this._baseShape._shape;
	this.shape.__type = 'AbstractBox';
	
	this.width = this.shape.width;
	this.height = this.shape.height;
	
//	this.draw();
}
CanvasTypes.AbstractBox.prototype = Object.create(CanvasTypes.AbstractNode.prototype);

CanvasTypes.AbstractBox.prototype.draw = function() {
	this._baseShape._shape.beginFill(this._baseShape.fillColor, 1);
	this._baseShape._shape.drawRoundedRect(this.position.x, this.position.y, this.width - this.borderWidth, this.height - this.borderWidth, this.borderRadius);
	this._baseShape._shape.endFill();
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
	var this.borderRadius = this.width / 2;
	var yStart = Math.floor((this.borderWidth  - 0.001) / 2);
	var offsetedHalfWidth =  this.width / 2 - halvedBorderWidth;
	var offsetedHalfHeight =  this.height / 2 - halvedBorderWidth;
	
	this._baseShape._shape.beginFill(this._baseShape.fillColor, 1);
	this._baseShape._shape.drawRoundedRect(this.position.x, this.position.y, this.width - this.borderWidth, this.height - this.borderWidth, this.borderRadius);
	this._baseShape._shape.endFill();

	this.shape.lineStyle(this._baseShape.lineWidth, this._baseShape.lineColor, 1, this._baseShape.lineDash);	
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
	width : 12,
	borderWidth : 1,
	fillColor : 0xDDDDDD,
	borderColor : 0x777777
};


CanvasTypes.NodeHandle = function(position) {
	var size = new CanvasTypes.Size({
		width : CanvasTypes.NodeHandleDefaults.width,
		height : CanvasTypes.NodeHandleDefaults.width
	});
	var fillStyle = new CanvasTypes.FillStyle({
		fillColor : CanvasTypes.NodeHandleDefaults.fillColor
	});
	var lineStyle = new CanvasTypes.LineStyle({
		lineWidth : CanvasTypes.NodeHandleDefaults.borderWidth,
		lineColor : CanvasTypes.NodeHandleDefaults.borderColor
	});
	
	var borderRadius = this.borderRadius = size / 2;
	CanvasTypes.AbstractDisc.call(this, position, size, lineStyle, fillStyle, borderRadius);
	
//	this.draw();
}
CanvasTypes.NodeHandle.prototype = Object.create(CanvasTypes.AbstractDisc.prototype);










CanvasTypes.NodeShapeDefaults = {
	width : 113,
	borderWidth : 1,
	fillColor : 0xFFFFFF,
	borderColor : 0xAAAAAA,
	borderRadius : 12
};


CanvasTypes.NodeShape = function(position) {
	var size = new CanvasTypes.Size({
		width : CanvasTypes.NodeShapeDefaults.width,
		height : CanvasTypes.NodeShapeDefaults.width
	});
	var fillStyle = new CanvasTypes.FillStyle({
		fillColor : CanvasTypes.NodeShapeDefaults.fillColor
	});
	var lineStyle = new CanvasTypes.LineStyle({
		lineWidth : CanvasTypes.NodeShapeDefaults.borderWidth,
		lineColor : CanvasTypes.NodeShapeDefaults.borderColor
	});
	
	this.borderRadius = CanvasTypes.NodeShapeDefaults.borderRadius;
	CanvasTypes.AbstractBox.call(this, position, size, lineStyle, fillStyle, this.borderRadius);
	
//	this.draw();
}
CanvasTypes.NodeShape.prototype = Object.create(CanvasTypes.AbstractBox.prototype);






























modules.exports = CanvasTypes;

