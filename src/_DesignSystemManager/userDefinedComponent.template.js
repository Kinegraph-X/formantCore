/**
 * Exportable template string: the execution is defered until calling the curryied function
 */

// not used currently

//function defer([first, ...rest]) {
//  return (...values) => rest.reduce((acc, str, i) => acc + values[i] + str, first);
//}
//
//module.exports = defer`
//	// console.log(rootComponent._children[0].view.subViewsHolder.memberViews);
//	var targetView = rootComponent._children[0].view.subViewsHolder.lastMember(); 
//	var componentDef = ${null};
//	var injectedComp = new App.componentTypes.CompoundComponent(componentDef, targetView, rootComponent._children[0]);
//	new App.DelayedDecoration();
//	console.log(injectedComp);`;