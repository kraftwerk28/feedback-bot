"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DEV = process.env.NODE_ENV !== 'production';
var path_1 = require("path");
var dotenv_1 = require("dotenv");
var dEnvPath = path_1.resolve(process.cwd(), DEV ? '.env.dev' : '.env');
console.log(dEnvPath);
dotenv_1.config({ path: dEnvPath });
