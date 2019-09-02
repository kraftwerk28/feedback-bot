"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var fs_1 = require("fs");
var js_yaml_1 = require("js-yaml");
var i18n = js_yaml_1.safeLoad(fs_1.readFileSync(path_1.resolve('localization.yml'), { encoding: 'utf8' }));
exports.fromLang = function (localization) {
    return function (token) {
        return i18n.replies[localization][token];
    };
};
