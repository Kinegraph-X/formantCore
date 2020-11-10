/**
 * @factory UIDGenerator
 * 
 */

var generator = function() {
	this.nextUID = 0;
}

generator.prototype.newUID = function() {
	return this.nextUID++;
}

module.exports = (new generator());