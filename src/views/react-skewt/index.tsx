import Skewt from './skewt';
import { sounding } from './data/sounding';
import './css/skewt.css';

export default function SkewtLab(props: any) {
	return (
		<Skewt
			data={sounding}
			options={{
				onEvent: {
					click: (e) => void 0,
					focus: (e) => void 0,
					hover: (e) => void 0,
				},
			}}
		/>
	);
}
