import esbuild from 'esbuild'

const watch = process.argv.includes('--watch')

const ctx = await esbuild.context({
  entryPoints: ['main.ts'],
  bundle: true,
  format: 'cjs',
  platform: 'node',
  target: 'es2020',
  external: ['obsidian'],
  outfile: 'main.js',
  sourcemap: true,
  loader: {
    '.md': 'text',
  },
})

if (watch) {
  await ctx.watch()
  console.log('watching...')
} else {
  await ctx.rebuild()
  await ctx.dispose()
}
