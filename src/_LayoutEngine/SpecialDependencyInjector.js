/**
 * Constructor SpecialDependencyInjector
 * 
 * Decorates the HierarchicalComponent's ctor
 * 	adding it some methods to build a "DOM looking" hierarchy.
 * 	We'll be using those methods to construct the NaiveDOM.
 */


var TypeManager = require('src/core/TypeManager');
var CoreTypes = require('src/core/CoreTypes');
var Components = require('src/core/Component');
var UIDGenerator = require('src/core/UIDGenerator').UIDGenerator;

var NaiveDOMNode = require('src/_LayoutEngine/NaiveDOMNode');


// NOTE: should not be a ctor, but helper functions
// to be conditionnaly required / called in dependencyInjector.js
// (actual implementation is very similar to that, making no use of the following ctor)
var SpecialDependencyInjector = function() {
	
}
SpecialDependencyInjector.prototype = {};

SpecialDependencyInjector.prototype.getNaiveDOM = function() {
	return this.getNaiveDOMTree();
}

SpecialDependencyInjector.prototype.getNaiveDOMTree = function () {
	var self= this, nodeUID;
	function getNode(component, parentNode) {
		var node = {
			styleRefstartIdx : 0,
			styleRefLength : 0,
			_UID : component._UID,
			_parentNode : parentNode,
			isShadowHost : component.view.currentViewAPI ? component.view.currentViewAPI.isShadowHost : false,
			name : Object.getPrototypeOf(component).objectType.slice(0),
			textContent : TypeManager.caches.attributes.getItem(component._defUID).getObjectValueByKey('textContent') || '',
			views : {},
			children : [],
			styleDataStructure : component.styleHook ? component.styleHook.s : null
		};
		node.views = this.getInDepthViewStructure(component, node);
		return node;
//		var meta = this.getViewRelatedNodeDescription(component);
	}
	var ret = getNode.call(this, this);
	this.collectNaiveDOMandStyleInDescendants(this, ret, getNode.bind(this));
	return ret;
}

SpecialDependencyInjector.prototype.collectNaiveDOMandStyleInDescendants = function (component, componentTreeParent, getNode) {
	var node;
	
	// We want to be able to render the "code" nodes with syntax highlighting.
	// (mainly when we get those nodes after having converted markdown to the framework's syntax)
	// So we're going to use a highlighting lib at its lowest level
	// in order to add typed node that the layout engine is able to handle
	// (basically, those nodes shall have a class attribuse which shall be interpreted by our CSS engine)
	// REMINDER: inject manually the stylesheet of the Prism lib (the external CSS grabber shall include it in our "inner" CSS rules)
	
	if (component.view.getMasterNode().tagName === 'CODE') {
		if (typeof Prism === 'undefined') {
			console.warn('The Prism-highlighter lib must be included manually in the HTML header (with the data-manual attribute)');
			return componentTreeParent;
		}
		if (Array.prototype.indexOf.call(component.view.getMasterNode().classList, 'language-javascript') !== -1) {
			this.handleCodeNode(component, componentTreeParent);
			return componentTreeParent;
		}
	}
	
	component._children.forEach(function(child) {
//		console.log(child.view.getMasterNode().tagName, child.view.API.nodeName);
		node = getNode(child, componentTreeParent);
		if (Array.isArray(child._children) && child._children.length) {
			componentTreeParent.children.push(this.collectNaiveDOMandStyleInDescendants(child, node, getNode));
		}
		else {
			componentTreeParent.children.push(node);
		}
	}, this);

	return componentTreeParent;
}

SpecialDependencyInjector.prototype.getInDepthViewStructure = function (component, viewsWrapper) {
	var hostNode, subNodesGroup;
	return {
		masterView : (hostNode = new NaiveDOMNode(viewsWrapper, component.view, 0)),
		subSections : (subNodesGroup = component.view.subViewsHolder.subViews.map(function(view) {
			return new NaiveDOMNode(viewsWrapper, view, 1, hostNode, component.view);
		})),
		memberViews : component.view.subViewsHolder.memberViews.map(function(view) {
			return new NaiveDOMNode(viewsWrapper, view, 2, hostNode, component.view, subNodesGroup);
		})
	};
}

SpecialDependencyInjector.prototype.handleCodeNode = function (component, componentTreeParent) {
	var codeNodeTextContent = '', prismTokenStream = [];
	
	codeNodeTextContent = component._children[0].view.getTextContent();
	prismTokenStream = Prism.tokenize(codeNodeTextContent, Prism.languages.javascript);
	this.explorePrismTokenStream(prismTokenStream, componentTreeParent);
}

