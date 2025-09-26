/**
 * @typedef {import("src/coreTest/Component").ComponentWithView} ComponentWithView
 */


const {Logger, ComponentError} = require('src/coreTest/Error&Log');
const createRootComponentTemplate = require('src/coreTest/rootComponentTemplate');
const {ComponentTemplate, ViewTemplate, Prop} = require('src/coreTest/TemplateFactory');
const registries = require('src/coreTest/Registries');

const UIDGenerator = require('src/coreTest/UIDGenerator');
const CachedTypes = require('src/coreTest/CachedTypes');








//console.log(nodesRegistry);
//console.log(viewsRegistry);




/** 
 * @template {keyof HTMLElementTagNameMap} TagNameMapEntry
 * @typedef {keyof HTMLElementTagNameMap[TagNameMapEntry]} ElementProperty
 * */
/** @typedef {ElementProperty<"a">} AnchorProperty */
/** @typedef {ElementProperty<"abbr">} AbbrProperty */
/** @typedef {ElementProperty<"address">} AddressProperty */
/** @typedef {ElementProperty<"area">} AreaProperty */
/** @typedef {ElementProperty<"article">} ArticleProperty */
/** @typedef {ElementProperty<"aside">} AsideProperty */
/** @typedef {ElementProperty<"audio">} AudioProperty */

/** @typedef {ElementProperty<"b">} BProperty */
/** @typedef {ElementProperty<"base">} BaseProperty */
/** @typedef {ElementProperty<"blockquote">} BlockquoteProperty */
/** @typedef {ElementProperty<"body">} BodyProperty */
/** @typedef {ElementProperty<"br">} BrProperty */
/** @typedef {ElementProperty<"button">} ButtonProperty */

/** @typedef {ElementProperty<"canvas">} CanvasProperty */
/** @typedef {ElementProperty<"caption">} CaptionProperty */
/** @typedef {ElementProperty<"cite">} CiteProperty */
/** @typedef {ElementProperty<"code">} CodeProperty */
/** @typedef {ElementProperty<"col">} ColProperty */
/** @typedef {ElementProperty<"colgroup">} ColgroupProperty */

/** @typedef {ElementProperty<"data">} DataProperty */
/** @typedef {ElementProperty<"datalist">} DatalistProperty */
/** @typedef {ElementProperty<"dd">} DdProperty */
/** @typedef {ElementProperty<"del">} DelProperty */
/** @typedef {ElementProperty<"details">} DetailsProperty */
/** @typedef {ElementProperty<"dfn">} DfnProperty */
/** @typedef {ElementProperty<"dialog">} DialogProperty */
/** @typedef {ElementProperty<"div">} DivProperty */
/** @typedef {ElementProperty<"dl">} DlProperty */
/** @typedef {ElementProperty<"dt">} DtProperty */

/** @typedef {ElementProperty<"em">} EmProperty */
/** @typedef {ElementProperty<"embed">} EmbedProperty */

/** @typedef {ElementProperty<"fieldset">} FieldsetProperty */
/** @typedef {ElementProperty<"figcaption">} FigcaptionProperty */
/** @typedef {ElementProperty<"figure">} FigureProperty */
/** @typedef {ElementProperty<"footer">} FooterProperty */
/** @typedef {ElementProperty<"form">} FormProperty */

/** @typedef {ElementProperty<"h1">} H1Property */
/** @typedef {ElementProperty<"h2">} H2Property */
/** @typedef {ElementProperty<"h3">} H3Property */
/** @typedef {ElementProperty<"h4">} H4Property */
/** @typedef {ElementProperty<"h5">} H5Property */
/** @typedef {ElementProperty<"h6">} H6Property */
/** @typedef {ElementProperty<"head">} HeadProperty */
/** @typedef {ElementProperty<"header">} HeaderProperty */
/** @typedef {ElementProperty<"hr">} HrProperty */
/** @typedef {ElementProperty<"html">} HtmlProperty */

/** @typedef {ElementProperty<"i">} IProperty */
/** @typedef {ElementProperty<"iframe">} IframeProperty */
/** @typedef {ElementProperty<"img">} ImgProperty */
/** @typedef {ElementProperty<"input">} InputProperty */
/** @typedef {ElementProperty<"ins">} InsProperty */

/** @typedef {ElementProperty<"kbd">} KbdProperty */
/** @typedef {ElementProperty<"label">} LabelProperty */
/** @typedef {ElementProperty<"legend">} LegendProperty */
/** @typedef {ElementProperty<"li">} LiProperty */
/** @typedef {ElementProperty<"link">} LinkProperty */

/** @typedef {ElementProperty<"main">} MainProperty */
/** @typedef {ElementProperty<"map">} MapProperty */
/** @typedef {ElementProperty<"mark">} MarkProperty */
/** @typedef {ElementProperty<"menu">} MenuProperty */
/** @typedef {ElementProperty<"meta">} MetaProperty */
/** @typedef {ElementProperty<"meter">} MeterProperty */

/** @typedef {ElementProperty<"nav">} NavProperty */
/** @typedef {ElementProperty<"noscript">} NoscriptProperty */

/** @typedef {ElementProperty<"object">} ObjectProperty */
/** @typedef {ElementProperty<"ol">} OlProperty */
/** @typedef {ElementProperty<"optgroup">} OptgroupProperty */
/** @typedef {ElementProperty<"option">} OptionProperty */
/** @typedef {ElementProperty<"output">} OutputProperty */

/** @typedef {ElementProperty<"p">} PProperty */
/** @typedef {ElementProperty<"picture">} PictureProperty */
/** @typedef {ElementProperty<"pre">} PreProperty */
/** @typedef {ElementProperty<"progress">} ProgressProperty */

/** @typedef {ElementProperty<"q">} QProperty */

/** @typedef {ElementProperty<"rp">} RpProperty */
/** @typedef {ElementProperty<"rt">} RtProperty */
/** @typedef {ElementProperty<"ruby">} RubyProperty */

/** @typedef {ElementProperty<"s">} SProperty */
/** @typedef {ElementProperty<"samp">} SampProperty */
/** @typedef {ElementProperty<"script">} ScriptProperty */
/** @typedef {ElementProperty<"section">} SectionProperty */
/** @typedef {ElementProperty<"select">} SelectProperty */
/** @typedef {ElementProperty<"slot">} SlotProperty */
/** @typedef {ElementProperty<"small">} SmallProperty */
/** @typedef {ElementProperty<"source">} SourceProperty */
/** @typedef {ElementProperty<"span">} SpanProperty */
/** @typedef {ElementProperty<"strong">} StrongProperty */
/** @typedef {ElementProperty<"style">} StyleProperty */
/** @typedef {ElementProperty<"sub">} SubProperty */
/** @typedef {ElementProperty<"summary">} SummaryProperty */
/** @typedef {ElementProperty<"sup">} SupProperty */

/** @typedef {ElementProperty<"table">} TableProperty */
/** @typedef {ElementProperty<"tbody">} TbodyProperty */
/** @typedef {ElementProperty<"td">} TdProperty */
/** @typedef {ElementProperty<"template">} TemplateProperty */
/** @typedef {ElementProperty<"textarea">} TextareaProperty */
/** @typedef {ElementProperty<"tfoot">} TfootProperty */
/** @typedef {ElementProperty<"th">} ThProperty */
/** @typedef {ElementProperty<"thead">} TheadProperty */
/** @typedef {ElementProperty<"time">} TimeProperty */
/** @typedef {ElementProperty<"title">} TitleProperty */
/** @typedef {ElementProperty<"tr">} TrProperty */
/** @typedef {ElementProperty<"track">} TrackProperty */

/** @typedef {ElementProperty<"u">} UProperty */
/** @typedef {ElementProperty<"ul">} UlProperty */

