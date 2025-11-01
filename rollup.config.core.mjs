import 'dotenv/config'
import { fileURLToPath } from 'node:url';
import replace from '@rollup/plugin-replace';
import typescript from 'rollup-plugin-typescript2';
import annotations from 'rollup-plugin-formant-annotations';
import resolve from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import copy from 'rollup-plugin-copy';
import importPaths from 'rollup-plugin-import-paths';
import debugLoadId from 'rollup-plugin-debug-load';
import cssifyFromDB from 'rollup-plugin-cssifyfromdb';

const formantCoreBundleName = 'formantJS';
const distFolder = 'dist/';


export default function () {

  return {
    input: 'src/main.mjs',
    
    output: {
      file: distFolder + formantCoreBundleName + '.js',
      inlineDynamicImports: true,
      format: 'esm',
      sourcemap : true,
      exports : 'auto'
    },

    treeshake : 'recommended',

    plugins: [
      alias({
        entries : [
        ]
      }),
      debugLoadId(),
      resolve(),  // Resolves node_modules
      importPaths({   // creates a virtual module with an entry for each "name"
      	// root : process.cwd(),	// default
        debug : 0,				// could be 1, 2 or 3
        format : 'esm',			// defaults to cjs
        targets : [
          {
            dir : 'src/modules/coreComponents',
            name : 'coreComponentLib',
            filter : '!(_Base)/*.js'
          },
        ]
      }),
      annotations(),
      typescript(),
      replace({   // allow tree-shaking on debug code
        preventAssignment : true,
        values : {
          ["process.env.NODE_ENV"] : JSON.stringify(process.env.NODE_ENV),
        }
      }),
      cssifyFromDB({
        dbURL: 'mongodb://localhost:27017/themed_components',
        include: '**/*.js',
        exclude: 'node_modules/**',
      }),
      copy({
        hook : 'writeBundle',
        targets: [
          { src: 'dist/formantCore.js', dest: '../../node_modules/formantjs' },
          { src: 'dist/formantCore.js.map', dest: '../../node_modules/formantjs' }
        ]
      }),
    ]
  };
}