(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//DepthKit.js plugin for Three.js

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

// bundling of GLSL code
var glsl = require('glslify');

//For building the geomtery
var VERTS_WIDE = 256;
var VERTS_TALL = 256;

var DepthKit = function () {
    function DepthKit() {
        var _type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'mesh';

        var _props = arguments[1];

        var _this = this;

        var _movie = arguments[2];
        var _poster = arguments[3];

        _classCallCheck(this, DepthKit);

        //Load the shaders
        var rgbdFrag = glsl(["#define GLSLIFY 1\nuniform sampler2D map;\nuniform float opacity;\n\nuniform float uvdy;\nuniform float uvdx;\n\nvarying float visibility;\nvarying vec2 vUv;\nvarying vec3 vNormal;\nvarying vec3 vPos;\n\nvoid main() {\n\n    if ( visibility < 0.75 ) discard;\n\n    vec4 color = texture2D( map, vUv + vec2(uvdx, uvdy));\n    color.w = opacity;\n\n    gl_FragColor = color;\n    \n}"]);
        var rgbdVert = glsl(["#define GLSLIFY 1\nuniform float mindepth;\nuniform float maxdepth;\n\nuniform float width;\nuniform float height;\n\nuniform bool isPoints;\nuniform float pointSize;\n\nuniform float time;\n\nvarying vec3 vNormal;\nvarying vec3 vPos;\n\n//TODO: make uniforms\nconst float fx = 1.11087;\nconst float fy = 0.832305;\n\nuniform sampler2D map;\n\n//Making z global\nfloat z;\n\nvarying float visibility;\nvarying vec2 vUv;\n\nvec3 rgb2hsl( vec3 color ) {\n    float h = 0.0;\n    float s = 0.0;\n    float l = 0.0;\n    float r = color.r;\n    float g = color.g;\n    float b = color.b;\n    float cMin = min( r, min( g, b ) );\n    float cMax = max( r, max( g, b ) );\n    l =  ( cMax + cMin ) / 2.0;\n    if ( cMax > cMin ) {\n        float cDelta = cMax - cMin;\n        // saturation\n        if ( l < 0.5 ) {\n            s = cDelta / ( cMax + cMin );\n        } else {\n            s = cDelta / ( 2.0 - ( cMax + cMin ) );\n        }\n\n        // hue\n        if ( r == cMax ) {\n            h = ( g - b ) / cDelta;\n        } else if ( g == cMax ) {\n            h = 2.0 + ( b - r ) / cDelta;\n        } else {\n            h = 4.0 + ( r - g ) / cDelta;\n        }\n\n        if ( h < 0.0) {\n            h += 6.0;\n        }\n        h = h / 6.0;\n\n    }\n    return vec3( h, s, l );\n}\n\nvec3 xyz( float x, float y, float depth ) {\n    z = depth * ( maxdepth - mindepth ) + mindepth;\n    return vec3( ( x / height  ) * z * fx, ( y / (width * 2.0)  ) * z * fy, - z );\n}\n\nvoid main() {\n\n    vUv = vec2( ( position.x + 512.0 ) / 1024.0 , ( position.y + 512.0  ) / 1024.0 );\n\n    vUv.y = vUv.y * 0.5;// + 0.5;\n\n    vPos = (modelMatrix * vec4(position, 1.0 )).xyz;\n    vNormal = normalMatrix * normal;\n\n    vec3 hsl = rgb2hsl( texture2D( map, vUv ).xyz );\n    vec4 pos = vec4( xyz( position.x, position.y, hsl.x ), 1.0 );\n    pos.z += 2600.0;\n\n    visibility = hsl.z * 2.1;\n\n    if(isPoints){\n        gl_PointSize = pointSize;\n    }\n\n    gl_Position = projectionMatrix * modelViewMatrix * pos;\n}"]);

        //Video element
        this.video = document.createElement('video');
        this.video.crossOrigin = 'anonymous';
        this.video.setAttribute('crossorigin', 'anonymous');
        this.video.src = _movie;
        this.video.autoplay = false;
        this.video.loop = false;

        //Create a video texture to be passed to the shader
        this.videoTexture = new THREE.VideoTexture(this.video);
        this.videoTexture.minFilter = THREE.NearestFilter;
        this.videoTexture.magFilter = THREE.LinearFilter;
        this.videoTexture.format = THREE.RGBFormat;
        this.videoTexture.generateMipmaps = false;

        //Manages loading of assets internally
        this.manager = new THREE.LoadingManager();

        //JSON props once loaded
        this.props;

        //Geomtery
        if (!DepthKit.geo) {
            DepthKit.buildGeomtery();
        }

        //Material
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                "map": {
                    type: "t",
                    value: this.videoTexture
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
        this.material.side = THREE.DoubleSide;

        //Switch a few things based on selected rendering type and create the mesh
        switch (_type) {
            case 'wire':
                this.material.wireframe = true;
                this.mesh = new THREE.Mesh(DepthKit.geo, this.material);
                break;

            case 'points':
                this.material.uniforms.isPoints.value = true;
                this.mesh = new THREE.Points(DepthKit.geo, this.material);
                break;

            default:
                this.mesh = new THREE.Mesh(DepthKit.geo, this.material);
                break;
        }

        //Make sure to read the config file as json (i.e JSON.parse)
        this.jsonLoader = new THREE.FileLoader(this.manager);
        this.jsonLoader.setResponseType('json');
        this.jsonLoader.load(_props,
        // Function when json is loaded
        function (data) {
            _this.props = data;
            // console.log(this.props);

            //Update the shader based on the properties from the JSON
            _this.material.uniforms.width.value = _this.props.textureWidth;
            _this.material.uniforms.height.value = _this.props.textureHeight;
            _this.material.uniforms.mindepth.value = _this.props.nearClip;
            _this.material.uniforms.maxdepth.value = _this.props.farClip;
        });

        //Apend the object to the Three Object3D that way it's accsesable from the instance
        this.mesh.depthkit = this;

        //Create the collider
        var sphereGeo = new THREE.SphereGeometry(300, 32, 32);
        var sphereMat = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            wireframe: true
        });
        this.colider = new THREE.Mesh(sphereGeo, sphereMat);
        this.colider.scale.set(5, 2.5, 2.5);
        this.colider.visible = false;
        this.mesh.add(this.colider);

        this.mesh.name = 'depthkit';

        //Return the object3D so it could be added to the scene
        return this.mesh;
    }

    _createClass(DepthKit, [{
        key: 'setPointSize',


        /*
        * Render related methods
        */
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
    }, {
        key: 'setLineWidth',
        value: function setLineWidth(width) {
            if (this.material.wireframe) {
                this.material.wireframeLinewidth = width;
            } else {
                console.warn('Can not set the line width because the current character is not set to render wireframe');
            }
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
            this.video.currentTime = 0.0;
            this.video.pause();
        }
    }, {
        key: 'pause',
        value: function pause() {
            this.video.pause();
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
    }], [{
        key: 'buildGeomtery',
        value: function buildGeomtery() {

            DepthKit.geo = new THREE.Geometry();

            for (var y = 0; y < VERTS_TALL; y++) {
                for (var x = 0; x < VERTS_WIDE; x++) {
                    DepthKit.geo.vertices.push(new THREE.Vector3(-640 + x * 5, 480 - y * 5, 0));
                }
            }
            for (var _y = 0; _y < VERTS_TALL - 1; _y++) {
                for (var _x2 = 0; _x2 < VERTS_WIDE - 1; _x2++) {
                    DepthKit.geo.faces.push(new THREE.Face3(_x2 + _y * VERTS_WIDE, _x2 + (_y + 1) * VERTS_WIDE, _x2 + 1 + _y * VERTS_WIDE));
                    DepthKit.geo.faces.push(new THREE.Face3(_x2 + 1 + _y * VERTS_WIDE, _x2 + (_y + 1) * VERTS_WIDE, _x2 + 1 + (_y + 1) * VERTS_WIDE));
                }
            }
        }
    }]);

    return DepthKit;
}();

exports.default = DepthKit;

},{"glslify":1}],3:[function(require,module,exports){
'use strict';

var _depthkit = require('./depthkit');

var _depthkit2 = _interopRequireDefault(_depthkit);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//Make it global
window.DepthKit = _depthkit2.default; //DepthKit.js class

},{"./depthkit":2}]},{},[3]);
