/**
 * @module TreeBranchComponent
 */
import {Output} from '../../decorators.js';
import { Component } from '../../component/Component.js';
import treeBranchHostTemplate from './componentTemplates/TreeBranchHostTemplate.js';
import { EventEmitter } from '../../reactivity/EventEmitter.js';

class TreeBranchComponent extends Component {
  static objectType = 'TreeBranchComponent';

  // Emits the payload consumed by the table/outer world
  @Output() exportData = new EventEmitter('exportdata');

  static createDefaultDef() {
    return treeBranchHostTemplate();
  }
}

export default TreeBranchComponent;