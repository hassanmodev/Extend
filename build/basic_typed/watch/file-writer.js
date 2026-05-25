"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOutput = exports.copySource = exports.writeOutput = void 0;
const beautify = require("js-beautify");
const fse = require("fs-extra");
const fs = require("fs");
const logger_1 = require("./logger");
const writeOutput = (processed, fileName) => {
    if (!processed)
        return (0, logger_1.msg)(`${fileName}: got nothing to write.`);
    fse.outputFileSync(fileName, beautify(processed));
    (0, logger_1.msg)("Success.");
};
exports.writeOutput = writeOutput;
const copySource = (sourcePath, outputPath) => {
    (0, exports.writeOutput)(fs.readFileSync(sourcePath).toString(), outputPath);
};
exports.copySource = copySource;
const deleteOutput = (fileName) => {
    fs.unlink(fileName, (error) => {
        if (error) {
            if (error.code === "ENOENT")
                return;
            return console.log("delete error", Object.assign({}, error));
        }
        (0, logger_1.msg)("Deleted.");
    });
};
exports.deleteOutput = deleteOutput;
