// pulled from https://github.com/hediet/vscode-drawio/blob/master/drawio-custom-plugins/src/drawio-types.d.ts
declare const Draw: {
    loadPlugin(handler: (ui: DrawioUI) => void): void;
};

declare const log: any;
declare class mxCellHighlight {
    constructor(graph: DrawioGraph, color: string, arg: number);

    public highlight(arg: DrawioCellState | null): void;
    public destroy(): void;
}


declare class mxCell {
    /**
     * Cells are the elements of the graph model. They represent the state
     * of the groups, vertices and edges in a graph.
     * @param value Optional object that represents the cell value.
     * @param geometry Optional <mxGeometry> that specifies the geometry.
     * @param style Optional formatted string that defines the style.
     */
    constructor(value?: string, geometry?: any, style?: string);

    public vertex: boolean;
    public connectable: boolean;
    public geometry: mxGeometry;
    public style: string;
    public insert(arg: mxCell): void;
}

declare class mxRectangle {
    /**
     * For vertices, the geometry consists of the x- and y-location, and the width
     * and height. For edges, the geometry consists of the optional terminal- and
     * control points. The terminal points are only required if an edge is
     * unconnected, and are stored in the <sourcePoint> and <targetPoint>
     * variables, respectively.
     * Extends <mxRectangle> to represent the geometry of a cell.
     * @param x 
     * @param y 
     * @param width 
     * @param height 
     */
    constructor(x: number, y: number, width: number, height: number);

    public width: number;
    public height: number;
    public x: number;
    public y: number;
}

declare class mxGeometry extends mxRectangle {
    constructor(x: number, y: number, width: number, height: number);
}


declare class mxPoint {
    /**
     * Implements a 2-dimensional vector with double precision coordinates.
     * @param x 
     * @param y 
     */
    constructor(x: number, y: number);

    public x: number;
    public y: number;
}

declare class sb {
    /**
     * Adds the general palette to the sidebar.
     * @param cell 
     * @param value 
     */
    static cloneCell(cell: mxCell, value: string): mxCell;
}

declare class mxResources {
    static parse(value: string): void;
    static get(key: string): string;
}

declare class mxWindow {
    /**
     * Basic window inside a document.
     * @param title String that represents the title of the new window.
     * @param content DOM node that is used as the window content.
     * @param x X-coordinate of the window location.
     * @param y Y-coordinate of the window location.
     * @param width Width of the window.
     * @param height Optional height of the window. Default is to match the height
 * of the content at the specified width.
     * @param minimizable Optional boolean indicating if the window is minimizable.
 * Default is true.
     * @param replaceNode Optional boolean indicating if the window is movable. Default
 * is true.
     * @param style Optional base classname for the window elements. Default is
 * mxWindow.
     */
    constructor(title: string, content: HTMLElement, x: number, y: number, width: number, height?: number, minimizable?: boolean, replaceNode?: boolean, style?: string);
    public setClosable(value: boolean): void;
    public setVisible(value: boolean): void;
    public isVisible(): boolean;
    public setResizable(value: boolean): void;
    public setMaximizable(value: boolean): void;
    public destroyOnClose: boolean;
}

declare class mxMouseEvent {
    public readonly graphX: number;
    public readonly graphY: number;
}

declare const mxEvent: {
    DOUBLE_CLICK: string;
    CHANGE: string;
};

declare const mxUtils: {
    bind(scope: any, funct: (...args: any[]) => void): (...args: any[]) => void;
	button(title: string, funct: () => void): HTMLElement;
	isNode(node: any): node is HTMLElement;
	createXmlDocument(): XMLDocument;
    br(element: HTMLElement);
};


declare interface DrawioUI {
    fileNode: Element | null;
    hideDialog(): void;
    showDialog(...args: any[]): void;
    editor: DrawioEditor;
    actions: DrawioActions;
    menus: DrawioMenus;
    importLocalFile(args: boolean): void;
}

interface DrawioMenus extends Function {
    get(name: string): DrawioMenus | null;
    funct: (...args: any[]) => void;
    enabled: boolean;
    addMenuItems(menu: any, arg: any, arg2: any): void;
}

interface DrawioActions {
    addAction(name: string, action: () => void): void;
    get(name: string): { funct: () => void };
}

declare interface DrawioEditor {
	graph: DrawioGraph;
}

interface CellSize {
    width: number;
    height: number;
}
/**
 * graph not mxGeometry
 */
declare interface DrawioGraph {
	defaultThemeName: string;
	insertVertex(arg0: undefined, arg1: null, label: string, arg3: number, arg4: number, arg5: number, arg6: number, arg7: string): void;
	addListener: any;
	model: DrawioGraphModel;
    getGraphBounds(): mxRectangle;
	getLabel(cell: DrawioCell): string;
	setSelectionCells(cells: DrawioCell[]);
	importCells(cells: mxCell[], x: number, y: number);
	getPreferredSizeForCell(cell: mxCell): CellSize;
	insertEdge(parent: mxCell | null, id: string | null, value: string, source?: mxCell, target?: mxCell, style?: string): DrawioCell;
	getModel(): DrawioGraphModel;
    getFreeInsertPoint(): mxPoint;
	getSelectionCell(): DrawioCell;
	scrollCellToVisible(cell: DrawioCell);
    getSelectionModel(): DrawioGraphSelectionModel;
    view: DrawioGraphView;
    gridSize: number;

    addMouseListener(listener: {
        mouseMove?: (graph: DrawioGraph, event: mxMouseEvent) => void;
        mouseDown?: (graph: DrawioGraph, event: mxMouseEvent) => void;
        mouseUp?: (graph: DrawioGraph, event: mxMouseEvent) => void;
    }): void;
}

declare interface DrawioGraphView {
    getState(cell: DrawioCell): DrawioCellState;
    canvas: SVGElement;
    scale: number;
    translate: mxPoint;
}

declare interface DrawioCellState {
    cell: DrawioCell;
}

declare interface DrawioGraphSelectionModel {
	addListener(event: string, handler: (...args: any[]) => void): void;
    cells: DrawioCell[];
}

declare interface DrawioCell {
    id: string;
    style: string;
    value: string;
    mxObjectId: string;
    children: DrawioCell[];
    edges: DrawioCell[];
    source: DrawioCell;
    target?: DrawioCell;
    parent: DrawioCell;
}

declare interface DrawioGraphModel {
    setValue(c: DrawioCell, label: string | any): void;
    beginUpdate(): void;
    endUpdate(): void;
	cells: Record<any, DrawioCell>;
    setStyle(cell: DrawioCell, style: string): void;
    isVertex(cell: DrawioCell): boolean;
}