"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCompileHandler = exports.compile = void 0;
const config_1 = require("./config");
const file_writer_1 = require("./file-writer");
const paths_1 = require("./paths");
const logger_1 = require("./logger");
const settings_loader_1 = require("./settings-loader");
const fs = require("fs");
const compileModule = require("../core/compile");
const compile = (runtime, fileName) => __awaiter(void 0, void 0, void 0, function* () {
    if ((0, paths_1.isBadPath)(fileName)) {
        return console.log("bad dir");
    }
    const outputPath = (0, paths_1.getOutputPath)(fileName, runtime.folders);
    const compileTarget = (0, paths_1.getCompileTarget)(fileName, runtime.rulesFileName);
    if (compileTarget === "rules") {
        runtime.userRules = (0, settings_loader_1.loadUserRules)(runtime.rulesFullPath);
        (0, logger_1.msg)("Updated rules.");
        return;
    }
    if (!compileTarget) {
        return (0, file_writer_1.copySource)(fileName, outputPath);
    }
    let sourceCode;
    try {
        sourceCode = fs.readFileSync(fileName).toString();
    }
    catch (_a) {
        console.log(`An error has occured, please make sure file ${fileName} exists.`);
        return;
    }
    const relativeName = (0, paths_1.getRelativeFromSrc)(fileName, runtime.folders[0]).slice(1);
    let value = compileModule.processCode(sourceCode, runtime.userRules, relativeName).text;
    (0, file_writer_1.writeOutput)(value, (0, paths_1.resolveOutputJsPath)(outputPath, compileTarget));
});
exports.compile = compile;
const createCompileHandler = (runtime) => {
    return (fileName) => __awaiter(void 0, void 0, void 0, function* () {
        yield new Promise((resolve) => setTimeout(resolve, config_1.SAVE_DEBOUNCE_MS));
        yield (0, exports.compile)(runtime, fileName);
    });
};
exports.createCompileHandler = createCompileHandler;
