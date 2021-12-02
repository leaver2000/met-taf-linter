
import { useMemo, useState } from 'react'
import SkewtLab from './skewt-lab';
import { sounding } from './data/sounding';
import JSONTree from 'react-json-tree';


export default function Skewt() {

    const [options, setOptions] = useState({ gradient: 45, palette: palette1 })


    const onEvent = useMemo(
        () => ({
            click: (e) => { },
            focus: (e) => { },
            hover: (e) => { },
        }),
        []
    );

    return <>
        <JSONTree hideRoot data={options} />
        <button onClick={() => setOptions(({ palette, ...options }) => ({ ...options, palette: palette1, }))}>toggle palette-one</button>
        <button onClick={() => setOptions(({ palette, ...options }) => ({ ...options, palette: palette2, }))}>toggle palette-two</button>
        <SkewtLab data={sounding} options={{ ...options, onEvent }} />
    </>
}




const palette2 = {
    temperature: {
        stroke: '#66d9ef',//blue
        opacity: 1,
        fill: 'none',
    },
    dewpoint: {
        stroke: '#a6e22e',//lime
        opacity: 1,
        fill: 'none',
    },
    isobars: {
        stroke: '#f92672',//red
        opacity: 0.3,
        fill: 'none',
    },
    isotherms: {
        stroke: '#f92672',//red
        opacity: 0.3,
        fill: 'none',
    },
    elr: {
        stroke: '#ae81ff',//purple
        opacity: 0.7,
        fill: 'none',
    },
    isohumes: {
        stroke: 'purple',
        opacity: 0.3,
        fill: 'none',
    },
    dryAdiabats: {
        stroke: '#fd971f',//orange
        opacity: 0.3,
        fill: 'none',
    },
    moistAdiabats: {
        stroke: '#a6e22e',//lime
        opacity: 0.3,
        fill: 'none',
    },
    grid: {
        stroke: 'black',
        opacity: 1,
        fill: 'none',
    },
    background: 'black', //dark grey
    foreground: '#272822', //light grey
};



const palette1 = {
    temperature: {
        stroke: 'red',
        opacity: 1,
        fill: 'none',
    },
    dewpoint: {
        stroke: 'green',
        opacity: 1,
        fill: 'none',
    },
    isobars: {
        stroke: 'black',
        opacity: 0.3,
        fill: 'none',
    },
    isotherms: {
        stroke: 'red',
        opacity: 0.3,
        fill: 'none',
    },
    elr: {
        stroke: 'purple',
        opacity: 0.3,
        fill: 'none',
    },
    isohumes: {
        stroke: 'purple',
        opacity: 0.3,
        fill: 'none',
    },
    dryAdiabats: {
        stroke: 'orange',
        opacity: 0.3,
        fill: 'none',
    },
    moistAdiabats: {
        stroke: 'green',
        opacity: 0.3,
        fill: 'none',
    },
    grid: {
        stroke: 'black',
        opacity: 1,
        fill: 'none',
    },

    background: 'grey', //dark grey
    foreground: 'white', //light grey
};

