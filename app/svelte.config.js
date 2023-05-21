import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-auto';

const config = {
  preprocess: preprocess(),
  kit: {
    adapter: adapter(),
  },
};

export default config;
