import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SkewtLab from '../components/skewt-lab';
import Tafgen from '../views/react-tafgen';

export default function Router() {
	return (
		<BrowserRouter>
			<Routes>
				<Route index element={<SkewtLab />} />
				<Route path='/tafgen' element={<Tafgen />} />
			</Routes>
		</BrowserRouter>
	);
}
