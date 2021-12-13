import React from 'react';
export const Expression = React.forwardRef(({ onKeyDown, value, onInput, errorOverlay }: { onInput: any; onKeyDown: any; value: any; errorOverlay: any }, ref: any) => {
	return (
		<div style={{ position: 'relative', width: 800, height: 200, border: `solid ${!!errorOverlay ? 'red' : 'green'}`, backgroundColor: 'grey', ...font }}>
			<TextArea onInput={onInput} onKeyDown={onKeyDown} value={value} />
			<ErrorOverlay errorValue={errorOverlay} />
			<TextOverlay ref={ref} value={value} />
		</div>
	);
});
const TextOverlay = React.forwardRef(({ value }: { value: any }, ref: any) => {
	return (
		<PreFormatted>
			<code ref={ref} className='language-html' id='highlighting-content'>
				{value}
			</code>
		</PreFormatted>
	);
});

function ErrorOverlay({ errorValue }) {
	// TODO: ADDITIONAL ERROR OVERLAYS
	// TODO: INTILISENSE TABNINE EXPECTED

	if (!!errorValue) {
		return <ValueError errorValue={errorValue} />;
	} else return null;
}
const ValueError: React.FC<any> = ({ errorValue }) => {
	const [showDisplay, setShowDisplay] = React.useState(false);
	const [beforeTheError, theError, afterTheError] = errorValue;

	return (
		<pre style={{ ...ErrorStyle, zIndex: 2 }}>
			{beforeTheError}
			<code onClick={(e) => setShowDisplay((disp) => (disp ? false : true))} style={{ textDecoration: 'red wavy underline', cursor: 'pointer' }}>
				{theError}
				{!!showDisplay ? <ErrorDisplay /> : null}
			</code>
			{afterTheError}
		</pre>
	);
};
function ErrorDisplay() {
	// TODO: READ OUT EXPECTED AND AFMAN REFS
	return <div style={{ position: 'absolute', height: 200, width: 200, backgroundColor: 'grey' }}></div>;
}

const TextArea = ({ ...props }) => (
	<textarea
		style={{
			//
			...positionDimensions,
			// cursor: 'cursor',
			textTransform: 'uppercase',
			zIndex: 1,
			color: 'transparent',
			backgroundColor: 'transparent',
			caretColor: 'white',
		}}
		// id='editing'
		spellCheck='false'
		{...props}
	/>
);

export const PreFormatted = ({ ...props }) => (
	<pre
		style={{
			...positionDimensions,
			textTransform: 'uppercase',
			zIndex: 0,
		}}
		id='highlighting'
		aria-hidden='true'
		{...props}
	/>
);
const font = {
	fontSize: '12pt',
	lineHeight: '20pt',
	fontFamily: 'monospace',
	tabSize: 2,
};
const positionDimensions: React.CSSProperties = {
	position: 'absolute',
	top: 0,
	left: 0,
	border: 0,
	margin: '10px',
	padding: '10px',
	height: '150px',
	width: 'calc(100% - 32px)',
	...font,
};
const ErrorStyle: React.CSSProperties = {
	position: 'absolute',
	top: 0,
	left: 0,
	border: 0,
	margin: '10px',
	padding: '10px',
	height: '150px',
	width: 'calc(100% - 32px)',
	textTransform: 'uppercase',
	color: 'transparent',
	// color: 'green',
	// zIndex: 3,
	...font,
};
