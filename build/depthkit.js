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

        var _this = this;

        var _props = arguments[1];
        var _movie = arguments[2];

        _classCallCheck(this, DepthKit);

        //Load the shaders
        var rgbdFrag = glsl(["#define GLSLIFY 1\nuniform sampler2D map;\nuniform float opacity;\n\nuniform float uvdy;\nuniform float uvdx;\n\nvarying float visibility;\nvarying vec2 vUv;\nvarying vec3 vNormal;\nvarying vec3 vPos;\n\nvoid main() {\n\n    if ( visibility < 0.9 ) discard;\n\n    vec4 color = texture2D(map, vUv);\n    color.w = opacity;\n\n    gl_FragColor = color;\n    \n}"]);
        var rgbdVert = glsl(["#define GLSLIFY 1\nuniform float mindepth;\nuniform float maxdepth;\n\nuniform float width;\nuniform float height;\n\nuniform bool isPoints;\nuniform float pointSize;\n\nuniform float time;\n\nuniform vec2 focalLength;\nuniform vec2 principalPoint;\nuniform vec2 imageDimensions;\nuniform vec4 crop;\nuniform vec2 meshDensity;\nuniform mat4 extrinsics;\n\nvarying vec3 vNormal;\nvarying vec3 vPos;\n\nuniform sampler2D map;\n\nvarying float visibility;\nvarying vec2 vUv;\n\nconst float _DepthSaturationThreshhold = 0.5; //a given pixel whose saturation is less than half will be culled (old default was .5)\nconst float _DepthBrightnessThreshold = 0.5; //a given pixel whose brightness is less than half will be culled (old default was .9)\nconst float  _Epsilon = .03;\n\nvec3 rgb2hsv(vec3 c)\n{\n    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);\n    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));\n    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));\n\n    float d = q.x - min(q.w, q.y);\n    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + _Epsilon)), d / (q.x + _Epsilon), q.x);\n}\n\nfloat depthForPoint(vec2 texturePoint)\n{\n    vec4 depthsample = texture2D(map, texturePoint);\n    vec3 depthsamplehsv = rgb2hsv(depthsample.rgb);\n    return depthsamplehsv.g > _DepthSaturationThreshhold && depthsamplehsv.b > _DepthBrightnessThreshold ? depthsamplehsv.r : 0.0;\n}\n\nvoid main() {\n    vec4 texSize = vec4(1.0 / width, 1.0 / height, width, height);\n\n    vec2 centerpix = texSize.xy * .5;\n    vec2 textureStep = 1.0 / meshDensity;\n    vec2 basetex = floor(position.xy * textureStep * texSize.zw) * texSize.xy;\n    vec2 imageCoordinates = crop.xy + (basetex * crop.zw);\n    basetex.y = 1.0 - basetex.y;\n\n    vec2 depthTexCoord = basetex * vec2(1.0, 0.5) + centerpix;\n    vec2 colorTexCoord = basetex * vec2(1.0, 0.5) + vec2(0.0, 0.5) + centerpix;\n\n    vUv = colorTexCoord;\n    vPos = (modelMatrix * vec4(position, 1.0 )).xyz;\n    vNormal = normalMatrix * normal;\n\n    //check neighbors\n    //texture coords come in as [0.0 - 1.0] for this whole plane\n    float depth = depthForPoint(depthTexCoord);\n\n    float neighborDepths[8];\n    neighborDepths[0] = depthForPoint(depthTexCoord + vec2(0.0,  textureStep.y));\n    neighborDepths[1] = depthForPoint(depthTexCoord + vec2(textureStep.x, 0.0));\n    neighborDepths[2] = depthForPoint(depthTexCoord + vec2(0.0, -textureStep.y));\n    neighborDepths[3] = depthForPoint(depthTexCoord + vec2(-textureStep.x, 0.0));\n    neighborDepths[4] = depthForPoint(depthTexCoord + vec2(-textureStep.x, -textureStep.y));\n    neighborDepths[5] = depthForPoint(depthTexCoord + vec2(textureStep.x,  textureStep.y));\n    neighborDepths[6] = depthForPoint(depthTexCoord + vec2(textureStep.x, -textureStep.y));\n    neighborDepths[7] = depthForPoint(depthTexCoord + vec2(-textureStep.x,  textureStep.y));\n\n    visibility = 1.0;\n    int numDudNeighbors = 0;\n    //search neighbor verts in order to see if we are near an edge\n    //if so, clamp to the surface closest to us\n    if (depth < _Epsilon || (1.0 - depth) < _Epsilon)\n    {\n        // float depthDif = 1.0;\n        float nearestDepth = 1.0;\n        for (int i = 0; i < 8; i++)\n        {\n            float depthNeighbor = neighborDepths[i];\n            if (depthNeighbor >= _Epsilon && (1.0 - depthNeighbor) > _Epsilon)\n            {\n                // float thisDif = abs(nearestDepth - depthNeighbor);\n                if (depthNeighbor < nearestDepth)\n                {\n                    // depthDif = thisDif;\n                    nearestDepth = depthNeighbor;\n                }\n            }\n            else\n            {\n                numDudNeighbors++;\n            }\n        }\n\n        depth = nearestDepth;\n        visibility = 0.8;\n\n        // blob filter\n        if (numDudNeighbors > 6)\n        {\n            visibility = 0.0;\n        }\n    }\n\n    // internal edge filter\n    float maxDisparity = 0.0;\n    for (int i = 0; i < 8; i++)\n    {\n        float depthNeighbor = neighborDepths[i];\n        if (depthNeighbor >= _Epsilon && (1.0 - depthNeighbor) > _Epsilon)\n        {\n            maxDisparity = max(maxDisparity, abs(depth - depthNeighbor));\n        }\n    }\n    visibility *= 1.0 - maxDisparity;\n\n    float z = depth * (maxdepth - mindepth) + mindepth;\n    vec4 worldPos = extrinsics * vec4((imageCoordinates * imageDimensions - principalPoint) * z / focalLength, z, 1.0);\n    worldPos.w = 1.0;\n\n    gl_Position = projectionMatrix * modelViewMatrix * worldPos;\n}"]);

        //Crate video element
        this.video = document.createElement('video');

        //Set the crossOrigin and props
        this.video.id = 'depthkit-video';
        this.video.crossOrigin = 'anonymous';
        this.video.setAttribute('crossorigin', 'anonymous');
        this.video.setAttribute('webkit-playsinline', 'webkit-playsinline');
        this.video.setAttribute('playsinline', 'playsinline');
        this.video.src = _movie;

        //Don't autostart don't loop
        this.video.autoplay = false;
        this.video.loop = false;
        this.video.load();

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
                "meshDensity": {
                    value: new THREE.Vector2(VERTS_WIDE, VERTS_TALL)
                },
                "focalLength": {
                    value: new THREE.Vector2(1, 1)
                },
                "principalPoint": {
                    value: new THREE.Vector2(1, 1)
                },
                "imageDimensions": {
                    value: new THREE.Vector2(512, 828)
                },
                "extrinsics": {
                    value: new THREE.Matrix4()
                },
                "crop": {
                    value: new THREE.Vector4(0, 0, 1, 1)
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
            _this.material.uniforms.focalLength.value = _this.props.depthFocalLength;
            _this.material.uniforms.principalPoint.value = _this.props.depthPrincipalPoint;
            _this.material.uniforms.imageDimensions.value = _this.props.depthImageSize;
            _this.material.uniforms.crop.value = _this.props.crop;

            var ex = _this.props.extrinsics;
            _this.material.uniforms.extrinsics.value.set(ex["e00"], ex["e10"], ex["e20"], ex["e30"], ex["e01"], ex["e11"], ex["e21"], ex["e31"], ex["e02"], ex["e12"], ex["e22"], ex["e32"], ex["e03"], ex["e13"], ex["e23"], ex["e33"]);

            //Create the collider
            var boxGeo = new THREE.BoxGeometry(_this.props.boundsSize.x, _this.props.boundsSize.y, _this.props.boundsSize.z);
            var boxMat = new THREE.MeshBasicMaterial({
                color: 0xffff00,
                wireframe: true
            });

            _this.collider = new THREE.Mesh(boxGeo, boxMat);

            _this.collider.visible = false;
            _this.mesh.add(_this.collider);

            //Temporary collider positioning fix - // TODO: fix that with this.props.boundsCenter
            THREE.SceneUtils.detach(_this.collider, _this.mesh, _this.mesh.parent);
            _this.collider.position.set(0, 1, 0);
        });

        //Make sure we don't hide the character - this helps the objects in webVR
        this.mesh.frustumCulled = false;

        //Apend the object to the Three Object3D that way it's accsesable from the instance
        this.mesh.depthkit = this;
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
    }, {
        key: 'toggleColliderVisiblity',
        value: function toggleColliderVisiblity() {
            this.mesh.collider.visible = !this.mesh.collider.visible;
        }
    }, {
        key: 'dispose',
        value: function dispose() {
            //Remove the mesh from the scene
            try {
                this.mesh.parent.remove(this.mesh);
            } catch (e) {
                console.warn(e);
            } finally {
                this.mesh.traverse(function (child) {
                    if (child.geometry !== undefined) {
                        child.geometry.dispose();
                        child.material.dispose();
                    }
                });
            }
        }
    }], [{
        key: 'buildGeomtery',
        value: function buildGeomtery() {

            DepthKit.geo = new THREE.Geometry();

            for (var y = 0; y < VERTS_TALL; y++) {
                for (var x = 0; x < VERTS_WIDE; x++) {
                    DepthKit.geo.vertices.push(new THREE.Vector3(x, y, 0));
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

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DepthKit = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; //DepthKit.js class


var _depthkit = require('./depthkit');

var _depthkit2 = _interopRequireDefault(_depthkit);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//Make it global
if (typeof window !== 'undefined' && _typeof(window.THREE) === 'object') {
  window.DepthKit = _depthkit2.default;
} else {
  console.warn('[DepthKit.js] It seems like THREE is not included in your code, try including it before DepthKit.js');
}

exports.DepthKit = _depthkit2.default;

},{"./depthkit":2}]},{},[3]);
