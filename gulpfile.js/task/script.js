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
let cache;

async function js() {
    if (store.arg.prod) {
        const bundle = await rollup.rollup({
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
        });

        await bundle.write({
            file: jsFile,
            format: 'umd',
            name: 'library',
            sourcemap: false,
        });
    } else {
        const bundle = await rollup.rollup({
            cache,
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
        });
        cache = bundle.cache;

        await bundle.write({
            file: jsFile,
            format: 'iife',
            indent: store.arg.speedup ? false : true,
            name: 'library',
            sourcemap: store.arg.speedup ? false : true,
        });
    }
}

exports.js = js;
