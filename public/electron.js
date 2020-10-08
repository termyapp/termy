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

/***/ "./electron/app-manager.ts":
/*!*********************************!*\
  !*** ./electron/app-manager.ts ***!
  \*********************************/
/*! exports provided: appManager */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"appManager\", function() { return appManager; });\nvar AppManager = /** @class */ (function () {\n    function AppManager() {\n        this.windowManager = new Map();\n    }\n    AppManager.prototype.setWindow = function (name, element) {\n        this.windowManager.set(name, element);\n    };\n    AppManager.prototype.getWindow = function (name) {\n        var element = this.windowManager.get(name);\n        if (element) {\n            return element;\n        }\n        throw new Error(\"[AppManager] - Element with name \" + name + \" doesn't exist!\");\n    };\n    AppManager.prototype.deleteWindow = function (name) {\n        this.windowManager.delete(name);\n    };\n    return AppManager;\n}());\nvar appManager = new AppManager();\n\n\n//# sourceURL=webpack:///./electron/app-manager.ts?");

/***/ }),

/***/ "./electron/main.ts":
/*!**************************!*\
  !*** ./electron/main.ts ***!
  \**************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! electron */ \"electron\");\n/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var native__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! native */ \"./node_modules/native/index.js\");\n/* harmony import */ var native__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(native__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _app_manager__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app-manager */ \"./electron/app-manager.ts\");\n/* harmony import */ var _window__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./window */ \"./electron/window.ts\");\n\n\n\n\n// This method will be called when Electron has finished\n// initialization and is ready to create browser windows.\n// Some APIs can only be used after this event occurs.\nelectron__WEBPACK_IMPORTED_MODULE_0__[\"app\"].on('ready', function () {\n    _app_manager__WEBPACK_IMPORTED_MODULE_2__[\"appManager\"].setWindow('window', new _window__WEBPACK_IMPORTED_MODULE_3__[\"Window\"]());\n    electron__WEBPACK_IMPORTED_MODULE_0__[\"app\"].on('activate', function () {\n        // On macOS it's common to re-create a window in the app when the\n        // dock icon is clicked and there are no other windows open.\n        if (electron__WEBPACK_IMPORTED_MODULE_0__[\"BrowserWindow\"].getAllWindows().length === 0)\n            _app_manager__WEBPACK_IMPORTED_MODULE_2__[\"appManager\"].setWindow('window', new _window__WEBPACK_IMPORTED_MODULE_3__[\"Window\"]());\n    });\n    electron__WEBPACK_IMPORTED_MODULE_0__[\"ipcMain\"].on('message', function (event, message) {\n        console.log('got an IPC message', message);\n    });\n});\n// Quit when all windows are closed, except on macOS. There, it's common\n// for applications and their menu bar to stay active until the user quits\n// explicitly with Cmd + Q.\nelectron__WEBPACK_IMPORTED_MODULE_0__[\"app\"].on('window-all-closed', function () {\n    if (process.platform !== 'darwin') {\n        electron__WEBPACK_IMPORTED_MODULE_0__[\"app\"].quit();\n    }\n});\n// Works!!!\nconsole.log(native__WEBPACK_IMPORTED_MODULE_1___default.a.hello());\n\n\n//# sourceURL=webpack:///./electron/main.ts?");

/***/ }),

/***/ "./electron/window.ts":
/*!****************************!*\
  !*** ./electron/window.ts ***!
  \****************************/
/*! exports provided: Window */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Window\", function() { return Window; });\n/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! electron */ \"electron\");\n/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! path */ \"path\");\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_1__);\n\n\nvar Window = /** @class */ (function () {\n    function Window() {\n        this.window = this.createWindow();\n    }\n    Window.prototype.createWindow = function () {\n        var window = new electron__WEBPACK_IMPORTED_MODULE_0__[\"BrowserWindow\"]({\n            width: 1200,\n            height: 1000,\n            webPreferences: {\n                preload: path__WEBPACK_IMPORTED_MODULE_1___default.a.resolve(electron__WEBPACK_IMPORTED_MODULE_0__[\"app\"].getAppPath(), './preload.js'),\n                nodeIntegration: false,\n            },\n        });\n        // Load our index.html (not the react one)\n        window.loadURL('http://localhost:3000');\n        window.webContents.openDevTools();\n        return window;\n    };\n    return Window;\n}());\n\n\n\n//# sourceURL=webpack:///./electron/window.ts?");

/***/ }),

/***/ "./node_modules/native/index.js":
/*!**************************************!*\
  !*** ./node_modules/native/index.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("const addon = __webpack_require__(/*! ./index.node */ \"./node_modules/native/index.node\")\n\nmodule.exports = addon\n\n\n//# sourceURL=webpack:///./node_modules/native/index.js?");

/***/ }),

/***/ "./node_modules/native/index.node":
/*!****************************************!*\
  !*** ./node_modules/native/index.node ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/* WEBPACK VAR INJECTION */(function(module) {\ntry {\n  process.dlopen(module, __dirname + \"/\" + __webpack_require__.p + \"70ece57ffba68c96ec9a3004d8f37394.node\");\n} catch (error) {\n  throw new Error('node-loader:\\n' + error);\n}\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/module.js */ \"./node_modules/webpack/buildin/module.js\")(module)))\n\n//# sourceURL=webpack:///./node_modules/native/index.node?");

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