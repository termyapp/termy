/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./electron/main.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./electron/communication.ts":
/*!***********************************!*\
  !*** ./electron/communication.ts ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! electron */ \"electron\");\n/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _native__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../native */ \"./native/index.js\");\n/* harmony import */ var _native__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_native__WEBPACK_IMPORTED_MODULE_1__);\n\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (function () {\n    electron__WEBPACK_IMPORTED_MODULE_0__[\"ipcMain\"].on('message', function (event, message) {\n        console.log('message: ', message);\n        event.returnValue = handleMessage(message);\n    });\n});\nvar handleMessage = function (message) {\n    switch (message.type) {\n        case 'GET_SUGGESTIONS': {\n            var suggestions = _native__WEBPACK_IMPORTED_MODULE_1___default.a.getSuggestions(message.data.input, message.data.currentDir);\n            console.log('suggestions', suggestions);\n            return suggestions;\n        }\n        case 'NEW_COMMAND': {\n            var _a = message.data, id_1 = _a.id, input = _a.input, currentDir = _a.currentDir;\n            var sendStdout = function (chunk) {\n                electron__WEBPACK_IMPORTED_MODULE_0__[\"ipcMain\"].emit('event', { id: id_1, chunk: chunk });\n            };\n            _native__WEBPACK_IMPORTED_MODULE_1___default.a.newCommand(id_1, input, currentDir, sendStdout);\n        }\n    }\n};\n\n\n//# sourceURL=webpack:///./electron/communication.ts?");

/***/ }),

/***/ "./electron/main.ts":
/*!**************************!*\
  !*** ./electron/main.ts ***!
  \**************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _communication__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./communication */ \"./electron/communication.ts\");\n/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! electron */ \"electron\");\n/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _window__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./window */ \"./electron/window.ts\");\nvar __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\nvar __generator = (undefined && undefined.__generator) || function (thisArg, body) {\n    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;\n    return g = { next: verb(0), \"throw\": verb(1), \"return\": verb(2) }, typeof Symbol === \"function\" && (g[Symbol.iterator] = function() { return this; }), g;\n    function verb(n) { return function (v) { return step([n, v]); }; }\n    function step(op) {\n        if (f) throw new TypeError(\"Generator is already executing.\");\n        while (_) try {\n            if (f = 1, y && (t = op[0] & 2 ? y[\"return\"] : op[0] ? y[\"throw\"] || ((t = y[\"return\"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;\n            if (y = 0, t) op = [op[0] & 2, t.value];\n            switch (op[0]) {\n                case 0: case 1: t = op; break;\n                case 4: _.label++; return { value: op[1], done: false };\n                case 5: _.label++; y = op[1]; op = [0]; continue;\n                case 7: op = _.ops.pop(); _.trys.pop(); continue;\n                default:\n                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }\n                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }\n                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }\n                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }\n                    if (t[2]) _.ops.pop();\n                    _.trys.pop(); continue;\n            }\n            op = body.call(thisArg, _);\n        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }\n        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };\n    }\n};\n\n\n\nvar mainWindow;\n// This method will be called when Electron has finished\n// initialization and is ready to create browser windows.\n// Some APIs can only be used after this event occurs.\nelectron__WEBPACK_IMPORTED_MODULE_1__[\"app\"].on('ready', function () {\n    createMainWindow();\n    Object(_communication__WEBPACK_IMPORTED_MODULE_0__[\"default\"])();\n    setupDevtools();\n});\n// Quit when all windows are closed, except on macOS. There, it's common\n// for applications and their menu bar to stay active until the user quits\n// explicitly with Cmd + Q.\nelectron__WEBPACK_IMPORTED_MODULE_1__[\"app\"].on('window-all-closed', function () {\n    if (process.platform !== 'darwin') {\n        electron__WEBPACK_IMPORTED_MODULE_1__[\"app\"].quit();\n    }\n});\nvar createMainWindow = function () { return __awaiter(void 0, void 0, void 0, function () {\n    return __generator(this, function (_a) {\n        switch (_a.label) {\n            case 0: return [4 /*yield*/, Object(_window__WEBPACK_IMPORTED_MODULE_2__[\"createWindow\"])()];\n            case 1:\n                mainWindow = _a.sent();\n                electron__WEBPACK_IMPORTED_MODULE_1__[\"app\"].on('activate', function () {\n                    return __awaiter(this, void 0, void 0, function () {\n                        return __generator(this, function (_a) {\n                            switch (_a.label) {\n                                case 0:\n                                    if (!(electron__WEBPACK_IMPORTED_MODULE_1__[\"BrowserWindow\"].getAllWindows().length === 0)) return [3 /*break*/, 2];\n                                    return [4 /*yield*/, Object(_window__WEBPACK_IMPORTED_MODULE_2__[\"createWindow\"])()];\n                                case 1:\n                                    _a.sent();\n                                    _a.label = 2;\n                                case 2: return [2 /*return*/];\n                            }\n                        });\n                    });\n                });\n                return [2 /*return*/];\n        }\n    });\n}); };\nvar setupDevtools = function () {\n    try {\n        // https://github.com/electron/electron/issues/23662\n        // await session.defaultSession.loadExtension(\n        //   `/Users/martonlanga/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi`,\n        // )\n    }\n    catch (error) {\n        console.log(error);\n    }\n};\n\n\n//# sourceURL=webpack:///./electron/main.ts?");

/***/ }),

/***/ "./electron/window.ts":
/*!****************************!*\
  !*** ./electron/window.ts ***!
  \****************************/
