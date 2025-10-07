/**
 * @module VaritextButton
 */
import { ComponentWithView } from '../../component/Component.js';
import {varitextButtonHostTemplate} from './componentTemplates/VaritextButtonHostTemplate.js';
import { EventEmitter } from '../../reactivity/EventEmitter.js';

class VaritextButton extends ComponentWithView {
  static objectType = 'VaritextButton';

  // Primary click output for templates to subscribe on
  @output() clicked_ok = new EventEmitter<MouseEvent>('clicked_ok');

  static createDefaultDef() {
    return varitextButtonHostTemplate();
  }

  clickHandler(e) {
    this.clicked_ok.emit(e);
  }
}

export default VaritextButton;