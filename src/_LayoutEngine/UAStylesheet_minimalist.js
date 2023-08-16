// ^(([.,\w-\s]+(,\s)?)+)\s\{	=>	{\Rselector : '\1',

var CreateStyle = require('src/core/GenericStyleConstructor');

module.exports = CreateStyle([
	{
		selector : 'a',
		color : '#2f81f7'
	},
	{
		selector: 'p',
		display: 'block',
		marginBlockStart: '1em',
		marginBlockEnd: '1em',
	},
	{
		selector: 'dl, multicol',
		display: 'block',
		marginBlockStart: '1em',
		marginBlockEnd: '1em',
	},
	{
		selector: 'dd',
		display: 'block',
		marginInlineStart: '40px',
	},
	{
		selector: 'blockquote, figure',
		display: 'block',
		marginBlockStart: '1em',
		marginBlockEnd: '1em',
		marginInlineStart: '40px',
		marginInlineEnd: '40px',
	},
	{
		selector: 'h1',
		display: 'block',
		fontSize: '29px',
		lineHeight : '2em',
//		fontWeight: 'bold',
		marginBlockStart: '1em',
		marginBlockEnd: '1em',
	},
	{
		selector: 'h2',
		display: 'block',
		fontSize: '21px',
		lineHeight : '2em',
//		fontWeight: 'bold',
		marginBlockStart: '1em',
		marginBlockEnd: '1em',
	},
	{
		selector: 'h3',
		display: 'block',
		fontSize: '16px',
		lineHeight : '2em',
//		fontWeight: 'bold',
		marginBlockStart: '1em',
		marginBlockEnd: '1em',
	},
	{
		selector: 'h4',
		display: 'block',
		fontSize: '13px',
		lineHeight : '2em',
//		fontWeight: 'bold',
		marginBlockStart: '1em',
		marginBlockEnd: '1em',
	},
	{
		selector: 'h5',
		display: 'block',
		fontSize: '12px',
		lineHeight : '2em',
//		fontWeight: 'bold',
		marginBlockStart: '2em',
		marginBlockEnd: '2em',
	},

	{
		selector: 'h6',
		display: 'block',
		fontSize: '10px',
		lineHeight : '2em',
//		fontWeight: 'bold',
		marginBlockStart: '2em',
		marginBlockEnd: '2em',
	},
	{
		selector: 'xmp, pre, plaintext',
		display: 'block',
		fontFamily: 'Consolas, monospace',
		whiteSpace: 'pre',
		marginBlockStart: '1em',
		marginBlockEnd: '1em',
	},
	{
		selector : 'code',
		color: '#ccc',
		fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
		//fontSize: '1em',
		textAlign: 'left',
		whiteSpace: 'pre',
		wordSpacing: 'normal',
		wordBreak: 'normal',
		wordWrap: 'normal',
		//lineHeight: '1.5',
		tabSize: '4',
		hyphens: 'none'
	}
]);