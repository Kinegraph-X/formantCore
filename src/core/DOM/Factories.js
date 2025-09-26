/**
 * @module DOM/Factories
 */

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
 * @typedef {import('src/coreTest/TemplateFactory').AbstractPropArray} AbstractPropArray
 * @typedef {import('src/coreTest/TemplateFactory').State} State
 * @typedef {import('src/coreTest/CoreTypes').Stream<unknown>} Stream
 */


const {Logger, ComponentError} = require('src/coreTest/Error&Log');
const {StreamToDomInterface} = require('src/coreTest/CoreTypes');
const {camelToHyphens} = require('src/coreTest/StringUtilities');
const {tryParseBoolean} = require('src/coreTest/nativeTypesUtilities/BooleanUtilities');



class BaseElementFactory {
    static factoryType = HTMLElement;
    constructor() {
        throw new Error("BaseElementFactory is static-only; do not instantiate.");
    }
    /** @param {string} nodeName */
    static createElement(nodeName) {
        return document.createElement(nodeName);
    }
}

class HTMLElementFactory extends BaseElementFactory {
    static factoryType = HTMLElement;
}
class HTMLDivElementFactory extends BaseElementFactory {
    static factoryType = HTMLDivElement;
}








/**
 * @template customTagName
 */
class HTMLCustomElement extends HTMLElement {
    /** @type {string[]} */
    static observedStates = [];
    /** @type {Map<string, Stream>} */
    #streams = new Map();
    /** @type {string[]} */
    #nonProtectedobservedStates = [];
    /** @type {(string|number|boolean|null|undefined)[]} */
    #stateInitialValues = [];
    constructor() {
        super();
        this.attachShadow({mode : 'open'});
        this.#stateReflection();
    }
    static get observedAttributes() {
        return this.observedStates;
    }
    #stateReflection() {
        /** @type {typeof HTMLCustomElement} */
        (this.constructor).observedStates.forEach(
            (stateName, key) => {
                const name = /** @type {keyof HTMLElement}*/ (stateName);
                if (!HTMLElement.prototype[name]) {
                    let stream;
                    if (!(stream = this.#streams.get(stateName))) {
                        throw new ComponentError(this, 'Unknown custom-element creation error: a State doesn\'t correspond to a Stream', /** @type {typeof HTMLCustomElement}*/ (this).observedStates, this.#streams);
                    }
                    Object.defineProperty(this, stateName, StreamToDomInterface.getPropertyDescriptor.bind(this, stream));
                }
                else {
                    delete this.#nonProtectedobservedStates[key];
                    Logger.debug(this, 'Given State in custom-element overlaps a native dom property:', stateName);
                }
            }
        )
    }
    /** @param {string|number|null|undefined} attrValue*/
    #getTypedValue(attrValue) {
        let ret;
        if (typeof attrValue === 'string')
            return tryParseBoolean(attrValue);
        /** @ts-ignore hacked type-check */
        else if (!isNaN((ret = parseInt(attrValue))))
            return ret;
        else
            console.error('Attribute value', attrValue, 'is neither string, or number, nor boolean', this)
    }
    connectedCallback() {
        /** @type {typeof HTMLCustomElement} */
        (this.constructor).observedStates.forEach((stateName, key) => {
            /** @ts-ignore native overrides have been checked */
            this[stateName] = this.#stateInitialValues[key];
            if (!this.#stateInitialValues[key])
                return;
            // We rely on DOM type-conversion-to-string for other values
            this.setAttribute(stateName, /** @type {string} */ (this.#stateInitialValues[key]));
        });
    }
    /** @param {AbstractPropArray} attributes */
    setAttributes(attributes) {
        attributes.forEach(
            (attrObject) {
                const name = (attrObject.getName());
                if (this.#nonProtectedobservedStates.includes(name)) {
                    this[/** @type {keyof HTMLElement}*/ (name)] = attrObject.getValue();
                }
            }
        );
    }
    /**
     * @param {string} attrName 
     * @param {string} oldVal 
     * @param {string} newVal 
     */
    attributeChangedCallback(attrName, oldVal, newVal) {
        if (this.#nonProtectedobservedStates.includes(attrName)) {
            this[/** @type {keyof HTMLElement}*/ (attrName)] = this.#getTypedValue(newVal);
        }
    }
}




/**
 * @template customTagName
 * @param {customTagName} nodeName 
 * @param {AbstractPropArray|[]} states 
 * @param {Map<string, Stream>} streams 
 */
const defineCustomElem = (nodeName, states, streams) {
    const observedStates = states.map(
        /** @param {State} state */
        (state) => state.name
    );
    const stateInitialValues = states.map(
        /** @param {State} state */
        (state) => state.value
    );
    
    /**
     * @extends HTMLCustomElement<customTagName>
     */
    class HTMLExtendedElement extends HTMLCustomElement {
        /** @type {string[]} */
        static observedStates = observedStates.slice(0);
        /** @type {string[]} */
        #nonProtectedobservedStates = observedStates.slice(0);
        /** @type {(string|number|boolean|null|undefined)[]} */
        #stateInitialValues = stateInitialValues.slice(0);
    }
    customElements.define(/**@type{string}*/(nodeName), HTMLExtendedElement);
}

class HTMLCustomElementFactory {
    static factoryType = HTMLCustomElement;
    constructor() {
        throw new Error("HTMLCustomElementFactory is static-only; do not instantiate.");
    }
    /** 
     * @template customTagName
     * @param {customTagName} nodeName
     * @param {AbstractPropArray|[]} states 
     * @param {Map<string, Stream>} streams
     * @return {HTMLCustomElement<customTagName>}
     */
    static createElement(nodeName, states, streams) {
        if (!customElements.get(/**@type{string}*/(nodeName))) {
			defineCustomElem(nodeName, states, streams);
		}
        return /** @type {HTMLCustomElement<customTagName>}*/ (document.createElement(/**@type{string}*/(nodeName)));
    }
}











// /** @type {{[key : string] : HTMLCustomElementFactory}} */
module.exports = {
    HTMLCustomElement,
    HTMLCustomElementFactory,
    // element : HTMLElementFactory,
    // div : HTMLDivElementFactory,
};