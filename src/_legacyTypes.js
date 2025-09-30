/**
 * @typedef {import("src/coreTest/Component").ComponentWithView} ComponentWithView
 * @typedef {import('src/coreTest/styleManagement/Stylesheet')} Stylesheet
 */


const {Logger, ComponentError} = require('src/coreTest/Error&Log');
const createRootComponentTemplate = require('src/coreTest/rootComponentTemplate');
const {EventEmitter} = require('src/coreTest/EventEmitter');
const {ComponentTemplate, ViewTemplate, Prop} = require('src/coreTest/TemplateFactory');
const registries = require('src/coreTest/Registries');

const UIDGenerator = require('src/coreTest/UIDGenerator');








//console.log(nodesRegistry);
//console.log(viewsRegistry);









/**
 * @typedef {HTMLElement} HTMLCustomElement
 * @property {Stream[]} streams
 */

/** 
 * @typedef {keyof HTMLCustomElement} CustomElementProperty
 * */











































/**
 * @template CommandActionParam
 * @template CommandCanActParam
 * @template CommandUndoParam
 */

/**
 * A class based on a pattern similar to the Command pattern
 * 
 * new Command(
		function() {					// action
			// code here //
			this.trigger('action');
		},
		function() {					// canAct
			
		},
		function() {					// undo
			
		}
	)
 * 
 */
class Command {
	/** @type {string} */
	static objectType = 'Command';
	/** @type {Promise<boolean>|null} */
	#canActQuery = null;
	/** @type {((...args : unknown[]) => boolean)} @default null*/
	#action;
	/** @type {((...args : unknown[]) => Promise<boolean>)|null} @default null*/
	#canAct = null;
	/** @type {((...args : unknown[]) => boolean)|null} @default null*/
	#undo = null;
	/**
	 * @param {(...args : unknown[]) => boolean} action
	 * @param {(...args : unknown[]) => Promise<boolean>} [canAct]
	 * @param {(...args : unknown[]) => boolean} [undo]
	 */
	constructor(action, canAct, undo) {
		this.#action = action;
		this.#canAct = canAct || null;
		this.#undo = undo || null;
	}
	/**
	 * Always returns a promise, in case the action is asynchronous
	 * @param {...unknown} args
	 * @return {Promise<boolean>}
	 */
	act(...args) {
		const self = this;
			// args = Array.prototype.slice.call(arguments);
		/** @type {boolean} */
		let canActResult;
		
		if (this.#canAct === null) {
			this.#action(...args);
			this.#canActQuery = Promise.resolve(true);
		}
		else {
			this.#canActQuery = this.#canAct.apply(null, args); 
			if (this.#canActQuery instanceof Promise) {
				this.#canActQuery.then(
						function(queryResult) {
							args.push(queryResult);
							self.#action(...args);
							return queryResult;
						},
						function(queryResult) {
							return queryResult;
						}
				);
			}
			else if (this.#canActQuery) {
				this.#canActQuery = Promise.resolve(this.#canActQuery);
				this.#action(...args);
			}
			else {
				this.#canActQuery = Promise.reject(this.#canActQuery);
			}
		}
		return this.#canActQuery;
	}
}






/**
 * @property {(arg1: HTMLElementProperty, arg2: StreamValue) => void} setProp
 * @property {(arg: HTMLElementProperty) => unknown} getProp
 */

// /** 
//  * @param {ComponentWithView} component
//  */
// const createStreamToDomInterface = function(component) {
// 	return {
// 		/** @param {HTMLElementProperty} propName @param {StreamValue} value */
// 		setProp : function(propName, value) {
// 			component.view.getMasterNode()[propName] = value;
// 		},
// 		/** @param {HTMLElementProperty} propName */
// 		getProp : function(propName) {
// 			return component.view.getMasterNode()[propName];
// 		}
// 	}
// };


















// /**
//  * @template StreamValue
//  */
// class ColdStream extends Stream<StreamValue> {
// 	/** @type {string} */
// 	static objectType ='ColdStream';
// 	/** @type {ColdSubscription[]} subscriptions */
// 	subscriptions = [];
// 	/** @type {unknown[]} */
// 	_previousValues = [];
// 	/** @type {number} */
// 	currentIndex = 0;
// 	/**
// 	 * @param {} effect 
// 	 * @param {CustomElementProperty} prop 
// 	 * @returns {ColdSubscription}
// 	 */
// 	addSubscription(effect, prop) {
// 		this.subscriptions.push(new ColdSubscription(handlerOrHost, prop, this));
// 		return this.subscriptions[this.subscriptions.length - 1];
// 	}
// 	update() {
// 		this.subscriptions.forEach((subscription) => {
// 			subscription.executeStack(this._previousValues);
// 		});
// 		this.lastIndexProvided = this._previousValues.length - 1;
// 	}
// }


