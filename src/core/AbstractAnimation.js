/**
 * @constructor AbstractAnimation
 * 
 */
var appConstants = require('src/appLauncher/appLauncher');
var CoreTypes = require('src/core/CoreTypes');
var Hamster = require('src/integrated_libs_&_forks/Hamster');

	
var AbstractAnimation = function(scopeNode, defaultDuration, defaultEasing, callback) {
	CoreTypes.EventEmitter.call(this);
	this.objectType = 'AbstractAnimation';
	
	this.defaultDuration = defaultDuration || 0.77;
	this.defaultEasing = defaultEasing || Power3.easeOut;
	appConstants.textSizeGetter.oneShot(scopeNode, this.initCb.bind(this));
	this.lineHeight;
	// Timelines for animating "something"
	this.softScroll = new TimelineMax({
		paused : true
	});
	
	this.tweens = [];
	
	var self = this;
	Hamster(scopeNode).wheel(function(event, delta, deltaX, deltaY) {
		event.originalEvent.preventDefault();
		event.originalEvent.stopPropagation();
		
		self.softScroll.getChildren().forEach(function(child) {
			child.invalidate();
		});

		callback(deltaY * self.lineHeight * 3);
	});
}

AbstractAnimation.prototype = Object.create(CoreTypes.EventEmitter.prototype);
AbstractAnimation.prototype.objectType = 'AbstractAnimation';

AbstractAnimation.prototype.initCb = function(style) {
	this.lineHeight = Number(style.lineHeight.slice(0, -2));
} 

AbstractAnimation.prototype.addTween = function(node, prop) {
	var options = {ease :  this.defaultEasing};
	options[prop] = 0;
	this.tweens.push(TweenMax.to(node, this.defaultDuration, options));
	this.softScroll.add(this.tweens[this.tweens.length - 1]);
}

AbstractAnimation.prototype.removeTween = function(tweenIdx) {
	this.softScroll.add(this.tweens[tweenIdx]);
}

AbstractAnimation.prototype.updateTween = function(tweenIdx, prop, value) {
	var options = {css :  {}};
	options.css[prop] = value.toString() + 'px';
	this.softScroll.getChildren()[tweenIdx].updateTo(options);
	this.softScroll.seek(0).play();
}

AbstractAnimation.prototype.getSize = function(observerEntries) {

}
	

module.exports = AbstractAnimation;