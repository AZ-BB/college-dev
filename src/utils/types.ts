import { Database, Tables } from "@/database.types";

export interface QueryFilters<ColumnName extends string & keyof any> {
    column: ColumnName,
    operator: `${'' | 'not.'}${FilterOperator}`,
    value: unknown
}

type FilterOperator =
    | 'eq'
    | 'neq'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'like'
    | 'ilike'
    | 'is'
    | 'isdistinct'
    | 'in'
    | 'cs'
    | 'cd'
    | 'sl'
    | 'sr'
    | 'nxl'
    | 'nxr'
    | 'adj'
    | 'ov'
    | 'fts'
    | 'plfts'
    | 'phfts'
    | 'wfts'
    | 'match'
    | 'imatch'
