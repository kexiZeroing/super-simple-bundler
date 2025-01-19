# Super Simple Bundler

This simple bundler will:
1. Read the entry file (src/index.js)
2. Parse it using Babel to create an AST
3. Find all dependencies
4. Transform the code
5. Generate a bundle in the dist folder

To test the output: `node dist/bundle.js`, and you should see the output: `[Logger]: 5`.

> `@babel/parser`, Babel’s official parser, was born as a fork of Acorn, but it has been completely rewritten. After changing its name from `babylon`, the plug-in system it built was very powerful. Both Webpack and Rollup depend on the Acorn parser. ESBuild presumably has its own, since it's written in Go. Rust-based tools like SWC and OXC roll their own.

### Exploring ASTs
- AST explorer: https://astexplorer.net
- Write a custom babel transformation: https://lihautan.com/step-by-step-guide-for-writing-a-babel-transformation
- Create a Custom ESLint Rule: https://ryankubik.com/blog/eslint-internal-state
- Babel Plugin Handbook: https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md