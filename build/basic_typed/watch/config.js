"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_RULES_RELOAD_ATTEMPTS = exports.SAVE_DEBOUNCE_MS = exports.DEFAULT_SETTINGS = exports.EXTENSIONS = exports.RULES_FILE_NAME = exports.IGNORED_PATTERN = exports.BAD_DIRECTORIES = void 0;
exports.BAD_DIRECTORIES = ["git", "node_modules"];
exports.IGNORED_PATTERN = /node_modules|\.git/;
exports.RULES_FILE_NAME = "_extend.js";
exports.EXTENSIONS = [["xt"], ["xt", "js"]];
exports.DEFAULT_SETTINGS = {
    srcFolder: "t1",
    distFolder: "t2",
    codeOpening: "`{{",
    codeClosing: "}}`",
    variableOpening: "{",
    variableClosing: "}",
    arrayOpening: "[",
    arrayClosing: "]",
    escapeCharacter: "#",
    vscodeHighlighting: true,
};
exports.SAVE_DEBOUNCE_MS = 50;
exports.MAX_RULES_RELOAD_ATTEMPTS = 15;
