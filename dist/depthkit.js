(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DEFAULT_VALUES = {
    emitDelay: 10,
    strictMode: false
};

/**
 * @typedef {object} EventEmitterListenerFunc
 * @property {boolean} once
 * @property {function} fn
 */

/**
 * @class EventEmitter
 *
 * @private
 * @property {Object.<string, EventEmitterListenerFunc[]>} _listeners
 * @property {string[]} events
 */

var EventEmitter = function () {

    /**
     * @constructor
     * @param {{}}      [opts]
     * @param {number}  [opts.emitDelay = 10] - Number in ms. Specifies whether emit will be sync or async. By default - 10ms. If 0 - fires sync
     * @param {boolean} [opts.strictMode = false] - is true, Emitter throws error on emit error with no listeners
     */

    function EventEmitter() {
        var opts = arguments.length <= 0 || arguments[0] === undefined ? DEFAULT_VALUES : arguments[0];

        _classCallCheck(this, EventEmitter);

        var emitDelay = void 0,
            strictMode = void 0;

        if (opts.hasOwnProperty('emitDelay')) {
            emitDelay = opts.emitDelay;
        } else {
            emitDelay = DEFAULT_VALUES.emitDelay;
        }
        this._emitDelay = emitDelay;

        if (opts.hasOwnProperty('strictMode')) {
            strictMode = opts.strictMode;
        } else {
            strictMode = DEFAULT_VALUES.strictMode;
        }
        this._strictMode = strictMode;

        this._listeners = {};
        this.events = [];
    }

    /**
     * @protected
     * @param {string} type
     * @param {function} listener
     * @param {boolean} [once = false]
     */


    _createClass(EventEmitter, [{
        key: '_addListenner',
        value: function _addListenner(type, listener, once) {
            if (typeof listener !== 'function') {
                throw TypeError('listener must be a function');
            }

            if (this.events.indexOf(type) === -1) {
                this._listeners[type] = [{
                    once: once,
                    fn: listener
                }];
                this.events.push(type);
            } else {
                this._listeners[type].push({
                    once: once,
                    fn: listener
                });
            }
        }

        /**
         * Subscribes on event type specified function
         * @param {string} type
         * @param {function} listener
         */

    }, {
        key: 'on',
        value: function on(type, listener) {
            this._addListenner(type, listener, false);
        }

        /**
         * Subscribes on event type specified function to fire only once
         * @param {string} type
         * @param {function} listener
         */

    }, {
        key: 'once',
        value: function once(type, listener) {
            this._addListenner(type, listener, true);
        }

        /**
         * Removes event with specified type. If specified listenerFunc - deletes only one listener of specified type
         * @param {string} eventType
         * @param {function} [listenerFunc]
         */

    }, {
        key: 'off',
        value: function off(eventType, listenerFunc) {
            var _this = this;

            var typeIndex = this.events.indexOf(eventType);
            var hasType = eventType && typeIndex !== -1;

            if (hasType) {
                if (!listenerFunc) {
                    delete this._listeners[eventType];
                    this.events.splice(typeIndex, 1);
                } else {
                    (function () {
                        var removedEvents = [];
                        var typeListeners = _this._listeners[eventType];

                        typeListeners.forEach(
                        /**
                         * @param {EventEmitterListenerFunc} fn
                         * @param {number} idx
                         */
                        function (fn, idx) {
                            if (fn.fn === listenerFunc) {
                                removedEvents.unshift(idx);
                            }
                        });

                        removedEvents.forEach(function (idx) {
                            typeListeners.splice(idx, 1);
                        });

                        if (!typeListeners.length) {
                            _this.events.splice(typeIndex, 1);
                            delete _this._listeners[eventType];
                        }
                    })();
                }
            }
        }

        /**
         * Applies arguments to specified event type
         * @param {string} eventType
         * @param {*[]} eventArguments
         * @protected
         */

    }, {
        key: '_applyEvents',
        value: function _applyEvents(eventType, eventArguments) {
            var typeListeners = this._listeners[eventType];

            if (!typeListeners || !typeListeners.length) {
                if (this._strictMode) {
                    throw 'No listeners specified for event: ' + eventType;
                } else {
                    return;
                }
            }

            var removableListeners = [];
            typeListeners.forEach(function (eeListener, idx) {
                eeListener.fn.apply(null, eventArguments);
                if (eeListener.once) {
                    removableListeners.unshift(idx);
                }
            });

            removableListeners.forEach(function (idx) {
                typeListeners.splice(idx, 1);
            });
        }

        /**
         * Emits event with specified type and params.
         * @param {string} type
         * @param eventArgs
         */

    }, {
        key: 'emit',
        value: function emit(type) {
            var _this2 = this;

            for (var _len = arguments.length, eventArgs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                eventArgs[_key - 1] = arguments[_key];
            }

            if (this._emitDelay) {
                setTimeout(function () {
                    _this2._applyEvents.call(_this2, type, eventArgs);
                }, this._emitDelay);
            } else {
                this._applyEvents(type, eventArgs);
            }
        }

        /**
         * Emits event with specified type and params synchronously.
         * @param {string} type
         * @param eventArgs
         */

    }, {
        key: 'emitSync',
        value: function emitSync(type) {
            for (var _len2 = arguments.length, eventArgs = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                eventArgs[_key2 - 1] = arguments[_key2];
            }

            this._applyEvents(type, eventArgs);
        }

        /**
         * Destroys EventEmitter
         */

    }, {
        key: 'destroy',
        value: function destroy() {
            this._listeners = {};
            this.events = [];
        }
    }]);

    return EventEmitter;
}();

module.exports = EventEmitter;

},{}],2:[function(require,module,exports){
module.exports = function(strings) {
  if (typeof strings === 'string') strings = [strings]
  var exprs = [].slice.call(arguments,1)
  var parts = []
  for (var i = 0; i < strings.length-1; i++) {
    parts.push(strings[i], exprs[i] || '')
  }
  parts.push(strings[i])
  return parts.join('')
}

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventEmitterEs = require('event-emitter-es6');

var _eventEmitterEs2 = _interopRequireDefault(_eventEmitterEs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } //DepthKit.js plugin for Three.js

/**
 * Originally written by
 * @author mrdoob / http://mrdoob.com
 * @modified by obviousjim / http://specular.cc
 */

/* Made into a plugin after the completion of the Tzina project by
 *  @author juniorxsound / http://orfleisher.com
 *  @modified by avnerus / http://avner.js.org
 */

//Three.js - for easy debugging and testing, should be excluded from the build
// import * as THREE from 'three'

//Event emitter for providing event handlers from the class


// bundling of GLSL code
var glsl = require('glslify');

var DepthKit = function (_EventEmitter) {
    _inherits(DepthKit, _EventEmitter);

    function DepthKit() {
        var _type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'mesh';

        var _props = arguments[1];
        var _movie = arguments[2];

        var _ret;

        var _poster = arguments[3];

        _classCallCheck(this, DepthKit);

        //Load the shaders
        var _this = _possibleConstructorReturn(this, (DepthKit.__proto__ || Object.getPrototypeOf(DepthKit)).call(this));

        var rgbdFrag = glsl(["#define GLSLIFY 1\nuniform sampler2D map;\nuniform float opacity;\n\nuniform float uvdy;\nuniform float uvdx;\n\nvarying float visibility;\nvarying vec2 vUv;\nvarying vec3 vNormal;\nvarying vec3 vPos;\n\nvoid main() {\n\n    if ( visibility < 0.75 ) discard;\n\n    vec4 color = texture2D( map, vUv + vec2(uvdx, uvdy));\n    color.w = opacity;\n\n    gl_FragColor = color;\n    \n}"]);
        var rgbdVert = glsl(["#define GLSLIFY 1\nuniform float mindepth;\nuniform float maxdepth;\n\nuniform float width;\nuniform float height;\n\nuniform bool isPoints;\nuniform float pointSize;\n\nuniform float time;\n\nvarying vec3 vNormal;\nvarying vec3 vPos;\n\n//TODO: make uniforms\nconst float fx = 1.11087;\nconst float fy = 0.832305;\n\nuniform sampler2D map;\n\n//Making z global\nfloat z;\n\nvarying float visibility;\nvarying vec2 vUv;\n\nvec3 rgb2hsl( vec3 color ) {\n    float h = 0.0;\n    float s = 0.0;\n    float l = 0.0;\n    float r = color.r;\n    float g = color.g;\n    float b = color.b;\n    float cMin = min( r, min( g, b ) );\n    float cMax = max( r, max( g, b ) );\n    l =  ( cMax + cMin ) / 2.0;\n    if ( cMax > cMin ) {\n        float cDelta = cMax - cMin;\n        // saturation\n        if ( l < 0.5 ) {\n            s = cDelta / ( cMax + cMin );\n        } else {\n            s = cDelta / ( 2.0 - ( cMax + cMin ) );\n        }\n\n        // hue\n        if ( r == cMax ) {\n            h = ( g - b ) / cDelta;\n        } else if ( g == cMax ) {\n            h = 2.0 + ( b - r ) / cDelta;\n        } else {\n            h = 4.0 + ( r - g ) / cDelta;\n        }\n\n        if ( h < 0.0) {\n            h += 6.0;\n        }\n        h = h / 6.0;\n\n    }\n    return vec3( h, s, l );\n}\n\nvec3 xyz( float x, float y, float depth ) {\n    z = depth * ( maxdepth - mindepth ) + mindepth;\n    return vec3( ( x / height  ) * z * fx, ( y / (width * 2.0)  ) * z * fy, - z );\n}\n\nvoid main() {\n\n    vUv = vec2( ( position.x + 512.0 ) / 1024.0 , ( position.y + 512.0  ) / 1024.0 );\n\n    vUv.y = vUv.y * 0.5;// + 0.5;\n\n    vPos = (modelMatrix * vec4(position, 1.0 )).xyz;\n    vNormal = normalMatrix * normal;\n\n    vec3 hsl = rgb2hsl( texture2D( map, vUv ).xyz );\n    vec4 pos = vec4( xyz( position.x, position.y, hsl.x ), 1.0 );\n    pos.z += 2600.0;\n\n    visibility = hsl.z * 2.1;\n\n    if(isPoints){\n        gl_PointSize = pointSize;\n    }\n\n    gl_Position = projectionMatrix * modelViewMatrix * pos;\n}"]);

        //For building the geomtery
        _this.VERTS_WIDE = 256;
        _this.VERTS_TALL = 256;
        _this.precision = 3;

        //Video element
        _this.video = document.createElement('video');
        _this.video.crossOrigin = 'anonymous';
        _this.video.setAttribute('crossorigin', 'anonymous');
        _this.video.src = _movie;
        _this.video.autoplay = false;
        _this.video.loop = false;

        //Create a video texture to be passed to the shader
        _this.videoTexture = new THREE.VideoTexture(_this.video);
        _this.videoTexture.minFilter = THREE.NearestFilter;
        _this.videoTexture.magFilter = THREE.LinearFilter;
        _this.videoTexture.format = THREE.RGBFormat;
        _this.videoTexture.generateMipmaps = false;

        //Manages loading of assets internally
        _this.manager = new THREE.LoadingManager();

        //JSON props once loaded
        _this.props;

        //Geomtery
        _this.geo = _this.buildGeomtery();

        //Material
        _this.material = new THREE.ShaderMaterial({
            uniforms: {
                "diffuse": {
                    type: 'c',
                    value: new THREE.Color(0x0000ff)
                },
                "map": {
                    type: "t",
                    value: _this.videoTexture
                },
                "time": {
                    type: "f",
                    value: 0.0
                },
                "mindepth": {
                    type: "f",
                    value: 0.0
                },
                "maxdepth": {
                    type: "f",
                    value: 0.0
                },
                "uvdy": {
                    type: "f",
                    value: 0.5
                },
                "uvdx": {
                    type: "f",
                    value: 0.0
                },
                "width": {
                    type: "f",
                    value: 0
                },
                "height": {
                    type: "f",
                    value: 0
                },
                "opacity": {
                    type: "f",
                    value: 1.0
                },
                "isPoints": {
                    type: "b",
                    value: false
                },
                "pointSize": {
                    type: "f",
                    value: 3.0
                }
            },
            vertexShader: rgbdVert,
            fragmentShader: rgbdFrag,
            transparent: true

        });

        //Make the shader material double sided
        _this.material.side = THREE.DoubleSide;

        //Switch a few things based on selected rendering type and create the mesh
        switch (_type) {
            case 'wire':
                _this.material.wireframe = true;
                _this.mesh = new THREE.Mesh(_this.geo, _this.material);
                break;

            case 'points':
                _this.material.uniforms.isPoints.value = true;
                _this.mesh = new THREE.Points(_this.geo, _this.material);
                break;

            default:
                _this.mesh = new THREE.Mesh(_this.geo, _this.material);
                break;
        }

        //Make sure to read the config file as json (i.e JSON.parse)        
        _this.jsonLoader = new THREE.FileLoader(_this.manager);
        _this.jsonLoader.setResponseType('json');
        _this.jsonLoader.load(_props,
        // Function when json is loaded
        function (data) {
            _this.props = data;
            console.log(_this.props);

            //Update the shader based on the properties from the JSON
            _this.material.uniforms.width.value = _this.props.textureWidth;
            _this.material.uniforms.height.value = _this.props.textureHeight;
            _this.material.uniforms.mindepth.value = _this.props.nearClip;
            _this.material.uniforms.maxdepth.value = _this.props.farClip;
        });

        //Apend the object to the Three Object3D that way it's accsesable from the instance
        _this.mesh.depthkit = _this;

        //Return the object3D so it could be added to the scene
        return _ret = _this.mesh, _possibleConstructorReturn(_this, _ret);
    }

    _createClass(DepthKit, [{
        key: 'buildGeomtery',
        value: function buildGeomtery() {

            //Temporary geometry
            var geo = new THREE.Geometry();

            for (var y = 0; y < this.VERTS_TALL; y++) {
                for (var x = 0; x < this.VERTS_WIDE; x++) {
                    geo.vertices.push(new THREE.Vector3(-640 + x * 5, 480 - y * 5, 0));
                }
            }
            for (var _y = 0; _y < this.VERTS_TALL - 1; _y++) {
                for (var _x2 = 0; _x2 < this.VERTS_WIDE - 1; _x2++) {
                    geo.faces.push(new THREE.Face3(_x2 + _y * this.VERTS_WIDE, _x2 + (_y + 1) * this.VERTS_WIDE, _x2 + 1 + _y * this.VERTS_WIDE));
                    geo.faces.push(new THREE.Face3(_x2 + 1 + _y * this.VERTS_WIDE, _x2 + (_y + 1) * this.VERTS_WIDE, _x2 + 1 + (_y + 1) * this.VERTS_WIDE));
                }
            }

            return geo;
        }

        /*
        * Render related methods
        */

    }, {
        key: 'setPointSize',
        value: function setPointSize(size) {
            if (this.material.uniforms.isPoints.value) {
                this.material.uniforms.pointSize.value = size;
            } else {
                console.warn('Can not set point size because the current character is not set to render points');
            }
        }
    }, {
        key: 'setOpacity',
        value: function setOpacity(opacity) {
            this.material.uniforms.opacity.value = opacity;
        }

        /*
        * Video Player methods
        */

    }, {
        key: 'play',
        value: function play() {
            if (!this.video.isPlaying) {
                this.video.play();
            } else {
                console.warn('Can not play because the character is already playing');
            }
        }
    }, {
        key: 'stop',
        value: function stop() {
            if (this.video.isPlaying) {
                this.video.pause();
                this.video.currentTime = 0.0;
            } else {
                console.warn('Can not stop because the character is already stopped');
            }
        }
    }, {
        key: 'pause',
        value: function pause() {
            if (this.video.isPlaying) {
                this.video.pause();
            } else {
                console.warn('Can not pause because the character is already paused');
            }
        }
    }, {
        key: 'setLoop',
        value: function setLoop(isLooping) {
            this.video.loop = isLooping;
        }
    }, {
        key: 'setVolume',
        value: function setVolume(volume) {
            this.video.volume = volume;
        }
    }, {
        key: 'update',
        value: function update(time) {
            this.material.uniforms.time.value = time;
        }

        //Clean everything up

    }, {
        key: 'dispose',
        value: function dispose() {}
    }]);

    return DepthKit;
}(_eventEmitterEs2.default);

exports.default = DepthKit;

},{"event-emitter-es6":1,"glslify":2}],4:[function(require,module,exports){
'use strict';

var _depthkit = require('./depthkit');

var _depthkit2 = _interopRequireDefault(_depthkit);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//Make it global
window.DepthKit = _depthkit2.default; //DepthKit.js class

},{"./depthkit":3}]},{},[4]);
