"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tplant = void 0;
var typescript_1 = __importDefault(require("typescript"));
var PlantUMLFormat_1 = require("./Formatter/PlantUMLFormat");
var ComponentKind_1 = require("./Models/ComponentKind");
var Class_1 = require("./Components/Class");
var FileFactory_1 = require("./Factories/FileFactory");
var MermaidFormat_1 = require("./Formatter/MermaidFormat");
var tplant;
(function (tplant) {
    function generateDocumentation(fileNames, options) {
        if (options === void 0) { options = typescript_1.default.getDefaultCompilerOptions(); }
        var program = typescript_1.default.createProgram(fileNames, options);
        var checker = program.getTypeChecker();
        var result = [];
        program.getSourceFiles()
            .forEach(function (sourceFile) {
            if (!sourceFile.isDeclarationFile) {
                var file = FileFactory_1.FileFactory.create(sourceFile, checker);
                if (file !== undefined) {
                    result.push(file);
                }
            }
        });
        return result;
    }
    tplant.generateDocumentation = generateDocumentation;
    function convertToPlant(files, options) {
        if (options === void 0) { options = {
            associations: false,
            onlyInterfaces: false,
            format: 'plantuml',
            onlyClasses: false
        }; }
        var formatter;
        if (options.format === 'mermaid') {
            formatter = new MermaidFormat_1.MermaidFormat(options);
        }
        else {
            formatter = new PlantUMLFormat_1.PlantUMLFormat(options);
        }
        if (options.onlyClasses) {
            for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
                var file = files_1[_i];
                file.parts = file.parts
                    .filter(function (part) { return part.componentKind === ComponentKind_1.ComponentKind.CLASS; });
            }
        }
        else if (options.onlyInterfaces) {
            for (var _a = 0, files_2 = files; _a < files_2.length; _a++) {
                var file = files_2[_a];
                file.parts = file.parts
                    .filter(function (part) { return part.componentKind === ComponentKind_1.ComponentKind.INTERFACE; });
            }
        }
        else if (options.targetClass !== undefined) {
            var target = findClass(files, options.targetClass);
            var parts = [];
            if (target !== undefined) {
                parts.push(target);
                var parent_1 = target.extendsClass;
                while (parent_1 !== undefined) {
                    var parentClass = findClass(files, parent_1);
                    parts.push(parentClass);
                    parts.push.apply(parts, getInterfaces(files, parentClass));
                    parent_1 = parentClass.extendsClass;
                }
                parts.push.apply(parts, getInterfaces(files, target));
                parts.push.apply(parts, findChildClass(files, target));
            }
            return formatter.renderFiles(parts, false);
        }
        return formatter.renderFiles(files, options.associations);
    }
    tplant.convertToPlant = convertToPlant;
    function getInterfaces(files, comp) {
        var res = [];
        comp?.implementsInterfaces?.forEach(function (impl) {
            var implComponent = findClass(files, impl);
            if (implComponent !== undefined) {
                res.push(implComponent);
            }
        });
        return res;
    }
    function findClass(files, name) {
        for (var _i = 0, files_3 = files; _i < files_3.length; _i++) {
            var file = files_3[_i];
            for (var _a = 0, _b = file.parts; _a < _b.length; _a++) {
                var part = _b[_a];
                if (part.name === name) {
                    return part;
                }
            }
        }
        return undefined;
    }
    function findChildClass(files, comp) {
        var res = [];
        for (var _i = 0, files_4 = files; _i < files_4.length; _i++) {
            var file = files_4[_i];
            file.parts
                .forEach(function (part) {
                if (part instanceof Class_1.Class && (part).extendsClass === comp.name) {
                    res.push(part);
                    part.implementsInterfaces = [];
                    res.push.apply(res, findChildClass(files, part));
                }
            });
        }
        return res;
    }
})(tplant = exports.tplant || (exports.tplant = {}));
