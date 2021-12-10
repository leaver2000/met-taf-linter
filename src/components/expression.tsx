import React from 'react';
export const Expression = React.forwardRef(({ onKeyDown, value, onInput }: { onInput: any; onKeyDown: any; value: any }, ref: any) => {
	return (
		<div style={{ position: 'relative', width: 800, height: 200, border: 'solid red', backgroundColor: 'grey' }}>
			<TextArea onInput={onInput} onKeyDown={onKeyDown} value={value} />
			<PreFormatted>
				<code ref={ref} className='language-html' id='highlighting-content'>
					{value}
				</code>
			</PreFormatted>
		</div>
	);
});
const TextArea = ({ ...props }) => (
	<textarea
		style={{
			//
			...positionDimensions,
			// ...style,
			// ...dims,
			textTransform: 'uppercase',
			zIndex: 1,
			color: 'transparent',
			backgroundColor: 'transparent',
			caretColor: 'white',
		}}
		id='editing'
		spellCheck='false'
		{...props}
	/>
);

const PreFormatted = ({ ...props }) => (
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

const positionDimensions: React.CSSProperties = {
	position: 'absolute',
	top: 0,
	left: 0,
	border: 0,
	margin: '10px',
	padding: '10px',
	height: '150px',
	width: 'calc(100% - 32px)',
};