/** @typedef {ElementProperty<"var">} VarProperty */
/** @typedef {ElementProperty<"video">} VideoProperty */

/** @typedef {ElementProperty<"wbr">} WbrProperty */


/**
 *
 * @typedef {AnchorProperty   | AbbrProperty     | AddressProperty  | AreaProperty      | ArticleProperty |
*   AsideProperty    | AudioProperty    | BProperty        | BaseProperty      | BlockquoteProperty |
*   BodyProperty     | BrProperty       | ButtonProperty   | CanvasProperty    | CaptionProperty |
*   CiteProperty     | CodeProperty     | ColProperty      | ColgroupProperty  | DataProperty |
*   DatalistProperty | DdProperty       | DelProperty      | DetailsProperty   | DfnProperty |
*   DialogProperty   | DivProperty      | DlProperty       | DtProperty        | EmProperty |
*   EmbedProperty    | FieldsetProperty | FigcaptionProperty | FigureProperty  | FooterProperty |
*   FormProperty     | H1Property       | H2Property       | H3Property        | H4Property |
*   H5Property       | H6Property       | HeadProperty     | HeaderProperty    | HrProperty |
*   HtmlProperty     | IProperty        | IframeProperty   | ImgProperty       | InputProperty |
*   InsProperty      | KbdProperty      | LabelProperty    | LegendProperty    | LiProperty |
*   LinkProperty     | MainProperty     | MapProperty      | MarkProperty      | MenuProperty |
*   MetaProperty     | MeterProperty    | NavProperty      | NoscriptProperty  | ObjectProperty |
*   OlProperty       | OptgroupProperty | OptionProperty   | OutputProperty    | PProperty |
*   PictureProperty  | PreProperty      | ProgressProperty | QProperty         | RpProperty |
*   RtProperty       | RubyProperty     | SProperty        | SampProperty      | ScriptProperty |
*   SectionProperty  | SelectProperty   | SlotProperty     | SmallProperty     | SourceProperty |
*   SpanProperty     | StrongProperty   | StyleProperty    | SubProperty       | SummaryProperty |
*   SupProperty      | TableProperty    | TbodyProperty    | TdProperty        | TemplateProperty |
*   TextareaProperty | TfootProperty    | ThProperty       | TheadProperty     | TimeProperty |
*   TitleProperty    | TrProperty       | TrackProperty    | UProperty         | UlProperty |
*   VarProperty      | VideoProperty    | WbrProperty
* } HTMLElementProperty
*/




/**
 * @typedef {HTMLElement} HTMLCustomElement
 * @property {Stream[]} streams
 */

/** 
 * @typedef {keyof HTMLCustomElement} CustomElementProperty
 * */





class Pair {
	/** @type {string} @default ''*/
	name = '';
	/** @type {string} @default ''*/
	value = '';
	/**
	 * @param {string} name
	 * @param {string} value
	 */
	constructor(name, value) {
		this.name = name;
		this.value = value;
	}
}



class ListOfPairs extends Array {
	/**
	 * @param {{'name' : string, 'value' : string}[]} nameValuePairsList
	 */
	constructor(nameValuePairsList) {
		super();
//		if (Array.isArray(nameValuePairsList)) {
			for (let i = 0, l = nameValuePairsList.length; i < l; i++) {
				this.push(
					new Pair(
						nameValuePairsList[i].name,
						nameValuePairsList[i].value
					)
				);
			}
//		}
	}
}












class DimensionsPair {
	/** @type {number} @default 0*/
	inline = 0;
	/** @type {number} @default 0*/
	block = 0;
	/**
	 * @param {[number, number]} initialValues
	 */
	constructor(initialValues) {
		this.inline = initialValues[0];
		this.block = initialValues[1];
	}
	/**
	 * @param {[number, number]} valuesPair
	 */
	set(valuesPair) {
		this.inline = valuesPair[0];
		this.block = valuesPair[1];
		return this;
	}
	/**
	 * @param {[number, number]} valuesPair
	 */
	add(valuesPair) {
		this.inline += valuesPair[0];
		this.block += valuesPair[1];
		return this;
	}
	/**
	 * @param {[number, number]} valuesPair
	 */
	substract(valuesPair) {
		this.inline -= valuesPair[0];
		this.block -= valuesPair[1];
		return this;
	}
}












/**
 * @template EventPayload
 */

class EventEmitter {
	/** @type {string} */
	static objectType = 'EventEmitter';
	/** @type {Object<string, function[]>} */
	eventHandlers = {};
	/** @type {Object<string, function[]>} */
	#_one_eventHandlers = {};
	/** @type {Object<string, {'id' : number, handler : function}[]>} */
	#_identified_eventHandlers = {};

	/**
	 * 
	 * @returns {string}
	 */
	getType() {
		const ctor = /** @type {unknown} */ (this.constructor)
		return  /** @type {{objectType : string}} */ (ctor).objectType;
	}

	constructor() {
	}
	
	/**
	 * @param {string} eventType
	 */
	createEvent(eventType) {
		if (eventType in this.eventHandlers) {
			console.warn(Object.getPrototypeOf(this).objectType, ': this.createEvent has been called with an existing eventType =>', eventType);
			return;
		}

		this.eventHandlers[eventType] = [];
		this.#_one_eventHandlers[eventType] = [];
		// identified event handlers are meant to be one-shot events
		this.#_identified_eventHandlers[eventType] = [];
	}
	
	/**
	 * Deletes... an event
	 * @param {string} eventType
	 */
	deleteEvent(eventType) {
		delete this.eventHandlers[eventType];
		delete this.#_one_eventHandlers[eventType];
		delete this.#_identified_eventHandlers[eventType];
	}
	
	/**
	 * @param {string} eventType
	 */
	hasStdEvent(eventType) {
		return (typeof this.eventHandlers[eventType] !== 'undefined');
	}
	
	/**
	 * @param {string} eventType
	 * @param {function} handler : the handler to remove (the associated event stays available) 
	 */
	removeEventListener(eventType, handler) {
		if (typeof this.eventHandlers[eventType] === 'undefined') {
			console.error(Object.getPrototypeOf(this).objectType, 'event type to remove doesn\'t exist.', eventType);
			return;
		}
		for(var i = 0, l = this.eventHandlers[eventType].length; i < l; i++) {
			if (this.eventHandlers[eventType][i] === handler) {
				this.eventHandlers[eventType].splice(i, 1);
			}
		}
		for(var i = 0, l = this.#_one_eventHandlers[eventType].length; i < l; i++) {
			if (this.#_one_eventHandlers[eventType][i] === handler) {
				this.#_one_eventHandlers[eventType].splice(i, 1);
			}
		}
		for(var i = 0, l = this.#_identified_eventHandlers[eventType].length; i < l; i++) {
			if (this.#_identified_eventHandlers[eventType][i]['handler'] === handler) {
				this.#_identified_eventHandlers[eventType].splice(i, 1);
			}
		}
	}
	
	/**
	 * These methods are only able to add "permanent" handlers : "one-shot" handlers must be added by another mean 
	 * @param {string} eventType
	 * @param {function} handler : the handler to add 
	 */
	addEventListener(eventType, handler) {
		if (typeof this.eventHandlers[eventType] === 'undefined') {
			console.error(Object.getPrototypeOf(this).objectType, 'event type to add doesn\'t exist.', eventType);
			return;
		}
		this.eventHandlers[eventType].push(handler);
	}
	
	/**
	 * @param {string} eventType
	 * @param {function} handler : the handler to add 
	 * @param {number} index : where to add
	 */
	addEventListenerAt(eventType, handler, index) {
		if (typeof this.eventHandlers[eventType] === 'undefined') {
			console.error(Object.getPrototypeOf(this).objectType, 'event type to add doesn\'t exist.', eventType);
			return;
		}
		this.eventHandlers[eventType].splice(index, 0, handler);
	}
	
