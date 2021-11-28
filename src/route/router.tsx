import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import Meteogram from '../components/meteogram';
import Skewt from '../views/react-skewt';

export default function Router() {
	return (
		<BrowserRouter>
			<Routes>
				<Route index element={<Skewt />} />
			</Routes>
		</BrowserRouter>
	);
}