SpecialDependencyInjector.prototype.explorePrismTokenStream = function (tokenStream, componentTreeParent) {
	var parentNode, tokenTypes = {}, node, textContent = '', lineFeedIdx = 0;
	
	function getNode(parentNode, textContent, isDisplayBlock, tokenType, isClassName) {
		var view = {
			objectType : 'NaiveDOMNode',
			_UID : UIDGenerator.newUID(),
			_parentView : parentNode.views.masterView,
			nodeId : '',
			nodeName : isDisplayBlock ? 'div' : 'span',
			classNames : [],			// the className prop is a shorthand replacing the "className" attributes
														// => handier when matching selectors
			attributes : new CoreTypes.ListOfPairs([
				{
					name : 'textContent',
					value : textContent
				}
			])
		}
		if (tokenType) {
//			console.log(tokenType, textContent);
			view.classNames.push('token', tokenType);
		}
		else  if (isClassName)
			view.classNames.push('token', 'class-name');
		
		
//		else if (textContent === 'App' || textContent === 'App.')
//			view.classNames.push('token', 'constant');	// HACK to beautify our main Factory (DOESN'T WORK, as "host: App." is a single string)
	


		var node = {
			styleRefstartIdx : 0,
			styleRefLength : 0,
			_UID : UIDGenerator.newUID(),
			_parentNode : parentNode,
			isShadowHost : false,
			views : {
				masterView : view,
				subSections : [],
				memberViews : []
			},
			children : [],
			styleDataStructure : null
		};
//		node.views = this.getInDepthViewStructure(component, node);
	
		TypeManager.naiveDOMRegistry.setItem(
			view._UID,
			view
		);
		return node;
	}
	
	parentNode = getNode(componentTreeParent, textContent, true);
	componentTreeParent.children.push(parentNode);
	
	
	var handleToken = function(tokenOrString, key, isClassName) {
		if (tokenOrString instanceof Prism.Token) {
			tokenTypes[tokenOrString.type] = tokenOrString.content;
			
			// A class-name token may content a tokenStream inside
			if (Array.isArray(tokenOrString.content)) {
				tokenOrString.content.forEach(function(subTokenOrString) {
					handleToken(subTokenOrString, key, 'isClassName');
				});
				return;
			}
			
			textContent = tokenOrString.content;
			node = getNode(parentNode, textContent, false, tokenOrString.type, isClassName);
			
			// Avoid building a new parent if the next token (and last from the stream) is an empty string
			if (key === tokenStream.lenngth - 2
					&& textContent === ''
					&& tokenStream[key + 1] === ''
				) {
				return;
			}

			parentNode.children.push(node);
		}
		else {
			textContent = tokenOrString;
			node = getNode(parentNode, textContent, false, null, isClassName);
			
			// Don't generate a new "block" node if the line feed char is the last of the code as as string
			if (key === tokenStream.length - 1
					&& (textContent.indexOf('\n') === tokenOrString.length - 1 || textContent === '')
				) {
				parentNode.children.push(node);
				return;
			}
			else if ((lineFeedIdx = tokenOrString.indexOf('\n')) !== -1) {
				textContent = textContent.split('\n');
				parentNode.children.push(getNode(parentNode, textContent[0], false));
				textContent.shift();
				
				parentNode = getNode(parentNode, '', true);
				parentNode.children.push(getNode(parentNode, textContent.join(), false));
				
				componentTreeParent.children.push(parentNode);
				return;
			}

			parentNode.children.push(node);
		}
	}
	
	
	tokenStream.forEach(function(tokenOrString, key) {
		
		// Start a "block" node
		// if string matches "\n" => close the block node => start a new one
		// Add every "inline" node as child of the curernt "block" node
		
		handleToken(tokenOrString, key);
	});
	
	
	
	
//	var reconstructed = '', chuncksNbr = 0;
//	componentTreeParent.children.forEach(function(child, key){
//		console.log(child.views.masterView.nodeName, child.views.masterView.attributes[0].value);
////		if (key === 0 || key === 1) {
//			child.children.forEach(function(test, idx){
//				console.log(test.views.masterView.nodeName, test.views.masterView.attributes[0].value);	// 
//			});
////		}
//		child.children.forEach(function(strObj) {
//			reconstructed += strObj.textContent;
//			chuncksNbr++;
//		})
//		reconstructed += '\n';
//	})
//	console.log(tokenStream);
}

/*
block-comment

punctuation

attr-name

function-name

boolean
function
number

class-name
constant
property

keyword

attr-value
char
regex
string
variable

entity
operator



*/










//SpecialDependencyInjector.prototype.getViewRelatedNodeDescription = function (view) {
//	var masterNode = view.getMasterNode();
//	
//	return {
//		nodeName : masterNode.nodeName,
//		nodeId : masterNode.Id,
//		classNames : masterNode.classList
//	};
//}






module.exports = SpecialDependencyInjector;