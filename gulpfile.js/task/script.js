const path = require('path');
const rollup = require('rollup');
const babel = require('@rollup/plugin-babel');
const nodeResolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const terser = require('rollup-plugin-terser');
const destPath = path.resolve('www');
const jsDest = path.join(destPath, 'assets/js');
const jsFile = `${jsDest}/script.js`;
const store = require('../store.js');

/**
 * Process rollup
 *
 * @return {stream}
 */
function js() {
    if (store.arg.prod) {
        return rollup
            .rollup({
                input: './src/js/script.js',
                plugins: [
                    nodeResolve.nodeResolve({
                        browser: true,
                    }),
                    commonjs(),
                    babel.babel({
                        babelHelpers: 'bundled',
                        exclude: 'node_modules/**',
                        babelrc: true,
                        // presets: ["@babel/preset-env"]
                    }),
                    terser.terser(),
                ],
            })
            .then((bundle) => {
                return bundle.write({
                    file: jsFile,
                    format: 'umd',
                    name: 'library',
                    sourcemap: false,
                });
            });
    } else {
        return rollup
            .rollup({
                input: './src/js/script.js',
                treeshake: store.arg.speedup ? false : true,
                plugins: [
                    nodeResolve.nodeResolve({
                        browser: true,
                    }),
                    commonjs(),
                    (() => {
                        return store.arg.speedup
                            ? Promise.resolve()
                            : babel.babel({
                                  babelHelpers: 'bundled',
                                  exclude: 'node_modules/**',
                                  babelrc: true,
                              });
                    })(),
                ],
            })
            .then((bundle) => {
                return bundle.write({
                    file: jsFile,
                    format: 'iife',
                    indent: store.arg.speedup ? false : true,
                    name: 'library',
                    sourcemap: true,
                });
            });
    }
}

exports.js = js;
