const fs = require("node:fs");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const { transformFromAstSync } = require("@babel/core");

module.exports = {
  getAST: (path) => {
    const content = fs.readFileSync(path, "utf-8");
    // 1. Babel parser generates AST
    // 2. `sourceType` indicates the mode the code should be parsed in
    // Files with ES6 imports and exports are considered "module" and are otherwise "script".
    return parser.parse(content, {
      // sourceType: "module",
    });
  },
  getDependencies: (ast) => {
    const dependencies = [];
    traverse(ast, {
      // ImportDeclaration: ({ node }) => {
      //   dependencies.push(node.source.value);
      // },
      CallExpression: ({ node }) => {
        if (node.callee.name === 'require' && 
            node.arguments[0].type === 'StringLiteral') {
          dependencies.push(node.arguments[0].value);
        }
      }
    });
    return dependencies;
  },
  transform: (ast) => {
    const { code } = transformFromAstSync(ast, null, {
      presets: ["@babel/preset-env"],
    });

    return code;
  },
};