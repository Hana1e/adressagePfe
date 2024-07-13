declare module 'shpjs' {
    function shp(file: File): Promise<any>;
    export default shp;
    export function parseShp(buffer: ArrayBuffer): any;
    export function parseGeojson(json: string): any;
}
