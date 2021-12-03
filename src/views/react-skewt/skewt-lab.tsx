import { Command, Control } from './controller/c2';
import { Diagram, Sounding, AxesTicks } from './components/diagram';
import Main from './components/main';
import Clipper from './components/clipper';
import SkewTSVG from './components/skewt-svg';
/**
 * Command and Control are an alias for the React.Context.Provider and React.Fragment
 * The React.Fragment <Control data={data} options={options}> setsState to the Provider
 * A third custrom hook { useC2 } function is exported from './controller/c2'
 * useC2 consumes useContext(CTX) and provides methods to consume and setState
 * in the other various custom hooks.
 *
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
			<AxesTicks />
			<Clipper />
		</SkewTSVG>
	</Main>
);

export default SkewtLab;
