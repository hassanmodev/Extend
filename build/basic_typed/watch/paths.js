"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveOutputJsPath = exports.getCompileTarget = exports.getOutputPath = exports.getRelativeFromSrc = exports.isBadPath = void 0;
const path = require("path");
const config_1 = require("./config");
const isBadPath = (fileName) => {
    const badFileReg = new RegExp(`${config_1.BAD_DIRECTORIES.join("|")}`);
    return Boolean(fileName.match(badFileReg));
};
exports.isBadPath = isBadPath;
const getRelativeFromSrc = (fileName, srcFolder) => {
    const srcPath = path.join(process.cwd(), srcFolder);
    return fileName.replace(srcPath, "");
};
exports.getRelativeFromSrc = getRelativeFromSrc;
const getOutputPath = (fileName, folders) => {
    const relativePath = (0, exports.getRelativeFromSrc)(fileName, folders[0]);
    return path.join(folders[1], relativePath);
};
exports.getOutputPath = getOutputPath;
const getCompileTarget = (fileName, rulesFileName) => {
    const nameList = fileName.split(".");
    if (path.basename(fileName) === rulesFileName)
        return "rules";
    if (nameList.slice(-1).join() === config_1.EXTENSIONS[0].join())
        return "xt";
    if (nameList.slice(-2).join() === config_1.EXTENSIONS[1].join())
        return "xt.js";
    return false;
};
exports.getCompileTarget = getCompileTarget;
const resolveOutputJsPath = (writeName, target) => {
    let outputPath = writeName;
    if (target === "xt.js")
        outputPath = outputPath.replace(".xt", "");
    return outputPath.replace(path.extname(outputPath), ".js");
};
exports.resolveOutputJsPath = resolveOutputJsPath;
