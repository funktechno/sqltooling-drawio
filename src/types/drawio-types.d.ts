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

interface DrawioMenus {
    get(name: string): any;
    addMenuItems(menu: any, arg: any, arg2: any): void;
}

interface DrawioActions {
    addAction(name: string, action: () => void): void;
    get(name: string): { funct: () => void };
}

declare interface DrawioEditor {
	graph: DrawioGraph;
}

declare interface DrawioGraph {
	defaultThemeName: string;
	insertVertex(arg0: undefined, arg1: null, label: string, arg3: number, arg4: number, arg5: number, arg6: number, arg7: string): void;
	addListener: any;
	model: DrawioGraphModel;
	getLabel(cell: DrawioCell): string;
	getModel(): DrawioGraphModel;
    getSelectionModel(): DrawioGraphSelectionModel;
    view: DrawioGraphView;

    addMouseListener(listener: {
        mouseMove?: (graph: DrawioGraph, event: mxMouseEvent) => void;
        mouseDown?: (graph: DrawioGraph, event: mxMouseEvent) => void
        mouseUp?: (graph: DrawioGraph, event: mxMouseEvent) => void;
    }): void;
}

declare interface DrawioGraphView {
    getState(cell: DrawioCell): DrawioCellState;
    canvas: SVGElement;
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