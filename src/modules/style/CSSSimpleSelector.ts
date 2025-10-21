/**
 * @module CSSSelectorComponent
 */

import {
  splitter,
  hostPseudoFunction,
  attributesComponent,
  interestingTokens,
  typeIsCombinator,
  typeIsUniversal,
  typeIsId,
  typeIsClass,
  typeIsAttribute,
  typeIsHost,
  typeIsTag,
  hasPseudoClass,
  pseudoClassTypeFormat,
  pseudoClassMicroSyntaxFormat,
  shadowDOMHostSpecialKeyword,
} from './CSSSelectorComponentRegexes.js';

import { hyphensToCamel, capitalizeFirstLetter } from '../nativeTypesUtilities/StringUtilities.js';

/**
 * Type constants used to categorize selector components.
 */
export enum TypeConstants {
  unknownType = 0,
  universalType = 1,
  idType = 2,
  classType = 3,
  attributeType = 4,
  tagType = 5,
  hostType = 6,
}

/**
 * Relationship constants (combinators between components)
 */
export enum RelationConstants {
  unknown = 0,
  none = 1,
  descendant = 2,
  immediateDescendant = 3,
  immediateNextSibbling = 4,
  anyForwardSibbling = 5,
}

/**
 * Pseudo-class constants
 */
export enum PseudoClassConstants {
  unknown = 0,
  firstChild = 1,
  lastChild = 2,
  nthChildOdd = 3,
  nthChildEven = 4,
  nthChildANpB = 5,
}

/**
 * Represents the values extracted from a compound selector component.
 * (Minimal stub; replace with your full class implementation.)
 */
export class CSSSelectorAtomValues {
  tagPart: string;
  idPart: string;
  classPart: string[];
  valuesCount: number;

  constructor(
    completeSelector: string,
    tagPart: string,
    idPart: string,
    classPart: string[]
  ) {
    this.tagPart = tagPart;
    this.idPart = idPart;
    this.classPart = classPart;
    this.valuesCount =
      +(!!tagPart) + +(!!idPart) + +(Array.isArray(classPart) && classPart.length > 0);
  }

  getSpecificity(): number {
    const A = +(this.idPart.length > 0);
    const B = this.classPart.length;
    const C = +(this.tagPart.length > 0);
    return (A << 16) | (B << 8) | C;
  }
}

/**
 * A single parsed CSS selector component (e.g. `div.foo#bar[attr=value]:hover`).
 * Handles component type, relation, compound values, pseudo-classes, etc.
 */
export default class CSSSimpleSelector {
  static readonly objectType = 'CSSSelectorComponent';

  objectType: string;
  value: string;
  type: TypeConstants;
  relation: RelationConstants;
  compoundValues: CSSSelectorAtomValues;
  isCompound: boolean;
  hasPseudoClassFlag: number;
  pseudoClassMicroSyntax: number[];
  pseudoClassType: number;
  hasAttributesFlag: number;

  constructor(componentAsStr: string, leftSibling: string) {
    this.objectType = CSSSimpleSelector.objectType;

    this.value = componentAsStr;
    this.type = this.getType(componentAsStr);
    this.relation = this.getRelation(leftSibling);

    this.compoundValues = this.getCompoundValues(componentAsStr);
    this.isCompound = this.compoundValues.valuesCount > 1;

    this.hasPseudoClassFlag = this.getHasPseudoClass(componentAsStr) || 0;
    this.pseudoClassMicroSyntax = [];
    this.pseudoClassType =
      (this.hasPseudoClassFlag && this.getPseudoClassConstant(componentAsStr)) || 0;

    this.hasAttributesFlag = this.getHasAttributes(componentAsStr) || 0;

    if (!this.type || !this.relation) {
      throw new Error(`Invalid CSS selector component: "${componentAsStr}"`);
    }
  }

  /** Determine the type of selector token */
  private getType(componentAsStr: string): TypeConstants {
    if (typeIsId.test(componentAsStr)) return TypeConstants.idType;
    if (typeIsClass.test(componentAsStr)) return TypeConstants.classType;
    if (typeIsAttribute.test(componentAsStr)) return TypeConstants.attributeType;
    if (typeIsTag.test(componentAsStr)) return TypeConstants.tagType;
    if (typeIsHost.test(componentAsStr)) return TypeConstants.hostType;
    if (typeIsUniversal.test(componentAsStr)) return TypeConstants.universalType;
    return TypeConstants.unknownType;
  }