	/**
	 * @param {string} eventType
	 * @param {number} index : position at which to remove an handler
	 */
	removeEventListenerAt(eventType, index) {
		if (typeof this.eventHandlers[eventType] === 'undefined') {
			console.error(Object.getPrototypeOf(this).objectType, 'event type to remove doesn\'t exist.', eventType);
			return;
		}
		if (typeof index === 'number' && index < this.eventHandlers[eventType].length) {
			this.eventHandlers[eventType].splice(index, 1);
		}
	}
	
	/**
	 * @param {string} eventType
	 */
	clearEventListeners(eventType) {
		if (typeof this.eventHandlers[eventType] === 'undefined'){
			console.error(Object.getPrototypeOf(this).objectType, 'event type to clear doesn\'t exist.', eventType);
			return;
		}
		this.eventHandlers[eventType].length = 0;
		this.#_one_eventHandlers[eventType].length = 0;
		this.#_identified_eventHandlers[eventType].length = 0;
	}
	
	/**
	 * @param {string} eventType
	 * @param {EventPayload} payload
	 * @param {boolean} [bubble]
	 * @param {number} [eventID]
	 */ 
	trigger(eventType, payload, bubble, eventID) {
		if (!this.eventHandlers[eventType] && !this.#_one_eventHandlers[eventType] && !this.#_identified_eventHandlers[eventType]) {
			console.warn(Object.getPrototypeOf(this).objectType, 'Event : ' + eventType + ' triggered although it doesn\'t exist. Returning...');
			return;
		}
		
		for(let i = 0, l = this.eventHandlers[eventType].length; i < l; i++) {
			if (typeof this.eventHandlers[eventType][i] === 'function')
				this.eventHandlers[eventType][i]({type : eventType, data : payload, bubble : bubble});
		}
	
		for(let i = this.#_one_eventHandlers[eventType].length - 1; i >= 0; i--) {
			if (typeof this.#_one_eventHandlers[eventType][i] === 'function') {
				this.#_one_eventHandlers[eventType][i]({type : eventType, data : payload, bubble : bubble});
				delete this.#_one_eventHandlers[eventType][i];
			}
		}
		
		let deleted = 0;
		if (typeof eventID !== 'undefined' && typeof eventID === 'number') {
			for(let i = this.#_identified_eventHandlers[eventType].length - 1; i >= 0; i--) {
				if (typeof this.#_identified_eventHandlers[eventType][i] === 'undefined')
					deleted++;
				else if (eventID === this.#_identified_eventHandlers[eventType][i]['id']) {
					if (typeof this.#_identified_eventHandlers[eventType][i] === 'object') {
						this.#_identified_eventHandlers[eventType][i].handler({type : eventType, data : payload, bubble : bubble})
						delete this.#_identified_eventHandlers[eventType][i];
					}
				}
			}
		}
	
		this.#_one_eventHandlers[eventType] = [];
		if (deleted === this.#_identified_eventHandlers[eventType].length)
			this.#_identified_eventHandlers[eventType] = [];
	}
}













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


/**
 * @template StreamValue
 */
class Stream {
	/** @type {string} */
	static objectType ='Stream';
	/** @type {ComponentWithView|null} @default null*/
	#_hostComponent = null;
	/** @type {boolean} @default true */
	#_forward = true;
	/** type {boolean} @default false */
	#_dirty = false;
	/** @type {string} @default '' */
	name = '';
	/** @type {StreamValue} @default undefined */
	#_value;
	/** @type {boolean} @default false*/
	#lazy = false;
	/** @type {Subscription[]} @default []*/
	subscriptions = [];
	
	/**
	 * @param {string} name
	 * @param {StreamValue} value
	 * @param {ComponentWithView} component
	 * @param {boolean} [lazy]
	 */
	constructor(name, value, component, lazy = false) {
		this.name = name;
		this.#_value = value;
		this.#_hostComponent = component;
	}
	
	get next() {
		if (this.#lazy && this.#_dirty) {
			this.#lazyUpdate();
		}
		return this.#_value;
	}
	/** @param {StreamValue} val */
	set next(val) {
		this.#_value = val;
		this.#setAndUpdateConditional(val);
	}
	/**
	 * @param {StreamValue} value
	 */
	#setAndUpdateConditional(value) {
		this.#_value = value;
		if (!this.#lazy) {
			this.#update();
		}
		else {
			this.#_dirty = true;
		}
	}
	#update() {
		this.subscriptions.forEach(
			/** @param {Subscription} subscription */
			(subscription) => {
				subscription.execute(this.#_value);
			}
		);
	}
	#lazyUpdate() {
		this.#update();
		this.#_dirty = false;
	}
	/**
	 * instanciates and registers a new subscription, and returns it for the caller to define the refinement functions (filter & map)
	 * @param {Stream<StreamValue>|null} downStream
	 * @param {function|null} effect
	 */ 
	subscribe(downStream = null, effect = null) {
		return this.addSubscription(downStream, effect);
	}
	/**
	 * 
	 * @param {Stream<StreamValue>|null} downStream
	 * @param {function|null} effect 
	 * @returns {Subscription<StreamValue>}
	 */
	addSubscription(downStream = null, effect = null) {
		this.subscriptions.push(new Subscription(downStream, effect));
		return this.subscriptions[this.subscriptions.length - 1];
	}
	/**
	 * 
	 * @param {Subscription<StreamValue>|Stream<StreamValue>} subscriptionOrStream 
	 */
	unsubscribe(subscriptionOrStream) {
		for(let i = this.subscriptions.length - 1; i >= 0; i--) {
			if (this.subscriptions[i] === subscriptionOrStream || this.subscriptions[i].stream === subscriptionOrStream) {
				this.subscriptions.splice(i, 1);
			}
		}
	}
}


class StreamToDomInterface {
	constructor() {
		throw new Error("ElementFactory is static-only; do not instantiate.");
	}
	/** @param {Stream<StreamValue>} stream */
	static getPropertyDescriptor(stream) {
		return  {
			get : () => stream.value,
			/** @param {StreamValue} val*/
			set : (val) => {
				/** @type {unknown} bound function */
				const thisArg = this;
				if (val !== stream.value)
					/** @type {HTMLElement} */ (thisArg).setAttribute(stream.name, val);
				stream.value = val;
			}
		}
	}
}



/**
 * A Class to be used by the Streams
 * 
 * 	example  this.streams[streamName].subscribe(candidate.hostElem, streamValue);
 * 
 * Comparison with RxJS:
 * 
 * where Subscriber implements the Observer interface and extends the Subscription class
 * An Observer holds the value over time, through calls to its next() by an Observable.
 * filter(), map() and transform are applied through the Pipe.
 * 
 * Here, a subscription is the pipe AND the application of the next() method of an observable
 */
/**
 * @template StreamValue
 */
