module.exports = {
	// allowedStartRules = ["foo", "bar"],
	format: 'umd',
	exportVar: 'foo',
	input: 'fooGrammar.peggy',
	plugins: [require('./plugin.js')],
	testFile: 'myTestInput.foo',
	trace: true,
};
