/**
 * @module ListTemplate
 */

/** @template ReactiveDatasetItem */
/** @typedef {import('./TemplateFactory.js').ComponentTemplate} ComponentTemplate */

import {listUIDGenerator} from  '../UIDGenerator.js';

/**
 * @typedef {import('./TemplateFactory.js').ComponentTemplateDef} ComponentTemplateDef
 */

/**
 * @typedef {Object} ListTemplateDef
 * @property {Boolean} [reflectOnModel]
 * @property {Boolean} [augmentModel]
 * @property {ReactiveDatasetItem[]} each
 * @property {ComponentTemplate} template
 * @property {Number} [section]
 */
 
class ListTemplate {
	/** @type {string} defined by the ctor */
	UID;
	/** @type {boolean} */
	reflectOnModel = true;
	/** @type {ReactiveDatasetItem[]|null} */			// instances of ReactiveDataset.item
	each = null;
	/** @type {ComponentTemplate|null} */
	template = null;
	/** @type {number|null} */
	section = null;
	/** @type {string} @readonly */
	objectType = 'ListTemplate';
	
	/**
	 * @param {ListTemplateDef|null} obj
	 */
	constructor(obj) {
		/** @readonly */ this.UID = listUIDGenerator.newUID();
		if (obj) {
			/** @readonly */ this.reflectOnModel = obj.reflectOnModel || true;
			/** @readonly */ if (obj.each) this.each = obj.each ; // carefull with this reference assigned
			/** @readonly */ if (obj.template) this.template = obj.template;
			/** @readonly */ this.section = obj.section || null;
		}
	}
}

export default ListTemplate;