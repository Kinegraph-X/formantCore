/**
 * 
 */
import { ComponentTemplate, ViewTemplate } from '../../template/TemplateFactory.js';
import CreateStyle from '../../../style/CreateStyle.js';

const varitextButtonTemplate = function(options, model) {
    return new ComponentTemplate({
        view: new ViewTemplate({
          nodeName: 'varitext-picto',
          listens: { click: 'clickHandler' }
        }),
        props: [
          { text: undefined },
          { childText : undefined}
        ],
        states : [
            { toggled : undefined }
        ],
        reactOnSelf : [
            {
                from: 'text',
                to : 'childText'
            }
        ],
        members : [
            new ComponentTemplate({
                view : new ViewTemplate({nodeName : 'button-picto'}),
                states: [
                    { toggled : undefined }
                ],
                reactOnParent : [
                    {
                        from : 'toggled',
                        effect : (ctx, value) => {ctx.streams.get('toggled').next = value;}
                    }
                ]
            }),
            new ComponentTemplate({
                view : new ViewTemplate({nodeName : 'span'}),
                reactOnParent : [
                    {
                        from : 'childText',
                        effect : (ctx, value) => {ctx.view.setContent(value);}
                    }
                ]
            })
        ]
      });
}

export default varitextButtonTemplate;