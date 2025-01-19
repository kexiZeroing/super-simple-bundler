const Compiler = require("./compiler");
const options = require("./bundle.config.js");

new Compiler(options).run();