import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SkewtLab from '../components/skewt-lab';
import Tafgen from '../views/react-tafgen';
import DashOne from '../views/dash-one';
import { CTXController } from '../controller/ctx-controller';
export default function Router() {
    return (
        <CTXController>
            <BrowserRouter>
                <Routes>
                    <Route index element={<SkewtLab />} />
                    <Route path='/tafgen' element={<Tafgen />} />
                    <Route path='/dashone' element={<DashOne />} />
                </Routes>
            </BrowserRouter>
        </CTXController>
    );
}
