/**
 * @definitions
 */

 /** 
 * @template {keyof HTMLElementTagNameMap} TagNameMapEntry
 * @typedef {keyof HTMLElementTagNameMap[TagNameMapEntry]} ElementProperty
 * */
/** @typedef {ElementProperty<"a">} AnchorProperty */
/** @typedef {ElementProperty<"abbr">} AbbrProperty */
/** @typedef {ElementProperty<"address">} AddressProperty */
/** @typedef {ElementProperty<"area">} AreaProperty */
/** @typedef {ElementProperty<"article">} ArticleProperty */
/** @typedef {ElementProperty<"aside">} AsideProperty */
/** @typedef {ElementProperty<"audio">} AudioProperty */

/** @typedef {ElementProperty<"b">} BProperty */
/** @typedef {ElementProperty<"base">} BaseProperty */
/** @typedef {ElementProperty<"blockquote">} BlockquoteProperty */
/** @typedef {ElementProperty<"body">} BodyProperty */
/** @typedef {ElementProperty<"br">} BrProperty */
/** @typedef {ElementProperty<"button">} ButtonProperty */

/** @typedef {ElementProperty<"canvas">} CanvasProperty */
/** @typedef {ElementProperty<"caption">} CaptionProperty */
/** @typedef {ElementProperty<"cite">} CiteProperty */
/** @typedef {ElementProperty<"code">} CodeProperty */
/** @typedef {ElementProperty<"col">} ColProperty */
/** @typedef {ElementProperty<"colgroup">} ColgroupProperty */

/** @typedef {ElementProperty<"data">} DataProperty */
/** @typedef {ElementProperty<"datalist">} DatalistProperty */
/** @typedef {ElementProperty<"dd">} DdProperty */
/** @typedef {ElementProperty<"del">} DelProperty */
/** @typedef {ElementProperty<"details">} DetailsProperty */
/** @typedef {ElementProperty<"dfn">} DfnProperty */
/** @typedef {ElementProperty<"dialog">} DialogProperty */
/** @typedef {ElementProperty<"div">} DivProperty */
/** @typedef {ElementProperty<"dl">} DlProperty */
/** @typedef {ElementProperty<"dt">} DtProperty */

/** @typedef {ElementProperty<"em">} EmProperty */
/** @typedef {ElementProperty<"embed">} EmbedProperty */

/** @typedef {ElementProperty<"fieldset">} FieldsetProperty */
/** @typedef {ElementProperty<"figcaption">} FigcaptionProperty */
/** @typedef {ElementProperty<"figure">} FigureProperty */
/** @typedef {ElementProperty<"footer">} FooterProperty */
/** @typedef {ElementProperty<"form">} FormProperty */

/** @typedef {ElementProperty<"h1">} H1Property */
/** @typedef {ElementProperty<"h2">} H2Property */
/** @typedef {ElementProperty<"h3">} H3Property */
/** @typedef {ElementProperty<"h4">} H4Property */
/** @typedef {ElementProperty<"h5">} H5Property */
/** @typedef {ElementProperty<"h6">} H6Property */
/** @typedef {ElementProperty<"head">} HeadProperty */
/** @typedef {ElementProperty<"header">} HeaderProperty */
/** @typedef {ElementProperty<"hr">} HrProperty */
/** @typedef {ElementProperty<"html">} HtmlProperty */

/** @typedef {ElementProperty<"i">} IProperty */
/** @typedef {ElementProperty<"iframe">} IframeProperty */
/** @typedef {ElementProperty<"img">} ImgProperty */
/** @typedef {ElementProperty<"input">} InputProperty */
/** @typedef {ElementProperty<"ins">} InsProperty */

/** @typedef {ElementProperty<"kbd">} KbdProperty */
/** @typedef {ElementProperty<"label">} LabelProperty */
/** @typedef {ElementProperty<"legend">} LegendProperty */
/** @typedef {ElementProperty<"li">} LiProperty */
/** @typedef {ElementProperty<"link">} LinkProperty */

/** @typedef {ElementProperty<"main">} MainProperty */
/** @typedef {ElementProperty<"map">} MapProperty */
/** @typedef {ElementProperty<"mark">} MarkProperty */
/** @typedef {ElementProperty<"menu">} MenuProperty */
/** @typedef {ElementProperty<"meta">} MetaProperty */
/** @typedef {ElementProperty<"meter">} MeterProperty */

/** @typedef {ElementProperty<"nav">} NavProperty */
/** @typedef {ElementProperty<"noscript">} NoscriptProperty */

/** @typedef {ElementProperty<"object">} ObjectProperty */
/** @typedef {ElementProperty<"ol">} OlProperty */
/** @typedef {ElementProperty<"optgroup">} OptgroupProperty */
/** @typedef {ElementProperty<"option">} OptionProperty */
/** @typedef {ElementProperty<"output">} OutputProperty */

