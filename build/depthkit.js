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

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

//Depthkit.js plugin for Three.js

/**
 * Originally written by
 * @author mrdoob / http://mrdoob.com
 * @modified by obviousjim @ Scatter / http://scatter.nyc
 */

/* Made into a plugin after the completion of the Tzina project by
 *  @author juniorxsound / http://orfleisher.com
 *  @modified by avnerus / http://avner.js.org
 */

// bundling of GLSL code
var glsl = require('glslify');

var Depthkit = function (_THREE$Object3D) {
    _inherits(Depthkit, _THREE$Object3D);

    function Depthkit() {
        _classCallCheck(this, Depthkit);

        var _this = _possibleConstructorReturn(this, (Depthkit.__proto__ || Object.getPrototypeOf(Depthkit)).call(this));

        _this.manager = new THREE.LoadingManager();

        //video object created in the constructor so user may attach events
        _this.video = document.createElement('video');
        _this.video.id = 'depthkit-video';
        _this.video.crossOrigin = 'anonymous';
        _this.video.setAttribute('crossorigin', 'anonymous');
        _this.video.setAttribute('webkit-playsinline', 'webkit-playsinline');
        _this.video.setAttribute('playsinline', 'playsinline');
        _this.video.autoplay = false;
        _this.video.loop = false;

        ///default value
        _this.meshScalar = 2.0;

        Depthkit._instanceMesh = null;
        if (Depthkit._geometryLookup == null) {
            Depthkit._geometryLookup = {};
        }
        return _this;
    }

    _createClass(Depthkit, [{
        key: 'setMeshScalar',
        value: function setMeshScalar(_scalar) {
            //
            // _scalar - valid values 0, 1, 2, 3 
            // 
            if (_scalar > 3) _scalar = 3;
            if (_scalar < 0) _scalar = 0;
            // meshScalar values are 1, 2 ,4, 8 
            // This ensures that meshScalar is never set to 0 
            // and that vertex steps (computed in buildGeometry) are always pixel aligned.
            var newScalar = Math.pow(2, Math.floor(_scalar));
            if (this.meshScalar != newScalar) {
                this.meshScalar = newScalar;
                this.buildGeometry();
            }
        }
    }, {
        key: 'buildGeometry',
        value: function buildGeometry() {

            var vertsWide = this.props.textureWidth / this.meshScalar + 1;
            var vertsTall = this.props.textureHeight / this.meshScalar + 1;

            var instanceGeometry = void 0;

            if (this.geometryBufferExistsInLookup(vertsWide * vertsTall)) {
                instanceGeometry = Depthkit._geometryLookup[vertsWide * vertsTall];
            } else {
                instanceGeometry = this.createGeometryBuffer(vertsWide, vertsTall);
                Depthkit._geometryLookup[vertsWide * vertsTall] = instanceGeometry;
            }

            if (this._instanceMesh == null) {
                this._instanceMesh = new THREE.Mesh(instanceGeometry, this._material);
                this._instanceMesh.frustumCulled = false;

                // create pivot and parent the mesh to the pivot
                //
                //pivot creation 
                //
                var pivot = new THREE.Object3D();
                pivot.frustumCulled = false;
                pivot.position.z = -((this.props.farClip - this.props.nearClip) / 2.0) - this.props.nearClip;

                this.add(pivot);
                pivot.add(this._instanceMesh);
            } else {
                this._instanceMesh.geometry = instanceGeometry;
            }
        }
    }, {
        key: 'createGeometryBuffer',
        value: function createGeometryBuffer(_vertsWide, _vertsTall) {
            var vertexStep = new THREE.Vector2(this.meshScalar / this.props.textureWidth, this.meshScalar / this.props.textureHeight);
            var _geometry = new THREE.Geometry();

            for (var y = 0; y < _vertsTall; y++) {
                for (var x = 0; x < _vertsWide; x++) {
                    _geometry.vertices.push(new THREE.Vector3(x * vertexStep.x, y * vertexStep.y, 0));
                }
            }

            for (var _y = 0; _y < _vertsTall - 1; _y++) {
                for (var _x = 0; _x < _vertsWide - 1; _x++) {
                    _geometry.faces.push(new THREE.Face3(_x + _y * _vertsWide, _x + (_y + 1) * _vertsWide, _x + 1 + _y * _vertsWide));

                    _geometry.faces.push(new THREE.Face3(_x + 1 + _y * _vertsWide, _x + (_y + 1) * _vertsWide, _x + 1 + (_y + 1) * _vertsWide));
                }
            }

            return _geometry;
        }
    }, {
        key: 'geometryBufferExistsInLookup',
        value: function geometryBufferExistsInLookup(meshWxH) {
            for (var lookupKey in Object.keys(Depthkit._geometryLookup)) {
                if (meshWxH === lookupKey) {
                    return true;
                }
            }
            return false;
        }
    }, {
        key: 'buildMaterial',
        value: function buildMaterial() {

            //Load the shaders
            var rgbdFrag = glsl(["#extension GL_OES_standard_derivatives : enable\n#define GLSLIFY 1\n\nuniform sampler2D map;\nuniform float opacity;\nuniform float width;\nuniform float height;\n\nvarying vec2 vUv;\nvarying vec2 vUvDepth;\nvarying vec4 vPos;\nfloat _DepthBrightnessThreshold = 0.8;  // per-pixel brightness threshold, used to refine edge geometry from eroneous edge depth samples\nfloat _SheerAngleThreshold = 0.04;       // per-pixel internal edge threshold (sheer angle of geometry at that pixel)\n#define BRIGHTNESS_THRESHOLD_OFFSET 0.01\n#define FLOAT_EPS 0.00001\n#define CLIP_EPSILON 0.005\n\nvec3 rgb2hsv(vec3 c)\n{\n    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);\n    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));\n    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));\n    float d = q.x - min(q.w, q.y);\n    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + FLOAT_EPS)), d / (q.x + FLOAT_EPS), q.x);\n}\n\nfloat depthForPoint(vec2 texturePoint)\n{   \n    vec2 centerpix = vec2(.5/width, .5/height);\n    texturePoint += centerpix;\n    // clamp to texture bounds - 0.5 pixelsize so we do not sample outside our texture\n    texturePoint = clamp(texturePoint, centerpix, vec2(1.0, 0.5) - centerpix);\n    vec4 depthsample = texture2D(map, texturePoint);\n    vec3 depthsamplehsv = rgb2hsv(depthsample.rgb);\n    return depthsamplehsv.b > _DepthBrightnessThreshold + BRIGHTNESS_THRESHOLD_OFFSET ? depthsamplehsv.r : 0.0;\n}\n\nvoid main()\n{\n    vec2 centerpix = vec2(.5/width, .5/height);\n    vec2 centerDepthSampleCoord = vUvDepth - mod(vUvDepth, vec2(1.0/width, 1.0/height) ); // clamp to start of pixel\n\n    float depth = depthForPoint(centerDepthSampleCoord);\n    // we filter the _SheerAngleThreshold value on CPU so that we have an ease in over the 0..1 range, removing internal geometry at grazing angles\n    // we also apply near and far clip clipping, the far clipping plane is pulled back to remove geometry wrapped to the far plane from the near plane\n    //convert back from worldspace to local space\n    vec4 localPos = vPos;\n    //convert to homogenous coordinate space\n    localPos.xy /= localPos.z;\n    //find local space normal for triangle surface\n    vec3 dx = dFdx(localPos.xyz);\n    vec3 dy = dFdy(localPos.xyz);\n    vec3 n = normalize(cross(dx, dy));\n    \n    // make sure to handle dot product of the whole hemisphere by taking the absolute of range -1 to 0 to 1\n    float sheerAngle = abs(dot(n, vec3(0.0, 0.0, 1.0)));\n\n    // clamp to texture bounds - 0.5 pixelsize so we do not sample outside our texture\n    vec2 colorTexCoord = clamp(vUv, vec2(0.0, 0.5) + centerpix, vec2(1.0, 1.0) - centerpix);\n    vec4 color = texture2D(map, colorTexCoord);\n    color.w = opacity;\n\n    //color.xyz = vPos.xyz * 0.5 + 0.5;\n    //color.xyz = n.xyz * 0.5 + 0.5;\n    //color.xyz = vec3(sheerAngle, sheerAngle, sheerAngle);\n\n    if ( depth <        CLIP_EPSILON  ||\n         depth > (1.0 - CLIP_EPSILON) ||\n         sheerAngle < (_SheerAngleThreshold + FLOAT_EPS))\n    {\n        discard;\n    }\n\n    gl_FragColor = color;\n}"]);
            var rgbdVert = glsl(["#define GLSLIFY 1\nuniform float nearClip;\nuniform float farClip;\nuniform float width;\nuniform float height;\nuniform bool isPoints;\nuniform float pointSize;\nuniform float time;\nuniform vec2 focalLength;\nuniform vec2 principalPoint;\nuniform vec2 imageDimensions;\nuniform vec4 crop;\nuniform float meshScalar;\nuniform mat4 extrinsics;\nuniform sampler2D map;\nvarying vec4 vPos;\nvarying vec2 vUv;\nvarying vec2 vUvDepth;\n\nfloat _DepthBrightnessThreshold = 0.5;  // per-pixel brightness threshold, used to refine edge geometry from eroneous edge depth samples\n#define BRIGHTNESS_THRESHOLD_OFFSET 0.01\n#define FLOAT_EPS 0.00001\n#define CLIP_EPSILON 0.005\n\nvec3 rgb2hsv(vec3 c)\n{\n    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);\n    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));\n    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));\n    float d = q.x - min(q.w, q.y);\n    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + FLOAT_EPS)), d / (q.x + FLOAT_EPS), q.x);\n}\n\nfloat depthForPoint(vec2 texturePoint)\n{   \n    vec2 centerpix = vec2(1.0/width, 1.0/height) * 0.5;\n    texturePoint += centerpix;\n\n    // clamp to texture bounds - 0.5 pixelsize so we do not sample outside our texture\n    texturePoint = clamp(texturePoint, centerpix, vec2(1.0, 0.5) - centerpix);\n    vec4 depthsample = texture2D(map, texturePoint);\n    vec3 depthsamplehsv = rgb2hsv(depthsample.rgb);\n    return depthsamplehsv.b > _DepthBrightnessThreshold + BRIGHTNESS_THRESHOLD_OFFSET ? depthsamplehsv.r : 0.0;\n}\n\nvoid main()\n{\n    vec4 texSize = vec4(1.0 / width, 1.0 / height, width, height);\n    vec2 basetex = position.xy;\n\n    // we align our depth pixel centers with the center of each quad, so we do not require a half pixel offset\n    vec2 depthTexCoord = basetex * vec2(1.0, 0.5);\n    vec2 colorTexCoord = basetex * vec2(1.0, 0.5) + vec2(0.0, 0.5);\n\n    // coordinates are always aligned to a multiple of texture sample widths, no need to clamp to topleft\n    // unlike per-pixel sampling.\n    float depth = depthForPoint(depthTexCoord);\n    if (depth <= CLIP_EPSILON || ((1.0 - CLIP_EPSILON) >= depth))\n    {\n        // we use a 3x3 kernel, so sampling 8 neighbors\n        //vec2 textureStep = 1.0 / meshScalar;\n        vec2 textureStep = vec2(texSize.x * meshScalar, texSize.y * meshScalar);   // modify our texture step \n        \n        vec2 neighbors[8];\n        neighbors[0] = vec2(-textureStep.x, -textureStep.y);\n        neighbors[1] = vec2(0, -textureStep.y);\n        neighbors[2] = vec2(textureStep.x, -textureStep.y);\n        neighbors[3] = vec2(-textureStep.x, 0);\n        neighbors[4] = vec2(textureStep.x, 0);\n        neighbors[5] = vec2(-textureStep.x, textureStep.y);\n        neighbors[6] = vec2(0, textureStep.y);\n        neighbors[7] = vec2(textureStep.x, textureStep.y);\n        \n        // if this depth sample is not valid then check neighbors\n        int validNeighbors = 0;\n        float maxDepth = 0.0;\n        for (int i = 0; i < 8; i++)\n        {\n            float depthNeighbor = depthForPoint(depthTexCoord + neighbors[i]);\n            maxDepth = max(maxDepth, depthNeighbor);\n            validNeighbors += (depthNeighbor > CLIP_EPSILON || ((1.0 - CLIP_EPSILON) < depthNeighbor)) ? 1 : 0;\n        }\n\n        // clip to near plane if we and all our neighbors are invalid\n        depth = validNeighbors > 0 ? maxDepth : 0.0;\n    }\n\n    vec2 imageCoordinates = crop.xy + (basetex * crop.zw);\n    float z = depth * (farClip - nearClip) + nearClip; // transform from 0..1 space to near-far space Z\n    vec2 ortho = imageCoordinates * imageDimensions - principalPoint;\n    vec2 proj = ortho * z / focalLength;\n    vec4 worldPos = extrinsics *  vec4(proj.xy, z, 1.0);\n    worldPos.w = 1.0;\n    gl_Position =  projectionMatrix * modelViewMatrix * worldPos;\n    vUv = colorTexCoord;\n    vUvDepth = depthTexCoord;\n    vPos = worldPos;//gl_Position.xyz;//(modelMatrix * vec4(gl_Position.xyz, 1.0)).xyz;//(modelMatrix * vec4(position, 1.0)).xyz;\n}\n"]);

            var extrinsics = new THREE.Matrix4();
            var ex = this.props.extrinsics;
            extrinsics.set(ex["e00"], ex["e10"], ex["e20"], ex["e30"], ex["e01"], ex["e11"], ex["e21"], ex["e31"], ex["e02"], ex["e12"], ex["e22"], ex["e32"], ex["e03"], ex["e13"], ex["e23"], ex["e33"]);

            var extrinsicsInv = new THREE.Matrix4();
            extrinsicsInv.getInverse(extrinsics);

            //Material
            this._material = new THREE.ShaderMaterial({
                uniforms: {
                    "map": {
                        type: "t",
                        value: this.videoTexture
                    },
                    "time": {
                        type: "f",
                        value: 0.0
                    },
                    "nearClip": {
                        type: "f",
                        value: this.props.nearClip
                    },
                    "farClip": {
                        type: "f",
                        value: this.props.farClip
                    },
                    "meshScalar": {
                        type: "f",
                        value: this.meshScalar
                    },
                    "focalLength": {
                        value: this.props.depthFocalLength
                    },
                    "principalPoint": {
                        value: this.props.depthPrincipalPoint
                    },
                    "imageDimensions": {
                        value: this.props.depthImageSize
                    },
                    "extrinsics": {
                        value: extrinsics
                    },
                    "extrinsicsInv": {
                        value: extrinsicsInv
                    },
                    "crop": {
                        value: this.props.crop
                    },
                    "width": {
                        type: "f",
                        value: this.props.textureWidth
                    },
                    "height": {
                        type: "f",
                        value: this.props.textureHeight
                    },
                    "opacity": {
                        type: "f",
                        value: 1.0
                    }
                },

                vertexShader: rgbdVert,
                fragmentShader: rgbdFrag,
                transparent: true
            });

            //Make the shader material double sided
            this._material.side = THREE.DoubleSide;
        }
    }, {
        key: 'loadVideo',
        value: function loadVideo(_src) {
            this.video.src = _src;
            this.video.load();
        }
    }, {
        key: 'createVideoTexture',
        value: function createVideoTexture() {
            var videoTex = new THREE.VideoTexture(this.video);
            videoTex.minFilter = THREE.NearestFilter;
            videoTex.magFilter = THREE.LinearFilter;
            videoTex.format = THREE.RGBFormat;
            videoTex.generateMipmaps = false;

            return videoTex;
        }
    }, {
        key: 'load',
        value: function load(_props, _movieUrl, _onComplete, _onError) {
            var _this2 = this;

            this.loadVideo(_movieUrl);

            this.videoTexture = this.createVideoTexture();

            if (this.isJson(_props)) {
                var jsonProps = JSON.parse(_props);
                this.setProps(jsonProps);
                this.createMesh();

                if (_onComplete) {
                    _onComplete(this);
                }
            } else {
                this.loadPropsFromFile(_props).then(function (props) {
                    _this2.setProps(props);
                    _this2.createMesh();

                    if (_onComplete) {
                        _onComplete(_this2);
                    }
                }).catch(function (err) {
                    if (_onError) {
                        _onError(err);
                    } else {
                        console.error(err);
                    }
                });
            }
        }
    }, {
        key: 'createMesh',
        value: function createMesh() {
            this.buildMaterial();
            this.buildGeometry();
            this.children[0].frustumCulled = false;
            this.children[0].name = 'depthkit';
        }
    }, {
        key: 'loadPropsFromFile',
        value: function loadPropsFromFile(filePath) {
            var _this3 = this;

            return new Promise(function (resolve, reject) {
                var jsonLoader = new THREE.FileLoader(_this3.manager);
                jsonLoader.setResponseType('json');
                jsonLoader.load(filePath, function (data) {
                    resolve(data);
                }, null, function (err) {
                    reject(err);
                });
            });
        }
    }, {
        key: 'isJson',
        value: function isJson(item) {
            item = typeof item !== "string" ? JSON.stringify(item) : item;

            try {
                item = JSON.parse(item);
            } catch (e) {
                return false;
            }

            if ((typeof item === 'undefined' ? 'undefined' : _typeof(item)) === "object" && item !== null) {
                return true;
            }

            return false;
        }
    }, {
        key: 'setProps',
        value: function setProps(_props) {
            this.props = _props;

            if (this.props.textureWidth == undefined || this.props.textureHeight == undefined) {
                this.props.textureWidth = this.props.depthImageSize.x;
                this.props.textureHeight = this.props.depthImageSize.y * 2;
            }
            if (this.props.extrinsics == undefined) {
                this.props.extrinsics = {
                    e00: 1, e01: 0, e02: 0, e03: 0,
                    e10: 0, e11: 1, e12: 0, e13: 0,
                    e20: 0, e21: 0, e22: 1, e23: 0,
                    e30: 0, e31: 0, e32: 0, e33: 1
                };
            }
            if (this.props.crop == undefined) {
                this.props.crop = { x: 0, y: 0, z: 1, w: 1 };
            }
        }
    }, {
        key: 'setOpacity',
        value: function setOpacity(opacity) {
            this._material.uniforms.opacity.value = opacity;
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
            this._material.uniforms.time.value = time;
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
    }]);

    return Depthkit;
}(THREE.Object3D);

exports.default = Depthkit;

},{"glslify":1}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Depthkit = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; //Depthkit.js class


var _depthkit = require('./depthkit');

var _depthkit2 = _interopRequireDefault(_depthkit);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//Make it global
if (typeof window !== 'undefined' && _typeof(window.THREE) === 'object') {
  window.Depthkit = _depthkit2.default;
} else {
  console.warn('[Depthkit.js] It seems like THREE is not included in your code, try including it before Depthkit.js');
}

exports.Depthkit = _depthkit2.default;

},{"./depthkit":2}]},{},[3]);
