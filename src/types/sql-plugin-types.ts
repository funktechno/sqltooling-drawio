
export interface ColumnQuantifiers {
    Start: string;
    End: string;
}

export interface TableEntity {
    name: string;
    attributes: TableAttribute[];
}

export interface TableAttribute {
    attributeType: string;
    attributeName: string;
    attributeKeyType?: string;
    // "PK" | "FK"
}