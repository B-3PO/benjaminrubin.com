import build from '@thewebformula/lithe/build';

build({
  devWarnings: false,
  chunks: false,
  basedir: 'app/',
  outdir: 'dist/',
  gzip: false,
  copyFiles: [
    { from: 'app/logo-320.png', to: 'dist/' },
    { from: 'app/flash/*', to: 'dist/flash/' },
    { from: 'app/favicon.ico', to: 'dist/' },
    { from: 'app/favicon-16x16.png', to: 'dist/' },
    { from: 'app/favicon-32x32.png', to: 'dist/' }
  ]
});