class Subscription {
	/** @type {string} */
	static objectType ='Subscription';
	/** @type {function|null} */
	effect = null;
	/** @type {Stream<StreamValue>|null} */
	downStream;
	/** @type {function} */
	filter = () => {};
	/** @type {function} */
	map = () => {};
	/** @type {function} */
	transform = () => {};
	/**
	 * @param {Stream<StreamValue>|null} downStream 
	 * @param {function|null} effect 
	 */
	constructor(downStream = null, effect = null) {
		this.effect = effect;
		this.downStream = downStream;
		this._subscriberUID = '';
		this._subscriberType = '';
	}
	/**
	 * @param {function|null} filterFunc 
	 * @returns {Subscription<StreamValue>}
	 */
	createFilter(filterFunc) {
		if (!filterFunc)
			return this;
			
		// optimize by breaking the reference : TODO: benchmark
		const functionBody = filterFunc.toString().match(/\{.*\}\s*$/);
		if (!functionBody)
			throw new ComponentError(this, 'probably malformed filter function, unable to parse function body', filterFunc);
		var f = new Function('value', `${functionBody}`);
		this.filter = f;
		return this;
	}
	/**
	 * @param {function|null} mapFunc 
	 * @returns {Subscription<StreamValue>}
	 */
	createMap(mapFunc) {
		if (!mapFunc)
			return this;
			
		// optimize by breaking the reference : TODO: benchmark
		const functionBody = mapFunc.toString().match(/\{.*\}\s*$/);
		if (!functionBody)
			throw new ComponentError(this, 'probably malformed map function, unable to parse function body', mapFunc);
		var f = new Function('value', `${functionBody}`);
		this.map = f;
		return this;
	}
	/**
	 * @param {function|null} transformFunc 
	 * @returns {Subscription<StreamValue>}
	 */
	createTransform(transformFunc) {
		if (!transformFunc)
			return this;
			
		// optimize by breaking the reference : TODO: benchmark
		const functionBody = transformFunc.toString().match(/\{.*\}\s*$/);
		if (!functionBody)
			throw new ComponentError(this, 'probably malformed transform function, unable to parse function body', transformFunc);
		var f = new Function('value', `${functionBody}`);
		this.transform = f;
		return this;
	}
	/**
	 * @param {StreamValue} value 
	 */
	execute(value) {
//		console.log('%c %s %c %s', 'color:coral', 'Subscription "execute"', 'color:firebrick', 'Stream : ' + this._stream.name, 'value', value);
		let shouldExecute = true, val, desc;
		if (value !== undefined) {
			if (this.filter)
				shouldExecute = this.filter(value);
			if (shouldExecute && this.map)
				val = this.map(value);
			if (shouldExecute && this.transform)
				val = this.transform(value);
			else if (shouldExecute)
				val = value;
			else
				return;
			
			if (this.downStream)
				this.downStream.next = val;
			// second case shall only be reached if no prop is given : on a "reflected" subscription by a child component
			// else if (this.subscriber.obj && (desc = Object.getOwnPropertyDescriptor(this.subscriber.obj, 'value')) && typeof desc.set === 'function')
			// 	this.subscriber.obj.value = val;
			else if (this.effect !== null)
				this.effect(val);
		}
	}
	/**
	 * 
	 * @param {string} subscriberUID 
	 * @param {string} subscriberType 
	 * @returns {Subscription<StreamValue>} 
	 */
	unAnonymize(subscriberUID, subscriberType) {
		this._subscriberUID = subscriberUID;
		this._subscriberType = subscriberType;
		return this;
	}
}










class ColdStream extends Stream<StreamValue> {
	/** @type {string} */
	static objectType ='ColdStream';
	/** @type {ColdSubscription[]} subscriptions */
	subscriptions = [];
	/** @type {unknown[]} */
	_previousValues = [];
	/** @type {number} */
	currentIndex = 0;
	/**
	 * @param {} handlerOrHost 
	 * @param {CustomElementProperty} prop 
	 * @returns {ColdSubscription}
	 */
	addSubscription(handlerOrHost, prop) {
		this.subscriptions.push(new ColdSubscription(handlerOrHost, prop, this));
		return this.subscriptions[this.subscriptions.length - 1];
	}
	update() {
		this.subscriptions.forEach((subscription) => {
			subscription.executeStack(this._previousValues);
		});
		this.lastIndexProvided = this._previousValues.length - 1;
	}
}


class ColdSubscription extends Subscription<StreamValue> {
	/** @type {string} */
	static objectType ='ColdSubscription';
	/**
	 * @param {} subscriberObjOrHandler 
	 * @param {string} subscriberProp 
	 * @param {ColdStream} parent 
	 */
	constructor(subscriberObjOrHandler, subscriberProp, parent) {
		super(subscriberObjOrHandler, subscriberProp, parent);
	}
	/** @param {StreamValue[]} valuesFromStack */
	executeStack(valuesFromStack) {
//		console.log(valuesFromStack);
		valuesFromStack.forEach(
			/** @param {StreamValue} val @param {number} key*/
			(val, key) => {
				if (key > this.subscriber._stream.currentIndex) {
					this.execute(val);
					this.subscriber._stream.currentIndex++;
	//				console.log(this.subscriber.currentIndex);
				}
			}
		);
	}
}






/**
 * NumberedStreams should be part of a StreamPool
 */
class NumberedStream {
	/** @type {string} */
	static objectType ='NumberedStream';
	/** @type {number} */
	_key = 0;
	/** @type {StreamPool} */
	_parent;
	/**
	 * @param {number} key 
	 * @param {StreamPool} component 
	 * @param {string} name 
	 * @param {string|number} value 
	 */
	constructor(key, component, name, value) {
		this._key = key;
		this._parent = component;
	}
	set() {}
	remove() {
		return this._parent.removeStream(this._key);
	}
}

/**
 * NumberedStreams should be part of a StreamPool
 */
class StreamPool {
	/** @type {string} */
	static objectType ='StreamPool';
	/** @type {number} */
	_key = 0;
	/** @type {ComponentWithView} */
	_component;
	/** @type {NumberedStream[]} */
	_streamsArray  = [];
	/**
	 * @param {ComponentWithView} component 
	 */
	constructor(component) {
		this._component = component;
	}
	getFirstStream() {
		return this._streamsArray[0];
	}
	/**
	 * @param {number} idx : the _key of the member Stream
	 */
	getStreamAt(idx) {
		return this._streamsArray[idx];
	}
	getLastStream() {
		return this._streamsArray[this._streamsArray.length - 1];
	}
	/**
	 * @param {NumberedStream} child : an instance of a Stream
	 */
	pushStream(child) {
		child._parent = this;
		child._key = this._streamsArray.length;
		this._streamsArray.push(child);
	}
	/**
	 * @param {NumberedStream} child : an instance of a Stream
	 * @param {number} atIndex : the required index to splice at
	 */
	addStreamAt(child, atIndex) {
		child._parent = this;
		child._key = atIndex;
		this._streamsArray.splice(atIndex, 0, child);
		this.#generateKeys(atIndex);
	}
	/**
	 * @param {number} childKey : the required index to splice at
	 */
	removeStream(childKey) {
		var removed = this._streamsArray.splice(childKey, 1);
		(childKey < this._streamsArray.length && this.#generateKeys(childKey));
		return removed;
	}
	removeLastStream() {
		var removed = this._streamsArray.pop();
		return removed;
	}
	/**
	 * @param {number} atIndex : the index at which to splice
	 */
	removeStreamAt(atIndex) {
		var removedChild = this._streamsArray.splice(atIndex, 1);
		this.#generateKeys(atIndex);
	}
	removeAllStreams() {
		this._streamsArray.length = 0;
	}
	/**
	 * @param {number} atIndex : the first _key we need to invalidate
	 */
	#generateKeys(atIndex) {
		for (let i = atIndex || 0, l = this._streamsArray.length; i < l; i++) {
			this._streamsArray[i]._key = i;
		}
	}
}






/**
 * @template SavableStoreUpdateCallback
 */

class SavableStore {
	/** @type {string} */
	static objectType ='SavableStore';
	/** @type {function} */
	onUpdateCallback;
	/** @type {string[]} */
	valueNames = [];
	/** @type {Prop[]} */
	values = [];
	/**
	 * @param {function} onUpdateCallback
	 * @param {string[]} valueNamesList
	 */
	constructor(onUpdateCallback, valueNamesList = []) {
		this.onUpdateCallback = onUpdateCallback;
		if (valueNamesList && valueNamesList.length) {
			valueNamesList.forEach((valueName) => {
				this.addValue(valueName);
			});
		}
	}
	/**
	 * @param {string} valueName
	 */
	addValue(valueName) {
		this.valueNames.push(valueName);
		this.values.push(new Prop({[valueName] : undefined}))
	}
	
