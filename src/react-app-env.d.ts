/// <reference types="react-scripts" />
declare type TSounding = { press: number; hght: number; temp: number; dwpt: number; wdir: number; wspd: number }[];
declare type D3Selection = d3.Selection<any, unknown, null, undefined>;
declare type D3RenderCallback = (element: TSelection) => void;
