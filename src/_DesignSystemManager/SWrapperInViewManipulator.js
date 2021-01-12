/**
 * @constructor SWrapperInViewManipulator
 */

var appConstants = require('src/appLauncher/appLauncher');
var TypeManager = require('src/core/TypeManager');
//var CoreTypes = require('src/core/CoreTypes');

var textSizeGetter = appConstants.textSizeGetter;
var ScalesUtilities = require('src/tools/ScalesUtilities');


var SWrapperInViewManipulator = function(hostView) {
	if (!hostView.sWrapper) {
		return null;
	}
	this.hostView = hostView;
	this.viewAPI = hostView.viewAPI;
	this.s = hostView.sWrapper;
	
	this.rulesCache = new TypeManager.PropertyCache('rulesCache');
//	this.textSizeGetter = textSizeGetter;
	
	this.viewPresenceKeyWord;
	this.fontSize;
	this.boundingBox;
	
	this.getViewPresenceKeyWord();
}
SWrapperInViewManipulator.prototype = Object.create(Object.prototype);
//SWrapperInViewManipulator.prototype.extends = 'EventEmitter';





SWrapperInViewManipulator.prototype.getBoundingBox = function() {
	var self = this;
	
	return new Promise(function(resolve, reject) {
		var inter = setInterval(function() {
			if (self.hostView.getMasterNode()) {
				clearInterval(inter);
				
				appConstants.resizeObserver.observe(self.hostView.getMasterNode(), self.storeBoundingBox.bind(self));
			}
		}, 512);
	});
}
SWrapperInViewManipulator.prototype.storeBoundingBox = function(resolve, e) {
	resolve(this.boundingBox = e.data.boundingBox);
}
SWrapperInViewManipulator.prototype.getViewPresenceKeyWord = function() {
	(this.s && (this.viewPresenceKeyWord = this.s.getRuleDefinition(':host', 'display'))) || (this.viewPresenceKeyWord = this.hostView.isCustomElem ? 'inline-block' : 'block');
}
SWrapperInViewManipulator.prototype.getFontSize = function() {
	var self = this;
	return new Promise(function(resolve, reject) {
		self.textSizeGetter.oneShot(
			self.hostView.getMasterNode(),
			self.storeFontSize.bind(self, resolve)
		);
	});
}
SWrapperInViewManipulator.prototype.storeFontSize = function(resolve, fontStyle) {
	resolve(this.fontSize = fontStyle.fontSize);
}
SWrapperInViewManipulator.prototype.setFontSize = function(fontSize) {
	var rule = this.s.getRuleAsObject(':host').rule;
	rule.attributes.fontSize = fontSize.toString() + 'px';
	this.s.replaceStyle(rule, rule.attributes);
}
SWrapperInViewManipulator.prototype.getPresence = function() {
	
}
SWrapperInViewManipulator.prototype.setPresence = function() {
	
}
SWrapperInViewManipulator.prototype.getVisibility = function() {
	
}
SWrapperInViewManipulator.prototype.setVisibility = function() {
	
}
SWrapperInViewManipulator.prototype.getOpacity = function() {
	
}
SWrapperInViewManipulator.prototype.setOpacity = function() {
	
}
SWrapperInViewManipulator.prototype.revealSelfOnly = function() {
	
}
SWrapperInViewManipulator.prototype.setNeonEmphasis = function() {
	
}
SWrapperInViewManipulator.prototype.restoreOriginalEmphasis = function() {
	
}
SWrapperInViewManipulator.prototype.addEventListener = function(eventType, handler) {
	this.viewAPI.addEventListener(eventType, handler);
}
SWrapperInViewManipulator.prototype.removeEventListener = function(eventType, handler) {
	this.viewAPI.removeEventListener(eventType, handler);
}
SWrapperInViewManipulator.prototype.getWidth = function(selector) {
	var width;
	if (width = this.s.getRuleAsObject(selector).rule.attributes.width)
		return parseInt(width.replace(/px/, ''));
}
SWrapperInViewManipulator.prototype.setWidth = function(selector, w) {
	var rule = this.s.getRuleAsObject(selector).rule;
	rule.attributes.width = w.toString();
	this.s.replaceStyle(rule, rule.attributes);
}
SWrapperInViewManipulator.prototype.setMaxWidth = function(selector, w) {
	var rule = this.s.getRuleAsObject(selector).rule;
	rule.attributes.maxWidth = w.toString();
	this.s.replaceStyle(rule, rule.attributes);
}
SWrapperInViewManipulator.prototype.getHeight = function(selector) {
	var height;
	if (height = this.s.getRuleAsObject(selector).rule.attributes.height)
		return parseInt(height.replace(/px/, ''));
}
SWrapperInViewManipulator.prototype.setHeight = function(selector, h) {
	var rule = this.s.getRuleAsObject(selector).rule;
	rule.attributes.height = h.toString();
	this.s.replaceStyle(rule, rule.attributes);
}
SWrapperInViewManipulator.prototype.setMaxHeight = function(selector, h) {
	var rule = this.s.getRuleAsObject(selector).rule;
	rule.attributes.maxHeight = h.toString();
	this.s.replaceStyle(rule, rule.attributes);
}

SWrapperInViewManipulator.prototype.setFlex = function(selector, f) {
	var rule = this.s.getRuleAsObject(selector).rule;
	rule.attributes.flex = f.toString();
	this.s.replaceStyle(rule, rule.attributes);
}

SWrapperInViewManipulator.prototype.getComponentViewAsCanvas = function(nodeName) {
	var member;
	if (nodeName === 'header')
		member = this.hostView.subViewsHolder.firstMember();
	else
		member = this.hostView.getMasterNode();
	
	return Rasterizer(member);
}
SWrapperInViewManipulator.prototype.setRotationAlongCylinder = function(nodeName) {
	var y;	
//	var rule = this.s.getRuleAsObject('header').rule;
//	rule.attributes.transform = 'scaleY(' + this.getRotationBasedOnYPos(y) + ')';
	
	var partialCanvas = this.getComponentViewAsCanvas(nodeName);
	// => then compose a new Canvas assembling alltogether the partials Canvas
	
	
//	this.s.replaceStyle(rule, rule.attributes);
}
SWrapperInViewManipulator.prototype.getRotationBasedOnYPos = function(y) {
	return ScalesUtilities.elevationDependantAngle(y);
}









module.exports = SWrapperInViewManipulator;