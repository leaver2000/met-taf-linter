import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import './index.css';
// import './confg.js';
const root = document.getElementById('root');
// const StrictApp = () =>

ReactDOM.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	root
);
