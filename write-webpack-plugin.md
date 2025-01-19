## Write a Webpack plugin
Among the two most important resources while developing plugins are the `compiler` and `compilation` objects.

The `compiler` object represents the fully configured Webpack environment. When applying a plugin to the Webpack environment, the plugin will receive a reference to this compiler. Use the compiler to access the main Webpack environment.

The `compilation` object represents a single build of versioned assets. A new compilation will be created each time a file change is detected, thus generating a new set of compiled assets. A compilation surfaces information about the present state of module resources, compiled assets, changed files, and watched dependencies.

The `apply` method is Webpack's way of registering a plugin and giving it access to the `compiler` object. Webpack calls `apply` during the initialization phase, before the build process begins, allowing the plugin to set up event hooks and modify the build as necessary.

```js
function HelloWorldPlugin(options) {
  // Setup the plugin instance with options...
}

HelloWorldPlugin.prototype.apply = function(compiler) {
  compiler.plugin('done', function() {
    console.log('Hello World!'); 
  });
};

module.exports = HelloWorldPlugin;
```

Here's an example of a plugin that adds a banner to the top of each generated file. It's simple but demonstrates how Webpack plugins interact with the compilation process.

- `compiler.hooks.emit`: This is one of the last hooks that runs in the compilation lifecycle. It fires right before Webpack writes output files to disk.
- `compilation.assets`: It's an object that represents all the files Webpack will emit.
- `compilation.assets['bundle.js'].source()`: Retrieves the actual content of the asset as a string or a buffer.
- `compilation.assets['bundle.js'].size()`: Returns the size of the asset's content in bytes, helping Webpack manage and report asset sizes accurately.

```js
class SimpleBannerPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    // Hook into the 'emit' phase of Webpack's lifecycle
    compiler.hooks.emit.tap("SimpleBannerPlugin", (compilation) => {
      // Iterate over all compiled assets (output files)
      for (const filename in compilation.assets) {
        if (Object.hasOwnProperty.call(compilation.assets, filename)) {
          // Get the original file content
          const originalSource = compilation.assets[filename].source();
          // Create the banner text
          const banner = `/** ${this.options.banner} */\n`;
          // Concatenate the banner with the original content
          const newSource = banner + originalSource;

          // Replace the original asset content with the new content
          compilation.assets[filename] = {
            source: () => newSource,
            size: () => newSource.length,
          };
        }
      }
    });

    // Example of other common hooks:
    // Runs at the beginning of the compilation
    compiler.hooks.compile.tap('SimpleBannerPlugin', () => {
      console.log('Compilation starting...');
    });

    // Runs after compilation is done
    compiler.hooks.done.tap('SimpleBannerPlugin', () => {
      console.log('Compilation finished!');
    });
  }
}

module.exports = SimpleBannerPlugin;

// const SimpleBannerPlugin = require('./SimpleBannerPlugin');
// module.exports = {
//   plugins: [
//     new SimpleBannerPlugin({ banner: 'This is a banner!' })
//   ]
// };
```
