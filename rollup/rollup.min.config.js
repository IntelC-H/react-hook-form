import { getConfig } from './rollup.config';
import { terser } from 'rollup-plugin-terser';
import pkg from '../package.json';

export default getConfig({
  plugins: [terser()],
  output: [
    {
      file: pkg['module:min'],
      format: 'es',
      sourcemap: true,
    },
    {
      name: 'ReactHookForm',
      file: pkg.unpkg,
      format: 'umd',
      sourcemap: true,
      globals: {
        react: 'React',
      },
    },
  ],
});
