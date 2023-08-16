/* PrismJS 1.29.0
https://prismjs.com/download.html#themes=prism-tomorrow&languages=markup+clike+javascript */

// ^(([.,\w-\s]+(,\s)?)+)\s\{	=>	{\Rselector : '\1',

var CreateStyle = require('src/core/GenericStyleConstructor');

module.exports = CreateStyle([
	{
		selector : 'pre.code',
		background: '#2d2d2d',
		padding: '7px 9px',
		margin: '0 1em',
		border : '1px #3D3D3D solid',
		borderRadius: '5px'
		//overflow: 'auto'
	},
	{
		selector : '.block-comment.token, .cdata.token, .comment.token, .doctype.token, .prolog.token',
		color: '#999'
	},
	{
		selector : '.punctuation.token',
		color: '#ccc',
	},
	{
		selector : '.attr-name.token, .deleted.token, .namespace.token, .tag.token',
		color: '#e2777a',
	},
	{
		selector : '.function-name.token',
		color: '#6196cc',
	},
	{
		selector : '.boolean.token, .function.token, .number.token',
		color: '#f08d49',
	},
	{
		selector : '.class-name.token, .constant.token, .property.token, .symbol.token',
		color: '#f8c555',
	},
	{
		selector : '.atrule.token, .builtin.token, .important.token, .keyword.token, .selector.token',
		color: '#cc99cd',
	},
	{
		selector : '.attr-value.token, .char.token, .regex.token, .string.token, .variable.token',
		color: '#7ec699',
	},
	{
		selector : '.entity.token, .operator.token, .url.token',
		color: '#67cdcc',
	},
	{
		selector : '.bold.token, .important.token',
		fontWeight: '700',
	},
	{
		selector : '.italic.token',
		fontStyle: 'italic',
	},
	{
		selector : '.entity.token',
		cursor: 'help',
	},
	{
		selector : '.inserted.token',
		color: 'green',
	}
]);