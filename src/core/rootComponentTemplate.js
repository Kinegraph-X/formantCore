/**
 * Template definition for RootComponent
 * 
 * @CSSify styleName : rootComponentHost
 * @CSSifyTheme themeName : basic-dark
 * 
 */
// const {TemplateFactory, CreateStyle} = require('formantjs');
const {ComponentTemplate} = require('src/coreTest/TemplateFactory');


const rootComponentDef = function(options, model) {
    /**@CSSify DEBUG */		// Remove the whitespace between @CSSify and the word DEBUG to log the stylesheet definition
        
    // If a "styleName" defined above exists in DB, component styles are injected on the placeholder below (rollup-plugin-CSSifyFromDB)
    /**@CSSifySlots placeholder */
    
    return new ComponentTemplate({
        view : {
            nodeName : 'app-root'
            /**@CSSifyStyle componentStyle : rootComponentHost */
        }
    });
}

module.exports = rootComponentDef;