  /** Detect if component has pseudo-class (but is not :host) */
  private getHasPseudoClass(componentAsStr: string): number {
    return +(hasPseudoClass.test(componentAsStr) && !typeIsHost.test(componentAsStr));
  }

  /** Detect if component has attribute selectors */
  private getHasAttributes(componentAsStr: string): number {
    return +attributesComponent.test(componentAsStr);
  }

  /** Parse pseudo-class constant and its micro-syntax */
  private getPseudoClassConstant(componentAsStr: string): number {
    const match = componentAsStr.match(pseudoClassTypeFormat);
    if (match && match.length >= 4) {
      this.isCompound = true;
      const newComponentAsStr = match[1] + (match[4] || '');
      this.compoundValues = this.getCompoundValues(newComponentAsStr);

      const microSyntax = match[3].match(pseudoClassMicroSyntaxFormat);
      if (microSyntax && microSyntax[0]) {
        this.pseudoClassMicroSyntax = [
          microSyntax[1] ? parseInt(microSyntax[1].slice(0, -1)) : 0,
          microSyntax[3] ? parseInt(microSyntax[3]) : 0,
        ];
        return (
          this.pseudoClassConstants[
            hyphensToCamel(match[2]) + 'ANpB' as keyof typeof this.pseudoClassConstants
          ] || PseudoClassConstants.unknown
        );
      }
      const key =
        (hyphensToCamel(match[2]) + capitalizeFirstLetter(match[3])) as keyof typeof this.pseudoClassConstants;
      return this.pseudoClassConstants[key] ?? PseudoClassConstants.unknown;
    }
    return PseudoClassConstants.unknown;
  }

  /** Compute relationship between this and its left sibling */
  private getRelation(leftSibling: string): RelationConstants {
    if (!leftSibling) return RelationConstants.none;
    if (this.isValidComponent(leftSibling)) return RelationConstants.descendant;
    if (leftSibling === interestingTokens.immediateDescendantToken)
      return RelationConstants.immediateDescendant;
    if (leftSibling === interestingTokens.immediateNextSibblingToken)
      return RelationConstants.immediateNextSibbling;
    if (leftSibling === interestingTokens.anyForwardSibblingToken)
      return RelationConstants.anyForwardSibbling;
    throw new Error(
      `CSSSelectorComponent: unsupported relation with leftSibling "${leftSibling}"`
    );
  }

  /** Split into compound selector values (tag/id/class parts) */
  public getCompoundValues(selectorAsStr: string): CSSSelectorAtomValues {
    const idSplit = selectorAsStr.split('#');
    const tagPart = idSplit[0].split('.')[0] || '';
    const idPart = idSplit[1]?.split('.')[0] || '';
    const classPart =
      selectorAsStr.match(/\.[\w-]+/g)?.map((c) => c.slice(1)) || [];
    return new CSSSelectorAtomValues(selectorAsStr, tagPart, idPart, classPart);
  }

  /** Compute specificity value */
  getSpecificity(): number {
    let specificity = 0;
    if (this.isCompound) {
      specificity = this.compoundValues.getSpecificity();
      if (this.hasPseudoClassFlag) specificity |= 1 << 8;
    } else {
      if (this.type === TypeConstants.idType) specificity = 1 << 16;
      else if (
        this.type === TypeConstants.classType ||
        this.type === TypeConstants.attributeType
      )
        specificity = 1 << 8;
      else if (
        this.type === TypeConstants.tagType ||
        this.type === TypeConstants.hostType
      )
        specificity = 1;
      if (this.hasPseudoClassFlag) specificity |= 1 << 8;
    }
    return specificity;
  }

  /** Verify that a sibling string is a valid component */
  private isValidComponent(leftSibling: string): boolean {
    return this.getType(leftSibling) !== TypeConstants.unknownType;
  }

  // constants accessible from instances (mirroring old prototype fields)
  readonly typeConstants = TypeConstants;
  readonly relationConstants = RelationConstants;
  readonly pseudoClassConstants = PseudoClassConstants;
}
