import { Command, Control } from './controller/c2';
import Main from './components/main';
import Clipper from './components/clipper';
import SkewTSVG from './components/skewt-svg';
import { ONEVENT, PALETTE } from './util';
import { Diagram } from './components/diagram';
import { Sounding } from './components/sounding';
import { Ticks } from './components/ticks';

/**
 * Command and Control are an alias for the React.Context.Provider and React.Fragment
 * The React.Fragment <Control data={data} options={options}> setsState to the Provider
 * A third custrom hook { useC2 } function is exported from './controller/c2'
 * useC2 consumes useContext(CTX) and provides methods to consume and setState
 * in the other various custom hooks.
 */
const SkewtLab = ({ data, options }) => (
	<Command>
		<Control data={data} options={options}>
			<Components />
		</Control>
	</Command>
);

const Components = () => (
	<Main>
		<SkewTSVG>
			<Diagram />
			<Sounding />
			<Ticks />
			<Clipper />
		</SkewTSVG>
	</Main>
);

/**
 * ### react-skewt
 * 
 * 
 `data parameter`
 ```
 type data = {
    press: number;
    hght: number;
    temp: number;
    dwpt: number;
    wdir: number;
    wspd: number;
}[]
```

 `options parameter`

 ```
 type options = {
    palette:{};
    onEvent:{
       click:(e)=>{...}
       hover:(e)=>{...}
	}
    gradient: number;
}

```
 */
const Skewt = ({ data, options: { palette, gradient, onEvent } }: SKEWT) => {
	return (
		<SkewtLab
			//
			data={data}
			options={{
				palette: !!palette ? palette : PALETTE,
				gradient: !!gradient ? gradient : -45,
				onEvent: !!onEvent ? onEvent : ONEVENT,
			}}
		/>
	);
};

interface SKEWT {
	data: SkewTData;
	options: {
		palette?: LineTypes;
		gradient?: number;
		onEvent?: {
			click: (e) => void;
			hover: (e) => void;
		};
	};
}
export default Skewt;
