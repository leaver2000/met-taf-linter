import Skewt from './skewt';
import { sounding } from './data/sounding';
import './css/skewt.css';

export default function SkewtLab(props: any) {
    return <Skewt data={sounding} />;
}