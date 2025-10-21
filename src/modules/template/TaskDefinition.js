/**
 * @module TaskDefinition
 */

/**
 * @typedef {"viewExtend"|"lateAddChild"|"lateInit"|"lateBinding"} TaskNameType
 * @typedef {import("./TemplateFactory").ComponentTemplate} ComponentTemplate
 */

/**
 * @typedef {Object} TaskDefinitionDef
 * @property {TaskNameType} type
 * @property {Function} task 
 * @property {Number} [index]
 */

class TaskDefinition {
	/** @type {TaskNameType} */
	type;
	/** @type {function} */
	task = () => {};
	/** @type {number} */
	index = 0;
	/** @type {'TaskSubscription'} @readonly */
	objectType = 'TaskSubscription';
	
	/**
	 * @param {TaskDefinitionDef} obj
	 */
	constructor(obj) {
		/** @readonly */ this.type = obj.type;
		/** @readonly */ this.task = obj.task;
		/** @readonly */ this.index = obj.index || 0;
	}
	
	/**
	 * @param {TaskDefinition} thisArg
	 * @param {ComponentTemplate} definition
	 */
	execute(thisArg, definition) {
		this.task.call(thisArg, definition);
	}
}

export default TaskDefinition;