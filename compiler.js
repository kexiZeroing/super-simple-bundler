const fs = require("fs");
const path = require("path");
const { getAST, getDependencies, transform } = require("./parser");

module.exports = class Compiler {
  constructor(options) {
    const { entry, output } = options;
    this.entry = entry;
    this.output = output;
    this.modules = [];
  }

  run() {
    const entryModule = this.buildModule(this.entry, true);
    if (!entryModule) {
      throw new Error(`Entry module ${this.entry} could not be built`);
    }

    this.modules.push(entryModule);
    this.modules.map((_module) => {
      _module.dependencies.map((dependency) => {
        this.modules.push(this.buildModule(dependency));
      });
    });
    
    this.emitFiles();
  }

  resolveModule(filename, basePath = '') {
    const possiblePaths = [
      filename,
      `${filename}.js`,
      path.join(process.cwd(), 'src', filename),
      path.join(process.cwd(), 'src', `${filename}.js`),
      path.join(basePath, filename),
      path.join(basePath, `${filename}.js`)
    ];

    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        return possiblePath;
      }
    }

    throw new Error(`Cannot resolve module '${filename}' from '${basePath}'`);
  }

  buildModule(filename, isEntry = false) {
    try {
      let modulePath;
      if (isEntry) {
        modulePath = this.resolveModule(filename);
      } else {
        modulePath = this.resolveModule(filename, path.join(process.cwd(), 'src'));
      }

      const ast = getAST(modulePath);
      
      return {
        filename,
        dependencies: getDependencies(ast),
        transformCode: transform(ast),
      };
    } catch (error) {
      console.error(`Error building module ${filename}:`, error.message);
      return null;
    }
  }

  emitFiles() {
    try {
      const outputPath = path.join(this.output.path, this.output.filename);
      
      // Ensure output directory exists
      fs.mkdirSync(this.output.path, { recursive: true });

      let modules = "";
      this.modules.forEach((_module) => {
        if (_module && _module.transformCode) {
          modules += `'${_module.filename}': function (require, module, exports) { ${_module.transformCode} },`;
        }
      });

      const bundle = `
        (function(modules) {
          function require(fileName) {
            const fn = modules[fileName];
            if (typeof fn !== 'function') {
              throw new Error('Module not found: ' + fileName);
            }

            const module = { exports: {} };

            fn(require, module, module.exports);

            return module.exports;
          }

          require('${this.entry}');
        })({${modules}})
      `;

      fs.writeFileSync(outputPath, bundle, "utf-8");
      console.log(`Bundle written to ${outputPath}`);
    } catch (error) {
      console.error('Error emitting files:', error.message);
      throw error;
    }
  }
};