"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassFactory = void 0;
var typescript_1 = __importDefault(require("typescript"));
var Class_1 = require("../Components/Class");
var ComponentFactory_1 = require("./ComponentFactory");
var ClassFactory;
(function (ClassFactory) {
  function create(classSymbol, checker) {
    var classDeclarations = classSymbol.getDeclarations();
    var classDeclaration =
      classDeclarations === undefined
        ? undefined
        : classDeclarations[classDeclarations.length - 1];
    let name = classSymbol.getName();

    if (classDeclaration !== undefined && classDeclaration.name !== undefined) {
      name = classDeclaration.name.getText();
    }

    var result = new Class_1.Class(name);

    if (classDeclaration !== undefined) {
      result.isStatic =
        ComponentFactory_1.ComponentFactory.isStatic(classDeclaration);
      result.isAbstract =
        ComponentFactory_1.ComponentFactory.isAbstract(classDeclaration);
    }

    if (classSymbol.members !== undefined) {
      result.members = ComponentFactory_1.ComponentFactory.serializeMethods(
        classSymbol.members,
        checker
      );
      result.typeParameters =
        ComponentFactory_1.ComponentFactory.serializeTypeParameters(
          classSymbol.members,
          checker
        );
    }
    if (classSymbol.exports !== undefined) {
      result.members = result.members.concat(
        ComponentFactory_1.ComponentFactory.serializeMethods(
          classSymbol.exports,
          checker
        )
      );
    }
    if (classSymbol.globalExports !== undefined) {
      result.members = result.members.concat(
        ComponentFactory_1.ComponentFactory.serializeMethods(
          classSymbol.globalExports,
          checker
        )
      );
    }
    if (classDeclaration !== undefined) {
      var heritageClauses = classDeclaration.heritageClauses;
      if (heritageClauses !== undefined) {
        heritageClauses.forEach(function (heritageClause) {
          if (
            heritageClause.token ===
            typescript_1.default.SyntaxKind.ExtendsKeyword
          ) {
            result.extendsClass =
              ComponentFactory_1.ComponentFactory.getExtendsHeritageClauseName(
                heritageClause
              );
          } else if (
            heritageClause.token ===
            typescript_1.default.SyntaxKind.ImplementsKeyword
          ) {
            result.implementsInterfaces =
              ComponentFactory_1.ComponentFactory.getImplementsHeritageClauseNames(
                heritageClause
              );
          }
        });
      }
    }
    return result;
  }
  ClassFactory.create = create;
})((ClassFactory = exports.ClassFactory || (exports.ClassFactory = {})));