/** @typedef {ElementProperty<"p">} PProperty */
/** @typedef {ElementProperty<"picture">} PictureProperty */
/** @typedef {ElementProperty<"pre">} PreProperty */
/** @typedef {ElementProperty<"progress">} ProgressProperty */

/** @typedef {ElementProperty<"q">} QProperty */

/** @typedef {ElementProperty<"rp">} RpProperty */
/** @typedef {ElementProperty<"rt">} RtProperty */
/** @typedef {ElementProperty<"ruby">} RubyProperty */

/** @typedef {ElementProperty<"s">} SProperty */
/** @typedef {ElementProperty<"samp">} SampProperty */
/** @typedef {ElementProperty<"script">} ScriptProperty */
/** @typedef {ElementProperty<"section">} SectionProperty */
/** @typedef {ElementProperty<"select">} SelectProperty */
/** @typedef {ElementProperty<"slot">} SlotProperty */
/** @typedef {ElementProperty<"small">} SmallProperty */
/** @typedef {ElementProperty<"source">} SourceProperty */
/** @typedef {ElementProperty<"span">} SpanProperty */
/** @typedef {ElementProperty<"strong">} StrongProperty */
/** @typedef {ElementProperty<"style">} StyleProperty */
/** @typedef {ElementProperty<"sub">} SubProperty */
/** @typedef {ElementProperty<"summary">} SummaryProperty */
/** @typedef {ElementProperty<"sup">} SupProperty */

/** @typedef {ElementProperty<"table">} TableProperty */
/** @typedef {ElementProperty<"tbody">} TbodyProperty */
/** @typedef {ElementProperty<"td">} TdProperty */
/** @typedef {ElementProperty<"template">} TemplateProperty */
/** @typedef {ElementProperty<"textarea">} TextareaProperty */
/** @typedef {ElementProperty<"tfoot">} TfootProperty */
/** @typedef {ElementProperty<"th">} ThProperty */
/** @typedef {ElementProperty<"thead">} TheadProperty */
/** @typedef {ElementProperty<"time">} TimeProperty */
/** @typedef {ElementProperty<"title">} TitleProperty */
/** @typedef {ElementProperty<"tr">} TrProperty */
/** @typedef {ElementProperty<"track">} TrackProperty */

/** @typedef {ElementProperty<"u">} UProperty */
/** @typedef {ElementProperty<"ul">} UlProperty */

/** @typedef {ElementProperty<"var">} VarProperty */
/** @typedef {ElementProperty<"video">} VideoProperty */

/** @typedef {ElementProperty<"wbr">} WbrProperty */


/**
 *
 * @typedef {AnchorProperty   | AbbrProperty     | AddressProperty  | AreaProperty      | ArticleProperty |
*   AsideProperty    | AudioProperty    | BProperty        | BaseProperty      | BlockquoteProperty |
*   BodyProperty     | BrProperty       | ButtonProperty   | CanvasProperty    | CaptionProperty |
*   CiteProperty     | CodeProperty     | ColProperty      | ColgroupProperty  | DataProperty |
*   DatalistProperty | DdProperty       | DelProperty      | DetailsProperty   | DfnProperty |
*   DialogProperty   | DivProperty      | DlProperty       | DtProperty        | EmProperty |
*   EmbedProperty    | FieldsetProperty | FigcaptionProperty | FigureProperty  | FooterProperty |
*   FormProperty     | H1Property       | H2Property       | H3Property        | H4Property |
*   H5Property       | H6Property       | HeadProperty     | HeaderProperty    | HrProperty |
*   HtmlProperty     | IProperty        | IframeProperty   | ImgProperty       | InputProperty |
*   InsProperty      | KbdProperty      | LabelProperty    | LegendProperty    | LiProperty |
*   LinkProperty     | MainProperty     | MapProperty      | MarkProperty      | MenuProperty |
*   MetaProperty     | MeterProperty    | NavProperty      | NoscriptProperty  | ObjectProperty |
*   OlProperty       | OptgroupProperty | OptionProperty   | OutputProperty    | PProperty |
*   PictureProperty  | PreProperty      | ProgressProperty | QProperty         | RpProperty |
*   RtProperty       | RubyProperty     | SProperty        | SampProperty      | ScriptProperty |
*   SectionProperty  | SelectProperty   | SlotProperty     | SmallProperty     | SourceProperty |
*   SpanProperty     | StrongProperty   | StyleProperty    | SubProperty       | SummaryProperty |
*   SupProperty      | TableProperty    | TbodyProperty    | TdProperty        | TemplateProperty |
*   TextareaProperty | TfootProperty    | ThProperty       | TheadProperty     | TimeProperty |
*   TitleProperty    | TrProperty       | TrackProperty    | UProperty         | UlProperty |
*   VarProperty      | VideoProperty    | WbrProperty
* } HTMLElementProperty
*/

module.exports = {};