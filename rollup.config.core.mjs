import { fileURLToPath } from 'node:url';
import annotations from 'rollup-plugin-formant-annotations';
import resolve from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import importPaths from 'rollup-plugin-import-paths';
import debugLoadId from 'rollup-plugin-debug-load';
import cssifyFromDB from 'rollup-plugin-cssifyfromdb';

const formantCoreBundleName = 'formantCore';
const distFolder = 'dist/';

export default function () {

  return {
    input: 'src/main.mjs',
    
    output: {
      file: distFolder + formantCoreBundleName + '.js',
      format: 'esm',
      sourcemap : true,
      exports : 'auto'
    },
    plugins: [
      alias({
        entries : [
        ]
      }),
      debugLoadId(),
      annotations(),
      resolve(),  // Resolves node_modules
      importPaths({
      	// root : process.cwd(),	// default
        debug : 0,				// could be 1, 2 or 3
        format : 'esm',			// defaults to cjs
        targets : [
          {
            dir : '/src/modules/coreComponents',
            name : 'coreComponentLib',
            filter : '!(_Base)/*.js'
          },
        ]
      }),
      cssifyFromDB({
        dbURL: 'mongodb://localhost:27017/themed_components',
        include: '**/*.js',
        exclude: 'node_modules/**',
      }),
    ]
  };
}