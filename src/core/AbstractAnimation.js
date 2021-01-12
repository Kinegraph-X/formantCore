/**
 * @constructor AbstractAnimation
 * 
 */
var appConstants = require('src/appLauncher/appLauncher');
var CoreTypes = require('src/core/CoreTypes');

	
var AbstractAnimation = function(scopeNode, defaultDuration, defaultEasing, callback) {
	CoreTypes.EventEmitter.call(this);
	this.objectType = 'AbstractAnimation';
	
	this.defaultDuration = defaultDuration || 0.77;
	this.defaultEasing = defaultEasing || Power3.easeOut;
	
	this.lineHeight;
	
	
	// Timelines for animating "something"
	this.softScroll = new TimelineMax({
		paused : true
	});
	
	this.tweens = [];
	
	var self = this;
	this.eventHandler;
}

AbstractAnimation.prototype = Object.create(CoreTypes.EventEmitter.prototype);
AbstractAnimation.prototype.objectType = 'AbstractAnimation';

AbstractAnimation.prototype.addTween = function(node, prop) {
	var options = {ease :  this.defaultEasing};
	options[prop] = 0;
	this.tweens.push(TweenMax.to(node, this.defaultDuration, options));
	this.softScroll.add(this.tweens[this.tweens.length - 1]);
	
	return this.tweens.length;
}

AbstractAnimation.prototype.removeTween = function(tweenIdx) {
	this.softScroll.remove(this.tweens[tweenIdx]);
	this.tweens.splice(tweenIdx, 1);
	if (!this.tweens.length)
		this.eventHandler.unwheel();
		
	return this.tweens.length;
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