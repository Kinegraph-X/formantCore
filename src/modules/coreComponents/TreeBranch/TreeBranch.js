/**
 * @module TreeBranchComponent
 */
import { ComponentWithView } from '../../component/Component.js';
import { treeBranchHostTemplate } from './componentTemplates/TreeBranchHostTemplate.js';
import { EventEmitter } from '../../reactivity/EventEmitter.js';

class TreeBranchComponent extends ComponentWithView {
  static objectType = 'TreeBranchComponent';

  // Emits the payload consumed by the table/outer world
  @output() exportData = new EventEmitter<any>('exportdata');

  static createDefaultDef() {
    return treeBranchHostTemplate();
  }
}

export default TreeBranchComponent;