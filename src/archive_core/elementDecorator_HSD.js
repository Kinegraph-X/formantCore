/**
 * @mixin elementConstructorDecorator_HSD
 * 
 */


var TypeManager = require('src/core/TypeManager');


var elementConstructorDecorator_HSD = {}

elementConstructorDecorator_HSD['Hyphen-Star-Dash'] = {
		decorateAttributes : function (nodeName, componentAttributes) {
			
			var titleAttr;
			if (!(titleAttr = componentAttributes.findObjectByKey('title')) || typeof titleAttr['title'] !== 'string')
				return;
			
			var labelAttr, attrName, trim;			
			var trim = (titleAttr && typeof titleAttr['title'] === 'string' && titleAttr['title'].indexOf('-') === 0) || false;
			
			// what to do whit existing attributes : not clear.
			// seems this update syntax shall respect the type : test it
//			componentAttributes.forEach(function(attr) {
//				attrName = attr.getName();
//				switch(attrName) {
//					case 'label' :
//						labelAttr = attr['label'] = this.labelDecorator(titleAttr['title'], trim);
//						break;
//					case 'id' :
//						attr['id'] = this.IdDecorator(attr['id'], titleAttr['title'], trim);
//						break;
//					}
//
//			}, this);
			
			if (!(labelAttr = componentAttributes.findObjectByKey('label')))
				componentAttributes.push(new TypeManager.attributesModel({label : (labelAttr = this.labelDecorator(titleAttr['title'], trim))}));
			
			// CAUTION: don't double-decorate the id
			// Here we'd like to rely on a existing id if it's present, but have short-circuited that option for now
			componentAttributes.push(new TypeManager.attributesModel({id : this.IdDecorator('', titleAttr['title'], trim)}));
			
			// clean title completely
			titleAttr['title'] = this.titleDecorator(titleAttr['title'], trim);
			
			// set a name & a placeholder on input nodes
			if (nodeName && nodeName.toLowerCase().match(/input|smart-input/)) {
				componentAttributes.push(new TypeManager.attributesModel({name : this.nameDecorator(titleAttr['title'])}));
				componentAttributes.push(new TypeManager.attributesModel({placeholder : this.placeHolderDecorator(labelAttr)}));
			}

		},
		labelDecorator : function (title, trim) {
			if (trim)
				return title.replace(/_/g, ' ').slice(1);
			else
				return title.replace(/_/g, ' ');
		},
		IdDecorator : function (id, title, trim) {
			if (id && trim)
				return id + title;
			else
				return trim ? title.slice(1) : title.slice(0);
		},
		titleDecorator : function (title, trim) {
			if (trim)
				return title.slice(1);
			else
				return title.slice(0);
		},
		nameDecorator : function (title) {
			return title.replace(/-/g, '').toLowerCase();
		},
		placeHolderDecorator : function (label) {
			return 'Please type a' + (label.toLowerCase().match(/^[aeio]/) ? 'n ' : ' ') + label + '...';
		}
}

module.exports = elementConstructorDecorator_HSD;