// class ColdSubscription extends Subscription<StreamValue> {
// 	/** @type {string} */
// 	static objectType ='ColdSubscription';
// 	/**
// 	 * @param {} subscriberObjOrHandler 
// 	 * @param {string} subscriberProp 
// 	 * @param {ColdStream} parent 
// 	 */
// 	constructor(subscriberObjOrHandler, subscriberProp, parent) {
// 		super(subscriberObjOrHandler, subscriberProp, parent);
// 	}
// 	/** @param {StreamValue[]} valuesFromStack */
// 	executeStack(valuesFromStack) {
// //		console.log(valuesFromStack);
// 		valuesFromStack.forEach(
// 			/** @param {StreamValue} val @param {number} key*/
// 			(val, key) => {
// 				if (key > this.subscriber._stream.currentIndex) {
// 					this.execute(val);
// 					this.subscriber._stream.currentIndex++;
// 	//				console.log(this.subscriber.currentIndex);
// 				}
// 			}
// 		);
// 	}
// }














































































/**
 * This type needs to be aware of its dimensions,
 * so the DOMCanvaView passes a view including a promise 
 * from our implementation of ResizeObserver
 */
// class DOMCanvasViewAPI extends DOMViewAPI {
// 	/** @type {string} */
// 	static objectType = 'DOMCanvasViewAPI';
// 	/** @type {ComponentSubView}*/
// 	canvasView;
// 	/** @type {CanvasRenderingContext2D} */
// 	ctx = new CanvasRenderingContext2D(); //  this is dumb: it just solves async acquisition
// 	/**
// 	 * @param {ViewTemplate} definition
// 	 * @param {ComponentView} view
// 	 */
// 	constructor(definition, view) {
// 		super(definition, view);
// 		this.canvasView = view;
// 	}
// 	/**
// 	 * @param {Promise<DOMRect>} nodeAsAPromise
// 	 */
// 	init(nodeAsAPromise) {
// 		const self = this;
// 		let canvas;
// 		nodeAsAPromise.then(function(boundingBox) {
// 			canvas = self.canvasView.getMasterNode();
// 			canvas.width = boundingBox.width;
// 			canvas.height = boundingBox.height;
// 			self.ctx = canvas.getContext('2d');	
// 			return boundingBox;
// 		});
// 	}
// 	/**
// 	 * @param {string} color
// 	 */
// 	setFillColor(color) {
// 		var self = this;
// 	//	this.view.nodeAsAPromise.then(function() {
// 			self.ctx.fillStyle = color;
// 	//	});
// 	}
// 	/**
// 	 * @param {number} x
// 	 * @param {number} y
// 	 */
// 	drawPoint(x, y) {
// 		var self = this;
// 	//	this.view.nodeAsAPromise.then(function() {
// 			self.ctx.fillRect(x, y, 1, 1);
// 	//	});
// 	}
// 	/**
// 	 * @param {string} startColor
// 	 * @param {number} colorScaleLength
// 	 * @param {number} x : x boundary of canvas 
// 	 * @param {number} y : y boundary of canvas
// 	 * @param {number} h : h boundary of canvas
// 	 * @param {number} w : w boundary of canvas
// 	 */
// 	gradientFill(startColor, colorScaleLength, x, y, w, h) {
		
// 	}
// }
















