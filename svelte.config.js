import sveltePreprocess from 'svelte-preprocess';
import autoprefixer from 'autoprefixer';
import postcssNested from 'postcss-nested';
import postcssImport from 'postcss-import';
import postcssNormalize from 'postcss-normalize';
import adapter from '@sveltejs/adapter-netlify';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [
    sveltePreprocess({
      postcss: {
        plugins: [autoprefixer, postcssNested, postcssImport, postcssNormalize]
      }
    })
  ],

  kit: {
    adapter: adapter()
  }
};

export default config;