	/**
	 * @param {string} valueName
	 */
	removeValue(valueName) {
		// FIXME: we should make use of the valueNames index
		var valuePos = this.valueNames.indexOf(valueName);
		this.values.splice(valuePos, 1);
		this.valueNames.splice(valuePos, 1);
	}
	
	clearValues() {
		this.values.length = 0;
	}
	
	/**
	 * @param {string} valueName
	 * @param {string|boolean} value
	 */
	update(valueName, value) {
		// FIXME: we should make use of the valueNames index
		var valueObj = this.values[this.valueNames.indexOf(valueName)];
		valueObj.value = value;
		
		/** @type {{[key : string] : string|number|boolean|object|null|undefined}} */
		let returnValue = {};
		this.valueNames.forEach(
			(name, key) => {
				returnValue[name] = this.values[key].value;
			}
		);
		this.onUpdateCallback(JSON.stringify(returnValue));
	}
	
	empty() {
		this.valueNames.forEach((valueName, key) => {
			this.values[key].value = undefined;
		});
	}
	

}















const workerExceptionMessage = 'Worker MessageType normalization failed';

/**
 * @typedef {object} WorkerMessageType
 * @property {'event'} event
 * @property {'error'} error
 * @property {'warning'} warning
 */
/** @type {WorkerMessageType} */
const WorkerMessageType = {
	event : 'event',
	error : 'error',
	warning : 'warning'
};




/**
 * @param {unknown} value
 * @returns {value is { type: string }}
 */
function workerMessageTypeGuard(value) {
	return typeof value === 'object' && value !== null && 'type' in value;
  }



/**
 * WorkerMessage
 * a type normalization
 */
class WorkerMessage {
	/** @type {string} */
	type = '';
	/** @type {string|null} */
	id = null;
	/** @type {unknown|null} */
	payload = null;
	/** @type {string|null} */
	cause = null;
	
	/**
	 * @param {{type : string, id?: string, payload?: unknown, cause?: string}} untypedMessage
	 */
	constructor (untypedMessage) {
		this.type = untypedMessage.type;				// string (already tested)
		if (typeof untypedMessage.id === 'string')
			this.id = untypedMessage.id;			// string (optional but here defined by default)
		if (untypedMessage.payload)
			this.payload = untypedMessage.payload; //  (optional, any object, as the worker is accross an interface boundary)
		if (typeof untypedMessage.cause === 'string')
			this.cause = untypedMessage.cause		// string (optional, only if type is "error" or "warning")
	}
	/**
	 * @param {unknown} untypedMessage
	 * @returns {WorkerMessage|undefined}
	 */
	static normalize(untypedMessage) {
		if (!workerMessageTypeGuard(untypedMessage) || !(untypedMessage.type in WorkerMessageType)) {
			console.warn(workerExceptionMessage + ': maybe you\'re communicating with an external worker');
			return undefined;
		}
  		return new WorkerMessage(/** @type {{type : string}} */ untypedMessage);
	}
}


/**
 * @template WorkerMessageHandler
 */


/**
 * WorkerInterface
 * A class to comunicate with a js worker more easily
 * - post a task and a payload (use optimized serialization when possible)
 * - receive different responses from a worker, allowing to bind a handler on each response type
 * 
 * User code passing a stringified worker should call the destroy() method to clear the url object
 * @extends {EventEmitter<WorkerMessage|MessageEvent<unknown>>}
 */
class WorkerInterface extends EventEmitter {
	/** @type {string} */
	static objectType = 'WorkerInterface';
	/** @type {string} */
	name = '';
	/** @type {Object<string, function>} */ //WorkerMessageHandler
	#_responseHandler = {};
	/** @type {Worker|null} */
	#worker = null;
	/** @type {string|null} */
	#blobURL = null;
	
	/**
	 * @param {string} workerName
	 * @param {string|null} [stringifiedWorker] (optional if url is defined)
	 * @param {string} [url] 
	 */
	constructor(workerName, stringifiedWorker, url) {
		super();
		this.name = workerName;
		this.createEvent('message');
		
		if (stringifiedWorker) {
			const blob = new Blob([stringifiedWorker], {type: 'application/javascript'});
			this.#blobURL = window.URL.createObjectURL(blob);
			this.#worker = new Worker(this.#blobURL);
		}
		else if (url) {
			this.#worker = new Worker(url);
			this.#worker.onmessage = this.#handleResponse.bind(this);
			this.#worker.onerror = this.#workerHandleError.bind(this);
			this.#worker.onmessageerror = this.#workerHandleMessageError.bind(this);
		}
		else {
			console.error(this.name + ': WorkerInterface requires passing a "stringifiedWorker" or an "url" param');
		}
	}
	
	/**
	 * Meant to be passed as an event-handler, like "parser.postMessage.bind(parser, 'init')"
	 * @param {string} action
	 * @param {unknown} [payload]
	 */
	postMessage(action, payload) { 	// e.g for the mp4Parser.worker : e.data = File Object (blob)
		// syntax [(messageContent:any)arg0, (transferableObjectsArray:[transferable, transferable, etc.])arg1]
		if (typeof payload === 'undefined')
			this.#worker?.postMessage([action]);
		else if (payload instanceof ArrayBuffer)
			this.#worker?.postMessage([action, payload], [payload]);
		else
			this.#worker?.postMessage([action, payload]);
	}
	
	/**
	 * @param {string} handlerName
	 * @param {function} handler
	 */
	addResponseHandler(handlerName, handler) {
		if (typeof handler === 'function')
			this.#_responseHandler[handlerName] = handler;
	}
	
	/**
	 * @param {WorkerMessage|MessageEvent<unknown>} response may be normalized as WorkerMessage in this method, or unknown if you don't own the code of the worker
	 */
	#handleResponse(response) {
		const normalizedMessage = WorkerMessage.normalize(response);
		const warningMessage = 'Formant Worker: name: "' + this.name + '" => No handler found for response event type.';
		
		if (!normalizedMessage) {	// allows not following our custom spec
			if (typeof response === 'string') {
				if (typeof this.#_responseHandler[response] === 'function') {
					this.#_responseHandler[response]();
				}
				else {
					console.warn(warningMessage + ' response is ' + response);
				}
			}
		}
		else {
			if (normalizedMessage.type === WorkerMessageType.error || normalizedMessage.type === WorkerMessageType.warning) {
				this.#handleMessageError(normalizedMessage);
				this.trigger('message', normalizedMessage);
				return;
			}
			if (normalizedMessage.id !== null && typeof this.#_responseHandler[normalizedMessage.id] === 'function') {
				this.#_responseHandler[normalizedMessage.id](normalizedMessage.payload);
				this.trigger('message', normalizedMessage);
				return;
			}
			else {
				console.warn(warningMessage + ' eventID is ' + normalizedMessage.id);
			}
		}
		
		this.trigger('message', response);
	}
	
	/**
	 * Generic error handling
	 * @param {ErrorEvent} e
	 */
	#workerHandleError(e) {
		console.error('Generic Worker Error:', e);
	}
	
	/**
	 * Generic error handling
	 * @param {MessageEvent} e
	 */
	#workerHandleMessageError(e) {
		console.error('Generic Worker Message Error:', e);
	}
	
	/**
	 * Specific error handling (from normalized message)
	 * @param {WorkerMessage} message
	 */
	#handleMessageError(message) {
		const errMessage = 'Formant Worker failure: ';
		switch (message.type) {
			case WorkerMessageType.error :
				console.error(errMessage + this.name + ' ' + message.cause);
				break;
			case WorkerMessageType.warning :
				console.warn(errMessage + this.name + ' ' + message.cause);
				break;
			default : break;
		}
	}
	
	destroy() {
		URL.revokeObjectURL(this.#blobURL || '');
	}
}


































