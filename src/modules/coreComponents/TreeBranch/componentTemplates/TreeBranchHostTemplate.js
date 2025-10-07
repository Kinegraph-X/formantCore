import { ComponentTemplate, ViewTemplate } from '../../../template/TemplateFactory.js';
import CreateStyle from '../../../style/CreateStyle.js';

const treeBranchHostTemplate = function(options, model) {
    return new ComponentTemplate({
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
      });
}

export default treeBranchHostTemplate;