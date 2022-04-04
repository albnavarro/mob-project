const path = require('path');
const rollup = require('rollup');
const babel = require('@rollup/plugin-babel');
const nodeResolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const terser = require('rollup-plugin-terser');
const themePath = path.resolve('src');
const destPath = path.resolve('www');
const jsSourcePath = path.join(themePath, 'js');
const jsDestPath = path.join(destPath, 'assets/js');
const jsSource = `${jsSourcePath}/script.js`;
const jsDest = `${jsDestPath}/script.js`;
const store = require('../store.js');
let cache;

async function js() {
    if (store.arg.prod) {
        const bundle = await rollup.rollup({
            input: jsSource,
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
            file: jsDest,
            format: 'umd',
            name: 'library',
            sourcemap: false,
        });
    } else {
        const bundle = await rollup.rollup({
            cache,
            input: jsSource,
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
            file: jsDest,
            format: 'iife',
            indent: store.arg.speedup ? false : true,
            name: 'library',
            sourcemap: store.arg.speedup ? false : true,
        });
    }
}

exports.js = js;
