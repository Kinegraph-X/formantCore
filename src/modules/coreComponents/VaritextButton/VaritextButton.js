/**
 * @module VaritextButton
 */
import {Output} from '../../decorators.js';
import { ComponentWithView } from '../../component/Component.js';
import varitextButtonHostTemplate from './componentTemplates/VaritextButtonHostTemplate.js';
import { EventEmitter } from '../../reactivity/EventEmitter.js';

class VaritextButton extends ComponentWithView {
  static objectType = 'VaritextButton';

  // Primary click output for templates to subscribe on
  @Output() clicked_ok = new EventEmitter('clicked_ok');

  static createDefaultDef() {
    return varitextButtonHostTemplate();
  }

  clickHandler(e, ctx, meta) {
    this.clicked_ok.emit(e);
  }
}

export default VaritextButton;