// /**
//  * @template {keyof HTMLElementTagNameMap|string} tagName 
//  * @extends ComponentView<tagName>
//  */
// class CanvasView extends ComponentView {
// 	/** @type {string} */
// 	static objectType = 'CanvasView';
// 	/** @type {DOMCanvasViewAPI} */
// 	currentViewAPI;
// 	/** @type {number} */
// 	w = 0;
// 	/** @type {number} */
// 	h = 0;
// 	/** @type {Promise<unknown> | null} */
// 	nodeAsAPromise = null;
// 	/**
// 	 * @param {ViewTemplate} definition
// 	 * @param {ComponentView<tagName>} parentView
// 	 * @param {string} parentUID
// 	 */
// 	constructor(definition, parentView, parentUID) {
// 		super(definition, parentView, parentUID);
// 		this.resizeObserver = new ResizeObserver();
// 		this.getDimensions();
// 		this.currentViewAPI = new DOMCanvasViewAPI(definition, this);
// 	}
// 	getDimensions() {
// 		const self = this;
// 		this.nodeAsAPromise = new Promise(function(resolve, reject) {
// 			const inter = setInterval(function() {
// 				if (self.memberAt(0).getMasterNode()) {
// 					clearInterval(inter);				
// 					this.resizeObserver.observe(self.node, self.storeDimensions.bind(self, resolve));
// 				}
// 			}, 512);
// 		});
// 		return this.nodeAsAPromise;
// 	}
// 	/**
// 	 * @param {function} resolve // () => ResizeObserver.BoundingBox (TODO: to be defined)
// 	 * @param {FrameworkEvent} e
// 	 */
// 	storeDimensions(resolve, e) {
// 		this.w = e.data.boundingBox.w;
// 		this.h = e.data.boundingBox.h;
// 		resolve(e.data.boundingBox);
// 		this.resizeObserver.unobserve(this.node);
// 	}
// 	/**
// 	 * @param {ColorJS.scale} colorScale
// 	 */
// 	gradientFill(colorScale) {
// 		var length = colorScale.max();
// 		this.callCurrentViewAPI('gradientFill', colorScale[0], colorScale[length], 0, 0, this.w, this.h);
// 	}
// 	/**
// 	 * @param {ColorJS.scale} colorScale
// 	 * @param {ResizeObserver.BoundingBox} boundaries
// 	 */
// 	partialGradientFill(colorScale, boundaries) {
// 		var length = colorScale.max();
// 		this.callCurrentViewAPI('gradientFill', colorScale[0], colorScale[length], boundaries.x, boundaries.y, boundaries.w, boundaries.h);
// 	}
// 	/**
// 	 * @param {ColorJS.scale} colorScale
// 	 * @param {ResizeObserver.BoundingBox} boundaries
// 	 */
// 	manualGradientFill(colorScale, boundaries) {
// 		var self = this;
// 		var length = 1; //colorScale.max();
		
// 		this.nodeAsAPromise.then(function(boundingBox) {
// 			if (typeof boundaries === 'undefined') {
// 				boundaries = {
// 					w : boundingBox ? boundingBox.w : self.w,
// 					h  : boundingBox ? boundingBox.h : self.h,
// 					x : 0,
// 					y : 0
// 				};
// 			}
			
// 			for (let x = boundaries.x, l = boundaries.w + boundaries.x; x < l; x++) {
// 				for (let y = boundaries.y, L = boundaries.h + boundaries.y; y < L; y++) {
// 					self.callCurrentViewAPI('setFillColor', colorScale((x - boundaries.x) * length / boundaries.w).hex());
// 					self.callCurrentViewAPI('drawPoint', x, y);	
// 				}
// 			}
// 		});
// 	}
// }
















/**
 * A static definition of some DOM attributes :
 * 		reminded here as useful for storing a component's "persistent state" (although it's only "persisted" through the Stream interface)
 * 		used by the visibleStateComponent to map glyphs on states
 */
const commonStates = {
		hidden : false,
		disabled : false,
		checked : false,
		focused : false,
		selected : false,
		highlighted : false,
		blurred : false,
		valid : false,
		recent : false, 	// boolean otherwise handled by specific mecanism (component should be referenced in a list, etc.)
		branchintree : '',	// replaces CSS classes : enum ('root', 'branch', 'leaf')
		leafintree : '',
		nodeintree : false,
		expanded : false,
		sortable : false,
		sortedasc : false,
		sorteddesc :false,
		position : 0,		// position as a state : degrees, 'min', 'man', nbr of pixels from start, etc. 
		size : 0,			// size as a state : length, height, radius
		tabIndex : 0,
		'delete' : false,		// isn't a -persistent- state (cause it removes the node, hm) but deserves a glyph
		shallreceivefile : true,
		handlesvideo : true
}













module.exports = {
	Command : Command,
	// LazyResettableColdStream : ColdStream,
	NumberedStream : NumberedStream,
	StreamPool : StreamPool,
	SavableStore : SavableStore,
	RootComponentView : RootComponentView,
	ComponentView : ComponentView,
	ComponentSubView : ComponentSubView,
	// CanvasView : CanvasView,
	StreamToDomInterface
}