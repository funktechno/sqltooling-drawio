import { DbRelationshipDefinition } from "@funktechno/little-mermaid-2-the-sql/lib/src/types";

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

export interface DatabaseModelResult {
    getEntities: () => Record<string, TableEntity>;
    getRelationships: () => DbRelationshipDefinition[];
}