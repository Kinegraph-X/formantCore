/**
 * @module TemplateReconcilier
 */

/**
 * @typedef {import('src/coreTest/Component').ComponentWithView} ComponentWithView
 * @typedef {import('src/coreTest/TemplateFactory').DomEventType} DomEventType
 * @typedef {import('src/coreTest/TemplateFactory').DomEventBindings} DomEventBindings
 */
import {Logger, ComponentError} from 'src/coreTest/Error&Log';
import {ComponentTemplate} from 'src/coreTest/TemplateFactory';
import registries from 'src/coreTest/Registries';

class TemplateReconcilier {
	static objectType = 'TemplateReconcilier';

	constructor() {
		throw new Error("TemplateReconciler is static-only; do not instantiate.");
	}
	/**
	 * 
	 * @param {() => ComponentTemplate | void} staticDefaultTemplateGetter 
	 * @param {ComponentTemplate|null} cTemplate
	 * @param {string} objectType
	 */
	static reconcile(staticDefaultTemplateGetter, cTemplate, objectType) {
		let template, cTemplateUID = null;
		
		const defaultTemplate = staticDefaultTemplateGetter();

		if (!defaultTemplate) {
			throw new ComponentError(this, 'Components must provide a template by default', objectType, cTemplate);
		}
		else if (registries.componentTemplate.has(defaultTemplate.UID)) {
			throw new ComponentError(this, 'A component must provide unique instances of its default template.', objectType, defaultTemplate);
		}
		
		const defaultTemplateUID = defaultTemplate.UID;
		if (cTemplate) {
			cTemplateUID = cTemplate.UID;
			template = this.reconciliateWithDefaultTemplate(cTemplate, defaultTemplate, objectType);
		}
		else {
			// Let's allow not passing a template.
			// This signature is used in the documentation
			// (although we had chosen until now to excplicitely mock the def
			//  and to pass it to the specialized constructor)
			template = defaultTemplate;
		}

		this.populateStores(template, defaultTemplateUID);

		return {template, cTemplateUID, defaultTemplateUID};
	}

	/**
	 * @param {ComponentTemplate} cTemplate
	 * @param {ComponentTemplate} defaultTemplate
	 * @param {string} objectType
	 * @returns {ComponentTemplate}
	 */
	static reconciliateWithDefaultTemplate(cTemplate, defaultTemplate, objectType) {
		const defaultViewTemplate = defaultTemplate.view;
		const viewTemplate = cTemplate.view;
		
		// streams declarations can override the default declaration
		const defaultPropsAsArray = defaultTemplate.propsAreArrayOfProps;
		cTemplate.propsAreArrayOfProps.forEach(
			function(templateEntry, key) {
				templateEntry.forEach(
					function(templateValue) {
						let val;
						if (!(val = defaultPropsAsArray[key].findObjectByName(templateValue.name))) {
							defaultPropsAsArray[key].push(templateValue);
						}
						else {
							// debug log override
							val[templateValue.name] = templateValue.value;
						}

					}
				)
			}
		)
		
		// stream subscriptions must add to the default implementation
		// (except if there's a duplicate)
		const defaultPropsAsReactivityQueries = defaultTemplate.propsAreArrayOfReactivityQueries;
		cTemplate.propsAreArrayOfReactivityQueries.forEach(
			(templateEntry, key) => {
				templateEntry.forEach(
					(templateValue, propKey) => {
						if (defaultPropsAsReactivityQueries[key].checkDuplicate(templateValue.from, templateValue.to)) {
							throw new ComponentError(this, 'Overriding stream definition (from & to) in explicit template isn\'t allowed', objectType, templateEntry);
						}
					}
				)
				// debug log addition
				defaultPropsAsReactivityQueries[key].push(...templateEntry);
			}
		);
		
		// Event subscriptions in explicit template are meant to extend the behavior of the component
		const defaultPropsAsEventQueries = defaultTemplate.propsAreArrayOfEventQueries;
		cTemplate.propsAreArrayOfEventQueries.forEach(
			(templateEntry, key) => {
				// debug log addition
				defaultPropsAsEventQueries[key].push(...templateEntry)
			}
		);
		
		const defaultTemplatePorpsAsPrimitives = defaultTemplate.propsArePrimitives;
		cTemplate.propsArePrimitives.forEach(
			function(prop, key) {
				if (prop !== null) {
					// debug log override
					defaultTemplatePorpsAsPrimitives[key] = prop;
				}
			}
		);

		for (const domEventType in viewTemplate.listens) {
			const eventType = /**@type {keyof DomEventBindings}*/ (domEventType);
			if (defaultViewTemplate.listens === null)
				defaultViewTemplate.listens = /** @type {DomEventBindings} */ ({});
			
			defaultViewTemplate.listens[eventType] = viewTemplate.listens[eventType];
		}
		
		if (viewTemplate.sWrapper === null) {
			// debug log not recommanded
			viewTemplate.sWrapper = defaultViewTemplate.sWrapper;
		}

		// Style overrides should not be defined in the default view template:
		// but we met a case were we were wrongly defining it there.
		// That showed that users may want to expect it to work
		// => worst case situation: the default override won't work 
		// if there's an explicit override.
		if (viewTemplate.sOverride !== null) {
			if (defaultViewTemplate.sOverride !== null)
				Logger.error(this, 'Style override in a default template will be overriden by the explicit template (where it should be defined): styles in default template may only be defined by the "sWrapper" property (or use CSSify decorators).', objectType, defaultTemplate);
			defaultViewTemplate.sOverride = viewTemplate.sOverride;
		}
			
		// if (cTemplate.command !== null) {
		// 	// debug log override
		// 	defaultTemplate.command = cTemplate.command;
		// }
		
		// An explicit template can't be an override for child-views: it's too risky
		// if a default implementation relies on certain views being present.
		//		Let's allow adding member-views or member-components.
		if (cTemplate.subSections.length) {
			// debug log addition
			defaultTemplate.subSections.push(...cTemplate.subSections);
		}
		if (cTemplate.members.length) {
			// debug log addition
			defaultTemplate.members.push(...cTemplate.members);
		}

		// test subSection additon, debug log as not allowed

		return defaultTemplate;
	}
	
	/**
	 * @param {ComponentTemplate} cTemplate
	 * @param {string} _templateUID
	 */
	static populateStores(cTemplate, _templateUID) {
		let title;
		// if ((title = cTemplate.view.attributes.getObjectValueByName('title')) && title.slice(0, 1) === '-')
		// 	ElementDecorator['Hyphen-Star-Dash'].decorateAttributes(cTemplate.view.nodeName, cTemplate.view.attributes);
		
		registries.attribute.set(_templateUID, cTemplate.view.attributes);
		registries.prop.set(_templateUID, cTemplate.props);
		registries.state.set(_templateUID, cTemplate.states);
		registries.reactOnParent.set(_templateUID, cTemplate.reactOnParent);
		registries.reactOnSelf.set(_templateUID, cTemplate.reactOnSelf);
		registries.subscribeOnSelf.set(_templateUID, cTemplate.subscribeOnSelf);
		registries.subscribeOnChild.set(_templateUID, cTemplate.subscribeOnChild);
		registries.domListens.set(_templateUID, cTemplate.view.listens);

		registries.componentTemplate.set(_templateUID, cTemplate);
	}
}

export default TemplateReconcilier;