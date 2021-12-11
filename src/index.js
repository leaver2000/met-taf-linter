import React from 'react';
import ReactDOM from 'react-dom';
// import App from './app';
import './css/index.css';
import { Linter } from './components/linter';



const root = document.getElementById('root');

ReactDOM.render(
    <React.StrictMode>
        <div style={{ display: 'flex', justifyContent: 'center', backgroundColor: 'black', height: '100vh' }}>
            <Linter />
            hello
		</div>
    </React.StrictMode>,
    root
);
