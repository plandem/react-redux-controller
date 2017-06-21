import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify';

const env = process.env.NODE_ENV;

const config = {
	entry: 'src/index.js',
	format: 'umd',
	moduleName: 'react-redux-controller',
	external: [
		'react',
		'redux',
		'react-redux',
		'prop-types',
	],
	globals: {
		'react': 'React',
		'redux': 'Redux',
		'react-redux': 'ReactRedux',
		'prop-types': 'PropTypes',
	},
	sourceMap: true,
	plugins: [
		nodeResolve({
			extensions: ['.js', '.jsx']
		}),
		babel({
			exclude: '**/node_modules/**'
		}),
		replace({
			'process.env.NODE_ENV': JSON.stringify(env)
		}),
		commonjs(),
	],
};

if (env === 'production') {
	config.plugins.push(
		uglify({
			compress: {
				pure_getters: true,
				unsafe: true,
				unsafe_comps: true,
				warnings: false
			}
		})
	)
}

export default config;