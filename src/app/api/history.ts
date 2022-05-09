import { TokenType } from '@linotp/data-models';

export enum HistoryField {
    NUMBER = 'number',
    SERIAL = 'serial',
    DATE = 'date',
    ACTION = 'action',
    ACTION_DETAIL = 'action_detail',
    TOKEN_TYPE = 'tokentype',
    SUCCESS = 'success',
    INFO = 'info'
}

export enum SortOrder {
    ASCENDING = 'asc',
    DESCENDING = 'desc'
}


export interface HistoryRequestOptions {
    page: number;
    recordCount: number;
    sortBy: HistoryField;
    sortOrder: SortOrder;
    query: string;
    queryType: HistoryField | '';
}

export interface HistoryRecord {
    date: Date;
    action: string;
    success: boolean;
    serial: string;
    tokenType: TokenType;
    actionDetail: string;
    info: string;
}

export interface HistoryPage {
    page: number;
    totalRecords: number;
    pageRecords: HistoryRecord[];
}

export interface HistoryResponse {
    page: number;
    total: number;
    rows: {
        id: number,
        cell: string[];
    }[];
}

export function mapCellToRecord(cell: string[]): HistoryRecord {
    return {
        date: new Date(cell[0]),
        action: cell[1],
        success: cell[2] === '1',
        serial: cell[3],
        tokenType: cell[4] ? <TokenType>cell[4] : null,
        actionDetail: cell[6],
        info: cell[7],
    };
}
