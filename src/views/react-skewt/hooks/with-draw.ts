import type { SkewCTX } from './use-skewt';
export default function withDraw(
	type: string, //
	{
		_refs: { skewBackground, skewContainer, divMain, skewSVG }, //
		_styles: { margin, width, height },
		_isoTherms: { mid, range },
		_isoBars: { top, base },
		_loadState: { loaded },
	}: SkewCTX
) {
	switch (type) {
		case 'isoTherms':
			return;
		default:
			return;
	}
}
