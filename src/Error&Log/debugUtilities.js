/**
 * @lib DebugUtilities
 */

 const checkRenderDOMPresence = function(appLauncher) {
	const launcherCode = appLauncher().init.toString();
	
	if (!launcherCode.match(/^[\t\s]*App.renderDOM()/m))
		console.warn('Formant framework init: No call to App.renderDOM() has been found in your launcher code. Only the RootView shall be rendered');
 }
 

 module.exports = {
	checkRenderDOMPresence : checkRenderDOMPresence
 }