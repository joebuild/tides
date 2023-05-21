// vite.config.js
import { sveltekit } from '@sveltejs/kit/vite';
import path from 'path';
import inject from '@rollup/plugin-inject';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import svg from '@poppanator/sveltekit-svg';

const config = {
  plugins: [sveltekit(), svg({ type: 'src' })],

  ssr: {
    noExternal: [
      'svelte-lightweight-charts',
      'lightweight-charts',
      'fancy-canvas',
    ],
  },

  optimizeDeps: {
    include: [
      '@project-serum/anchor',
      '@solana/web3.js',
      '@solana/wallet-adapter-base',
    ],
    esbuildOptions: {
      target: 'esnext',
      plugins: [NodeGlobalsPolyfillPlugin({ buffer: true })],
    },
  },

  define: {
    // This makes @project-serum/anchor 's process error not happen since it replaces all instances of process.env.BROWSER with true
    'process.env.BROWSER': true,
    'process.env.ANCHOR_BROWSER': true,
    'process.env.NODE_DEBUG': JSON.stringify(''),
  },

  resolve: {
    alias: {
      $icons: path.resolve('src/icons/'),
      $idl: path.resolve('src/idl/'),
      $src: path.resolve('src/'),
      $stores: path.resolve('src/stores/'),
      $utils: path.resolve('src/utils/'),

      stream: 'rollup-plugin-node-polyfills/polyfills/stream',
    },
  },

  build: {
    target: 'esnext',
    // ssr: false,
    // chunkSizeWarningLimit: 1000,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      plugins: [
        inject({ Buffer: ['buffer', 'Buffer'] }),
        nodePolyfills({ crypto: true }),
      ],
    },
  },
};

export default config;
