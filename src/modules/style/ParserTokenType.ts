

export type ParserToken = {
    name? : string,
    type? : string,
    propertyType? : string,
    value : number | ParserToken[],
    repr : string,
    unit : string,
    tokenType : string
}