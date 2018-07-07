export interface Options {
    elm: string|HTMLElement;
    color?: string;
    colorFormat?: string;
    pickerStyle?: number;
    embed?: boolean;
    size?: string;
    allowOpacity?: boolean;
    allowClearColor?: boolean;
    showColorValue?: boolean;
    showButtons?: boolean;
    showPalette?: boolean;
    paletteColors?: string[];
    allowPaletteAddColor?: boolean;
}

interface PickerDetail {
    width: number;
    height: number;
    subtractedValue: number;
    container: HTMLDivElement;
    dragger: HTMLDivElement;
}

interface RGBColor {
    r: number;
    g: number;
    b: number;
}

interface RGBAColor extends RGBColor {
    a: number;
}

interface HSLColor {
    h: number;
    s: number;
    l: number;
}

interface HSLAColor extends HSLColor {
    a: number;
}

interface Coordinates {
    x:number;
    y:number;
}

interface ColorValue {
    value: string;
}
export interface RGBColorValue extends ColorValue, RGBColor {}
export interface RGBAColorValue extends ColorValue, RGBAColor {}
export interface HSLColorValue extends ColorValue, HSLColor {}
export interface HSLAColorValue extends ColorValue, HSLAColor {}
export interface HEXColorValue extends ColorValue {}
export type ConvertedColorType = RGBColorValue|RGBAColorValue|HSLColorValue|HSLAColorValue|HEXColorValue;

declare class Cordelia {
    el: HTMLElement;
    elm: { [key:string]: HTMLElement };
    embed: boolean;
    size: string;
    pickerStyle: number;
    colorFormat: string;
    color: string;
    initialColor: string;
    allowOpacity: boolean;
    allowClearColor: boolean;
    showColorValue: boolean;
    showButtons: boolean;
    showPalette: boolean;
    allowPaletteAddColor: boolean;
    paletteColors: string[];
    majorPicker: PickerDetail;
    minorPicker: PickerDetail;
    opacityPicker: PickerDetail;
    rgbaColor: RGBAColor;
    rgbColor: RGBColor;
    hslColor: HSLColor;
    dragStatus: string;

    constructor(o:Options);
    extractAttributes(o:Options): void;
    init(): void;
    setColor(rgba: RGBAColor, eventCall: boolean, input: boolean, picker: boolean): void;
    pickerClicked(event: Event, type: string): void;
    pickerMoved(event: Event): void;
    newPosition(evnet: Event, picker: PickerDetail): Coordinates;
    setColorWithPosition(n: Coordinates, type: string, eventCall?: boolean): void;
    pickerReleased(): void;
    toggleDraggerListeners(status: boolean): void;
    setColorWithValue(): void;
    setColorWithInitialColor(): void;
    clearColor(pass?:boolean): void;
    addColorElementToPalette(rgba: RGBAColor): void;
    addColorToPalette(): void;
    setColorFromPalette(rgba: RGBAColor): void;
    setInitialColorIcon(): void;
    isDark(rgb: RGBColor): boolean;
    opacityToggle(elm: HTMLElement, c: string): Promise<void>;
    openPicker(): void;
    closePicker(e: Event, pass?: boolean): void;
    setPosition(): void;
    get(): ConvertedColorType;
    set(newColor: string): void;
    show(): void;
    hide(): void;
    save(): void;
    cancel(): void;
    getRgbaValue(color: string): RGBAColor;
    convertColor(rgba: RGBAColor): ConvertedColorType;
    rgbTohex(rgb: RGBColor): string;
    rgbTohsl(rgb: RGBColor): HSLColor;
}

export default Cordelia;