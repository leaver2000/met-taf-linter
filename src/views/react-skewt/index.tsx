import SkewtLab from './skewt-lab';
// import { sounding } from './data/sounding';
import { ONEVENT, PALETTE } from './util';
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

export default Skewt;
