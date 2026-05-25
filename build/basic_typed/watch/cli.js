"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCliActions = exports.parseCli = void 0;
const commandLineArgs = require("command-line-args");
const fse = require("fs-extra");
const example = __importStar(require("../utils/example"));
const optionDefinitions = [
    { name: "help", alias: "h", type: Boolean },
    { name: "start", alias: "s", type: Boolean },
    { name: "other", defaultOption: true, type: String },
];
const parseCli = () => {
    try {
        return commandLineArgs(optionDefinitions);
    }
    catch (error) {
        const e = error;
        console.log("Unknown argument", e.optionName);
        console.log("Use -h for instructions.");
        process.exit();
    }
};
exports.parseCli = parseCli;
const runCliActions = (options) => {
    if (options.help) {
        console.log("use --start or -s to scaffold a polyglot demo project.\nPlease refer to https://github.com/hassanmodev/Extend for further help.");
        process.exit();
    }
    if (options.start) {
        console.log("Creating a polyglot demo project.");
        example.text.forEach((file) => {
            fse.outputFileSync(file.file, file.text);
        });
    }
};
exports.runCliActions = runCliActions;