/*! exports provided: createWindow */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"createWindow\", function() { return createWindow; });\n/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! electron */ \"electron\");\n/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var electron_is_dev__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! electron-is-dev */ \"./node_modules/electron-is-dev/index.js\");\n/* harmony import */ var electron_is_dev__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(electron_is_dev__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! path */ \"path\");\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_2__);\nvar __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\nvar __generator = (undefined && undefined.__generator) || function (thisArg, body) {\n    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;\n    return g = { next: verb(0), \"throw\": verb(1), \"return\": verb(2) }, typeof Symbol === \"function\" && (g[Symbol.iterator] = function() { return this; }), g;\n    function verb(n) { return function (v) { return step([n, v]); }; }\n    function step(op) {\n        if (f) throw new TypeError(\"Generator is already executing.\");\n        while (_) try {\n            if (f = 1, y && (t = op[0] & 2 ? y[\"return\"] : op[0] ? y[\"throw\"] || ((t = y[\"return\"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;\n            if (y = 0, t) op = [op[0] & 2, t.value];\n            switch (op[0]) {\n                case 0: case 1: t = op; break;\n                case 4: _.label++; return { value: op[1], done: false };\n                case 5: _.label++; y = op[1]; op = [0]; continue;\n                case 7: op = _.ops.pop(); _.trys.pop(); continue;\n                default:\n                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }\n                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }\n                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }\n                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }\n                    if (t[2]) _.ops.pop();\n                    _.trys.pop(); continue;\n            }\n            op = body.call(thisArg, _);\n        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }\n        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };\n    }\n};\n\n\n\nvar createWindow = function () { return __awaiter(void 0, void 0, void 0, function () {\n    var window;\n    return __generator(this, function (_a) {\n        switch (_a.label) {\n            case 0:\n                window = new electron__WEBPACK_IMPORTED_MODULE_0__[\"BrowserWindow\"]({\n                    width: 1200,\n                    height: 1000,\n                    webPreferences: {\n                        preload: path__WEBPACK_IMPORTED_MODULE_2___default.a.resolve(electron__WEBPACK_IMPORTED_MODULE_0__[\"app\"].getAppPath(), './preload.js'),\n                        nodeIntegration: false,\n                    },\n                });\n                return [4 /*yield*/, window.loadURL(electron_is_dev__WEBPACK_IMPORTED_MODULE_1___default.a\n                        ? 'http://localhost:3000'\n                        : \"file://\" + path__WEBPACK_IMPORTED_MODULE_2___default.a.join(electron__WEBPACK_IMPORTED_MODULE_0__[\"app\"].getAppPath(), '../build/index.html'))];\n            case 1:\n                _a.sent();\n                window.webContents.openDevTools();\n                return [2 /*return*/, window];\n        }\n    });\n}); };\n\n\n//# sourceURL=webpack:///./electron/window.ts?");

/***/ }),

/***/ "./native/index.js":
/*!*************************!*\
  !*** ./native/index.js ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("const native = __webpack_require__(/*! ./index.node */ \"./native/index.node\")\n\nmodule.exports = native\n\n\n//# sourceURL=webpack:///./native/index.js?");

/***/ }),

/***/ "./native/index.node":
/*!***************************!*\
  !*** ./native/index.node ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/* WEBPACK VAR INJECTION */(function(module) {\ntry {\n  process.dlopen(module, __dirname + \"/\" + __webpack_require__.p + \"e960f2c16321048e8cbb6d0670261f0d.node\");\n} catch (error) {\n  throw new Error('node-loader:\\n' + error);\n}\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/webpack/buildin/module.js */ \"./node_modules/webpack/buildin/module.js\")(module)))\n\n//# sourceURL=webpack:///./native/index.node?");

/***/ }),

/***/ "./node_modules/electron-is-dev/index.js":
/*!***********************************************!*\
  !*** ./node_modules/electron-is-dev/index.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nconst electron = __webpack_require__(/*! electron */ \"electron\");\n\nif (typeof electron === 'string') {\n\tthrow new TypeError('Not running in an Electron environment!');\n}\n\nconst app = electron.app || electron.remote.app;\n\nconst isEnvSet = 'ELECTRON_IS_DEV' in process.env;\nconst getFromEnv = parseInt(process.env.ELECTRON_IS_DEV, 10) === 1;\n\nmodule.exports = isEnvSet ? getFromEnv : !app.isPackaged;\n\n\n//# sourceURL=webpack:///./node_modules/electron-is-dev/index.js?");

/***/ }),

/***/ "./node_modules/webpack/buildin/module.js":
/*!***********************************!*\
  !*** (webpack)/buildin/module.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = function(module) {\n\tif (!module.webpackPolyfill) {\n\t\tmodule.deprecate = function() {};\n\t\tmodule.paths = [];\n\t\t// module.parent = undefined by default\n\t\tif (!module.children) module.children = [];\n\t\tObject.defineProperty(module, \"loaded\", {\n\t\t\tenumerable: true,\n\t\t\tget: function() {\n\t\t\t\treturn module.l;\n\t\t\t}\n\t\t});\n\t\tObject.defineProperty(module, \"id\", {\n\t\t\tenumerable: true,\n\t\t\tget: function() {\n\t\t\t\treturn module.i;\n\t\t\t}\n\t\t});\n\t\tmodule.webpackPolyfill = 1;\n\t}\n\treturn module;\n};\n\n\n//# sourceURL=webpack:///(webpack)/buildin/module.js?");

/***/ }),

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"electron\");\n\n//# sourceURL=webpack:///external_%22electron%22?");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"path\");\n\n//# sourceURL=webpack:///external_%22path%22?");

/***/ })

/******/ });