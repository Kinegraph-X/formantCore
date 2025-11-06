/**
 * @module TreeBranchComponent
 */
import {Output, Component} from '../../decorators.js';
import { ComponentBase } from '../../component/Component.js';
import {ComponentTemplate, ViewTemplate} from '../../template/TemplateFactory';
import treeBranchHostTemplate from './componentTemplates/TreeBranchHostTemplate.js';
import { EventEmitter } from '../../eventEmitter/EventEmitter.js';

@Component({
    view: new ViewTemplate({
      nodeName: 'tree-branch',
      listens: { click: 'clickHandler' }
    }),
    props: [
      { projectedData: undefined }
    ],
    states: [
      { expanded: undefined }
    ]
    // Event subscriptions and children will be configured by the template (branchTemplateDef)
})

class TreeBranchComponent extends ComponentBase {
  static objectType = 'TreeBranchComponent';

  // Emits the payload consumed by the table/outer world
  @Output() exportData = new EventEmitter('exportdata');

}

export default TreeBranchComponent;