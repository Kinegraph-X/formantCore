/**
 * The css-parser replicates numeric values on the "repr" key
 * as strings, with their unit, to simplify shorthand resolution
 */

export type ParserToken = {
    name? : string,
    type : string,
    value : number | ParserToken[],
    repr : string,
    unit : string,
    tokenType : string
}