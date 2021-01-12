/**
 * @constructor MouseWheelAnimation
 * 
 */
var appConstants = require('src/appLauncher/appLauncher');
var CoreTypes = require('src/core/CoreTypes');
var AbstractAnimation = require('src/core/AbstractAnimation');
var Hamster = require('src/integrated_libs_&_forks/Hamster');

	
var MouseWheelAnimation = function(scopeNode, defaultDuration, defaultEasing, callback) {
	AbstractAnimation.call(this);
	this.objectType = 'MouseWheelAnimation';
	
//	if (scopeNode.clientHeight > 200)
		appConstants.textSizeGetter.oneShot(scopeNode, this.initCb.bind(this));
//	else
//		this.lineHeight = 2;
	
	var self = this;
	this.eventHandler = Hamster(scopeNode).wheel(function(event, delta, deltaX, deltaY) {
		event.originalEvent.preventDefault();
		event.originalEvent.stopPropagation();
		
		self.softScroll.getChildren().forEach(function(child) {
			child.invalidate();
		});

		callback(deltaY * self.lineHeight * 3);
	});
}

MouseWheelAnimation.prototype = Object.create(AbstractAnimation.prototype);
MouseWheelAnimation.prototype.objectType = 'MouseWheelAnimation';

MouseWheelAnimation.prototype.initCb = function(style) {
	this.lineHeight = Number(style.lineHeight.slice(0, -2));
} 

	

module.exports = MouseWheelAnimation;