/**
 * @template {keyof HTMLElementTagNameMap} tagName
 */
class DOMViewAPI {
	/** @type {string} */
	static objectType = 'DOMViewAPI';
	/** @type {boolean} @default false*/
	isShadowHost = false;
	/** @type {tagName}*/
	nodeName;
	/** @type {HTMLElementTagNameMap[tagName]|HTMLExtendedElement|null} @default null */
	#masterNode = null;
	/** @type {ShadowRoot|null} @default null */
	#wrappingNode = null;
	/** @type {'inline'|'block'|'flex'|'none'} */
	presenceAsAProp = 'flex';
	/**
	 * @param {ViewTemplate} def
	 */
	constructor(def) {
		this.isShadowHost = def.isCustomElem;
		this.nodeName = /** @type {tagName}*/ (def.nodeName);
	}
	/**
	 * @param {boolean} bool
	 */
	setPresence(bool) {
		this.hostElem.style.display = bool ? this.presenceAsAProp : 'none';
	}
	/**
	 * @param {string} eventName
	 * @param {(e: UIEvent) => void} handler
	 */
	addEventListener(eventName, handler) {
		this.hostElem.addEventListener(eventName, handler);
	}
	
	

	get elementMasterNode() {
		return /** @type {HTMLElementTagNameMap[tagName]} */ (this.#masterNode);
	}
	get customElementMasterNode() {
		return /** @type {HTMLExtendedElement} */ (this.#masterNode);
	}
	
	get masterNode() {
		if (!this.isShadowHost) {
			return this.elementMasterNode;
		}
		else {
			return this.customElementMasterNode;
		}
	}
	/**
	 * @param {HTMLElement} node
	 */
	set masterNode(node) {
		this.#masterNode = node;
		this.#wrappingNode = node.shadowRoot;
	}
	/**
	 * @return {HTMLElement|ShadowRoot}
	 */
	get wrappingNode() {
		return this.#wrappingNode || this.#masterNode;
	}
	
	/**
	 * @return {boolean}
	 */
	isTextInput() {
		return this.nodeName.toUpperCase() === 'INPUT' || this.nodeName.toUpperCase() === 'TEXTAREA';
	}
	
	/**
	 * @return {string}
	 */
	getTextInputValue() {
		return this.getMasterNode().value;
	}
	
	/**
	 * @param {number} atIndex
	 * @returns {Element|false}
	 */
	getChildNodeAtIndex(atIndex) {
		if (this.getMasterNode().children[atIndex - 1]) {
			return this.getMasterNode().children[atIndex - 1];
		}
		else {
			return false;
		}
	}
	
	/**
	 * @return {string}
	 */
	getTextContent() {
		// It may seem weird to return all the texts ignoring the real HTMLElements
		// Let'st try this for now...
		
		var realTextContent = '';
		this.getWrappingNode().childNodes.forEach(function(elem) {
			if (elem instanceof Text)
				realTextContent += elem.wholeText;
		});
		return realTextContent;
	}
	
	/**
	 * @param {string} value
	 */
	setContentNoFail(value) {
		if (this.isTextInput())
			this.getMasterNode().value = value;
		else
			this.setNodeContent(value);
	}
	
	/**
	 * @return {string}
	 */
	getContentNoFail() {
		if (this.isTextInput())
			return this.getMasterNode().value;
		else
			return this.getTextContent(); 
	}
	
	/**
	 * @param {string} text
	 */
	setTextContent(text) {
		this.getWrappingNode().textContent = text;
	}
	
	/**
	 * @param {string} contentAsString
	 */
	setNodeContent(contentAsString) {
		this.getWrappingNode().innerHTML = contentAsString;
	}
	
	/**
	 * @param {string} text
	 */
	appendTextNode(text) {
		var elem = document.createTextNode(text);
		this.getWrappingNode().appendChild(elem);
	}
	
	/**
	 * @param {HTMLElement} childNode
	 * @param {number} atIndex
	 */
	addChildNodeAt(childNode, atIndex) {
		var lowerIndexChild;
		if ((lowerIndexChild = this.getChildNodeAtIndex(atIndex)))
			lowerIndexChild.insertAdjacentElement('afterend', childNode);
		else
			this.getWrappingNode().appendChild(childNode);
	}
	
	empty() {
		this.getWrappingNode().innerHTML = '';
	}
	
	/**
	 * @param {string[]} contentAsArray
	 */
	getMultilineContent(contentAsArray) {
		return this.getFragmentFromContent(contentAsArray, this.templateNodeName);
	}
	
	/**
	 * @param {string[]} contentAsArray
	 * @param {string} templateNodeName
	 */
	getFragmentFromContent(contentAsArray, templateNodeName) {
		const fragment = document.createDocumentFragment();
		contentAsArray.forEach(
			/** @param {HTMLElement|string} val */
			function(val) {
				const elem = document.createElement(templateNodeName);
				elem.id = 'targetSubViewElem-' + TemplateFactory.UIDGenerator.newUID();
				if (val instanceof HTMLElement) {
					elem.appendChild(val);
					fragment.appendChild(elem);
					return;
				}
				
				elem.innerHTML = val;
				fragment.appendChild(elem);
			}
		);
		return fragment;
	}
	/** @param {string[]} contentAsArray*/
	setContentFromArray(contentAsArray) {
		this.empty();
		this.getWrappingNode().appendChild(this.getMultilineContent(contentAsArray));
	}
	
	/** @param {string} color */
	updateBGColor(color) {
		this.getMasterNode().style.backgroundColor = color;
	}
	
	/**
	 * These methods are implemented as a reminder and a potentially needed fallback,
	 * but in most cases of hiding/showing, we should prefer the reactive states-based mechanism:
	 * states : [{hidden : 'hidden'}} will be automagically reflected on the DOM node
	 */
	hide() {
		this.getMasterNode().hidden = true;	
	}
	
	show() {
		this.getMasterNode().hidden = false;	
	}
}




/** @template {keyof HTMLElementTagNameMap} tagName */
class BaseComponentView {
	/** @type {string} */
	static objectType = 'BaseComponentView';
	/** @type {string} */
	viewUID;
	/** @type {string} */
	regUID = '';
	/** @type {boolean} */
	isCustomElem = false;
	/** @type {number|null} */
	section = null;
	/** @type {string} */
	_sWrapperUID = '';
	/** @type {StyleHook} // TODO: styleHook.s refers to the AbstractStylesheet => change that, it's not at all explicit*/
	styleHook;
	/** @type {FormantStylesheet} */
	sOverride;
	/** @type {HTMLElement|null} */
	factoryType = null;
	/** @type {DOMViewAPI<'div'>} */
	#currentViewAPI;
	/**
	 * @param {ViewTemplate} vTemplate
	 */
	constructor(vTemplate) {
		this.viewUID = vTemplate.UID;
		this.isCustomElem = vTemplate.isCustomElem;
		this.section = vTemplate.section;
		this.sOverride = vTemplate.sOverride;

		let nodeName /** @type {tagName}*/ = vTemplate.nodeName;

		if (!vTemplate.nodeName) {
			throw new ComponentError(this, 'no nodeName given to a componentView : returning...', vTemplate);
		}

		/** @type {DOMViewAPI<tagName>} */
		this.#currentViewAPI = new DOMViewAPI(vTemplate);
		this.styleHook = new SWrapperInViewManipulator(this);

		if (!registries.attribute.get(this.viewUID))
			registries.attribute.set(this.viewUID, vTemplate.attributes);

		registries.views.push(this);
	}
	
	/**
	 * Main helper to access the effective implementation of the View
	 * @param {string} methodName
	 * @param {...unknown} args
	 */
	get currentViewAPI() {
		return this.tooledCurrentViewAPI;
	}
	
	/**
	 * Shorthand method on the currentViewAPI
	 */
	get node() {
		return this.currentViewAPI.masterNode;
	}
	/**
	 * Shorthand method on the currentViewAPI
	 */
	get wrappingNode() {
		return this.currentViewAPI.wrappingNode;
	}
	/**
	 * Shorthand method on the currentViewAPI
	 * @param {HTMLElementTagNameMap[tagName]|HTMLExtendedElement} node
	 */
	set node(node) {
		this.#currentViewAPI.masterNode = node;
	}
	
	
	
	/**
	 * These shorthands methods are only useful when we explicitly need
	 * to update the -stylesheet- associated with a (shadowed, obviously) web-component
	 */
	hide() {
		if (this.styleHook.s)
			this.styleHook.s.updateRule({visibility : 'hidden'}, ':host')
		else
			this.currentViewAPI.hide();
	}
	show() {
		if (this.styleHook.s)
			this.styleHook.s.updateRule({visibility : 'visible'}, ':host')
		else
			this.currentViewAPI.show();
	}
	
	
	/**
	 * @param {boolean} bool
	 * @param {FormantEvent} event
	 */
	setPresence(bool, event) {
		if (event) {
			if (typeof event.data === 'boolean')
				this.callCurrentViewAPI('setPresence', event.data);
			else
				new ComponentError(this, 'When being passed an event, the setPresence() method expects the payload to be a boolean');
		}
		else
			this.callCurrentViewAPI('setPresence', bool);
	}
	
	/**
	 * @param {string} eventName
	 * @param {function} handler
	 */
	addEventListener(eventName, handler) {
		this.callCurrentViewAPI('addEventListener', eventName, handler);
	}
	
	/**
	 * 
	 */
	getTextContent() {
		return this.callCurrentViewAPI('getTextContent');
	}
	
	/**
	 * @abstract
	 * 
	 * @needsGlobalRefactoring
	 */
	get value() {
		return this.callCurrentViewAPI('getContentNoFail');
	}		// ComponentWithReactiveText.prototype.populateSelf makes use of that
	/** @param {string} val */
	set value(val) {
		this.callCurrentViewAPI('setContentNoFail', val);
	}
	
	/**
	 * @param {string} text
	 */
	setTextContent(text) {
		this.callCurrentViewAPI('setTextContent', text);
	}
	
	/**
	 * @param {string} text
	 */
	setContentNoFail(text) {
		this.callCurrentViewAPI('setContentNoFail', text);
	}
	
	/**
	 * @param {string} contentAsString
	 */
	setNodeContent(contentAsString) {
		this.callCurrentViewAPI('setNodeContent', contentAsString);
	}
	
	/**
	 * @param {string} textContent
	 */
	appendAsTextNode(textContent) {
		this.callCurrentViewAPI('appendTextNode', textContent);
	}
	
	/**
	 * @param {ComponentView} childView
	 * @param {number} atIndex
	 */
	addChildNodeFromViewAt(childView, atIndex) {
		if (!childView.getMasterNode())		// check presence of masterNode, as we may be adding a childComponent before the view has been rendered
			return;
		this.callCurrentViewAPI('addChildNodeAt', childView.getMasterNode(), atIndex);
	}
	
	empty() {
		return this.callCurrentViewAPI('empty');
	}
	
	/**
	 * @param {string[]} contentAsArray
	 */
	setContentFromArray(contentAsArray) {
		this.callCurrentViewAPI('empty');
		this.callCurrentViewAPI('setContentFromArray', contentAsArray);
	}
	
}




class RootComponentView extends BaseComponentView {
	/** @type {string} */
	static objectType = 'RootComponentView';
	;
	/**
	 * @param {ViewTemplate} vTemplate
	 */
	constructor(vTemplate = createRootComponentTemplate().view) {
		super(vTemplate);
		this.regUID = 0;
	}
}


class ComponentView extends BaseComponentView {
	/** @type {string} */
	static objectType = 'ComponentView';
	/** @type {string} */
	_templateUID;
	/** @type {ComponentWithView} */
	_parentComponent;
	/** @type {ComponentView|RootComponentView} */
	parentView;
	/**
	 * @param {ViewTemplate} vTemplate
	 * @param {ComponentView|RootComponentView} parentView
	 * @param {string} parentUID
	 */
	constructor(vTemplate, parentView, parentUID) {
		super(vTemplate);
		this._templateUID = this.regUID = parentUID;
		
		if (!(parentView instanceof ComponentView)) {
			throw new ComponentError(this, 'no parentView given to a componentView : nodeName is', vTemplate);
		}
			
		// this._parentComponent = parentComponent;
		this.parentView = parentView;
		
	}
}









class ComponentSubView extends ComponentView {
	/** @type {string} */
	static objectType = 'ComponentSubView';
}






class ComponentSubViewsHolder {
	/** @type {string} */
	static objectType ='ComponentSubViewsHolder';
	/** @type {ComponentView|RootComponentView} */
	parentView;
	/** @type {ComponentSubView[]} */
	subViews = [];
	/** @type {ComponentSubView[]} */
	memberViews = [];
	/**
	 * @param {ComponentTemplate} template
	 * @param {ComponentView|RootComponentView} parentView
	 */
	constructor(template, parentView) {
		this.parentView = parentView;
	}
	
	/**
	 * @return {ComponentSubView}
	 */
	firstMember() {
		return this.memberViews[0];
	}
	/**
	 * @return {ComponentSubView}
	 */
	lastMember() {
		return this.memberViews[this.memberViews.length - 1];
	}
	/**
	 * @param {number} idx
	 * @return {ComponentSubView}
	 */
	memberAt(idx) {
		return this.memberViews[idx];
	}
	
	/**
	 * @param {number} idx
	 * @param {ComponentView|ComponentSubView} memberView
	 */
	immediateAddMemberAt(idx, memberView) {
		const backToTheFutureAmount = this.memberViews.length - idx;
		registries.views.splice(registries.views.length - backToTheFutureAmount, 0, memberView);
		this.memberViews.splice(idx, 1, memberView);
	}
	
	// Should not be used: 
	// We need the mecanism defined in ComponentView 
	// to define the correct parentView
	addMemberView() {
		console.error('ComponentSubViewsHolder: call to unallowed method "addMemberView');
	}
	
	/**
	 * @param {number} from
	 * @param {number} to
	 * @param {number} viewsRegistryIdx
	 * @param {number} offset
	 */
	moveMemberViewFromTo(from, to, viewsRegistryIdx, offset) {
		this.memberViews.splice(to, 0, this.memberViews.splice(from, 1)[0]);
		if (offset && typeof viewsRegistryIdx === 'number')
			this.immediateAscendViewAFewStepsHelper(offset, viewsRegistryIdx);
	}
	/**
	 * @param {number} to
	 * @param {number} offset
	 * @param {number} viewsRegistryIdx
	 */
	moveLastMemberViewTo(to, offset, viewsRegistryIdx) {
		const from = this.memberViews.length - 1
		if (offset && viewsRegistryIdx)
			this.moveMemberViewFromTo(from, to, offset, viewsRegistryIdx);
	}
	/**
	 * @param {ViewTemplate} vTemplate
	 */
	immediateUnshiftMemberView(vTemplate) {
		const lastView = registries.views.pop();
		const view = new ComponentSubView(vTemplate, this.parentView, this._parent);
		this.memberViews.unshift(view);
		if (lastView)
			registries.views.push(lastView);
		return view;
	}
	/**
	 * @param {number} stepsCount
	 * @param {number} effectiveViewIdx
	 */
	immediateAscendViewAFewStepsHelper(stepsCount, effectiveViewIdx) {
		const ourLatelyAppendedView = registries.views.splice(effectiveViewIdx, 1)[0];
	//	console.log(Registries.viewsRegistry.length, stepsCount, Registries.viewsRegistry[Registries.viewsRegistry.length - 1 - stepsCount]);
		registries.views.splice(effectiveViewIdx - stepsCount, 0, ourLatelyAppendedView);
	}
	
	/**
	 * @param {number} idx
	 */
	resetMemberContent(idx) {
		this.memberViews[idx].reset();
	}
	/**
	 * @param {number} idx
	 * @param {string} textContent
	 */
	setMemberContent(idx, textContent) {
		this.memberViews[idx].setContentNoFail(textContent);
	}
	/**
	 * @param {number} idx
	 * @param {string} textContent
	 */
	setMemberContent_Fast(idx, textContent) {
		this.memberViews[idx].setTextContent(textContent);
	}
	/**
	 * @param {number} idx
	 * @param {string} textContent
	 */
	appendContentToMember(idx, textContent) {
		this.memberViews[idx].appendAsTextNode(textContent);
	}
	/**
	 * @param {number} idx
	 * @param {string} textContent
	 */
	appendAsMemberContent(idx, textContent) {
		this.memberViews[idx].empty();
		this.memberViews[idx].appendAsTextNode(textContent);
	}
	/**
	 * @param {string[]} contentAsArray
	 */
	setEachMemberContent(contentAsArray) {
		contentAsArray.forEach((val, key) => {
			if (typeof val !== 'string')
				return;
			this.setMemberContent(key, val);
		});
	}
	/**
	 * @param {string[]} contentAsArray
	 */
	setEachMemberContent_Fast(contentAsArray) {
		contentAsArray.forEach((val, key) => {
			if (typeof val !== 'string')
				return;
			this.setMemberContent_Fast(key, val);
		});
	}
}





/**
 * This type needs to be aware of its dimensions,
 * so the DOMCanvaView passes a view including a promise 
 * from our implementation of ResizeObserver
 */
class DOMCanvasViewAPI extends DOMViewAPI {
	/** @type {string} */
	static objectType = 'DOMCanvasViewAPI';
	/** @type {ComponentSubView}*/
	canvasView;
	/** @type {CanvasRenderingContext2D} */
	ctx = new CanvasRenderingContext2D(); //  this is dumb: it just solves async acquisition
	/**
	 * @param {ViewTemplate} definition
	 * @param {ComponentView} view
	 */
	constructor(definition, view) {
		super(definition, view);
		this.canvasView = view;
	}
	/**
	 * @param {Promise<DOMRect>} nodeAsAPromise
	 */
	init(nodeAsAPromise) {
		const self = this;
		let canvas;
		nodeAsAPromise.then(function(boundingBox) {
			canvas = self.canvasView.getMasterNode();
			canvas.width = boundingBox.width;
			canvas.height = boundingBox.height;
			self.ctx = canvas.getContext('2d');	
			return boundingBox;
		});
	}
	/**
	 * @param {string} color
	 */
	setFillColor(color) {
		var self = this;
	//	this.view.nodeAsAPromise.then(function() {
			self.ctx.fillStyle = color;
	//	});
	}
	/**
	 * @param {number} x
	 * @param {number} y
	 */
	drawPoint(x, y) {
		var self = this;
	//	this.view.nodeAsAPromise.then(function() {
			self.ctx.fillRect(x, y, 1, 1);
	//	});
	}
	/**
	 * @param {string} startColor
	 * @param {number} colorScaleLength
	 * @param {number} x : x boundary of canvas 
	 * @param {number} y : y boundary of canvas
	 * @param {number} h : h boundary of canvas
	 * @param {number} w : w boundary of canvas
	 */
	gradientFill(startColor, colorScaleLength, x, y, w, h) {
		
	}
}

















class CanvasView extends ComponentView {
	/** @type {string} */
	static objectType = 'CanvasView';
	/** @type {DOMCanvasViewAPI} */
	currentViewAPI;
	/** @type {number} */
	w = 0;
	/** @type {number} */
	h = 0;
	/** @type {Promise<unknown> | null} */
	nodeAsAPromise = null;
	/**
	 * @param {ViewTemplate} definition
	 * @param {ComponentView} parentView
	 */
	constructor(definition, parentView, parent) {
		this.resizeObserver = new ResizeObserver();
		super(definition, parentView, parent);
		this.getDimensions();
		this.currentViewAPI = new DOMCanvasViewAPI(definition, this);
	}
	getDimensions() {
		const self = this;
		this.nodeAsAPromise = new Promise(function(resolve, reject) {
			const inter = setInterval(function() {
				if (self.subViewsHolder.memberAt(0).getMasterNode()) {
					clearInterval(inter);				
					this.resizeObserver.observe(self.getMasterNode(), self.storeDimensions.bind(self, resolve));
				}
			}, 512);
		});
		return this.nodeAsAPromise;
	}
	/**
	 * @param {function} resolve // () => ResizeObserver.BoundingBox (TODO: to be defined)
	 * @param {FormantEvent} e
	 */
	storeDimensions(resolve, e) {
		this.w = e.data.boundingBox.w;
		this.h = e.data.boundingBox.h;
		resolve(e.data.boundingBox);
		this.resizeObserver.unobserve(this.getMasterNode());
	}
	/**
	 * @param {ColorJS.scale} colorScale
	 */
	gradientFill(colorScale) {
		var length = colorScale.max();
		this.callCurrentViewAPI('gradientFill', colorScale[0], colorScale[length], 0, 0, this.w, this.h);
	}
	/**
	 * @param {ColorJS.scale} colorScale
	 * @param {ResizeObserver.BoundingBox} boundaries
	 */
	partialGradientFill(colorScale, boundaries) {
		var length = colorScale.max();
		this.callCurrentViewAPI('gradientFill', colorScale[0], colorScale[length], boundaries.x, boundaries.y, boundaries.w, boundaries.h);
	}
	/**
	 * @param {ColorJS.scale} colorScale
	 * @param {ResizeObserver.BoundingBox} boundaries
	 */
	manualGradientFill(colorScale, boundaries) {
		var self = this;
		var length = 1; //colorScale.max();
		
		this.nodeAsAPromise.then(function(boundingBox) {
			if (typeof boundaries === 'undefined') {
				boundaries = {
					w : boundingBox ? boundingBox.w : self.w,
					h  : boundingBox ? boundingBox.h : self.h,
					x : 0,
					y : 0
				};
			}
			
			for (let x = boundaries.x, l = boundaries.w + boundaries.x; x < l; x++) {
				for (let y = boundaries.y, L = boundaries.h + boundaries.y; y < L; y++) {
					self.callCurrentViewAPI('setFillColor', colorScale((x - boundaries.x) * length / boundaries.w).hex());
					self.callCurrentViewAPI('drawPoint', x, y);	
				}
			}
		});
	}
}
















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
	Pair : Pair,
	ListOfPairs : ListOfPairs,
	DimensionsPair : DimensionsPair,
	EventEmitter : EventEmitter,
	Command : Command,
	Worker : WorkerInterface,
	Stream : Stream,
	Subscription : Subscription,
	LazyResettableColdStream : ColdStream,
	NumberedStream : NumberedStream,
	StreamPool : StreamPool,
	SavableStore : SavableStore,
	RootComponentView : RootComponentView,
	ComponentView : ComponentView,
	ComponentSubView : ComponentSubView,
	ComponentSubViewsHolder : ComponentSubViewsHolder,
	CanvasView : CanvasView,
	StreamToDomInterface
}