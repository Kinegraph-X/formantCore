/**
 * @module CSSSelectorComponentRegexes
 * Centralized regex definitions and constants used by CSSSelectorComponent.
 */

// General splitting tokens
export const splitter = /\s/;

// Host pseudo-function (e.g. :host(.class))
export const hostPseudoFunction = /^(:host)\((.+?)\)/;

// Attribute selectors like `div[class="foo"]`
export const attributesComponent = /^(\w+?)\[(\w+?)([=~^]+?)(.+?)\]/;

// Tokens relevant for combinators (descendants, siblings, etc.)
export const interestingTokens = {
  immediateDescendantToken: '>',
  immediateNextSibblingToken: '+',
  anyForwardSibblingToken: '~',
};

// CSS selector types
export const typeIsCombinator = /^[>~+]/;
export const typeIsUniversal = /^\*$/;
export const typeIsId = /^#(\w+)/;
export const typeIsClass = /^\.([\w-]+)|\[class.?="([\w-]+)"\]/;
export const typeIsAttribute = attributesComponent;
export const typeIsHost = /^:host/;
export const typeIsTag = /^(?<![\.#\:])[\w_-]+/; // Negative lookbehind

// Pseudo-class detection
export const hasPseudoClass = /(?<=[^:]):[\w-]+/;
export const pseudoClassTypeFormat = /(.+?):([\w-]+?)\(([\wn+-]+?)\)(.+)?/;
export const pseudoClassMicroSyntaxFormat = /(-?[0-9]n\s?)?\s?([+-]?\s?(-?[0-9]*))?/;

// Special keyword for Shadow DOM host
export const shadowDOMHostSpecialKeyword = ':host';
