//Depthkit.js plugin for Three.js

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
const glsl = require('glslify');

export default class Depthkit extends THREE.Object3D {

    constructor() {
        super();

        this.manager = new THREE.LoadingManager();

        this.meshScalar = 2.0;

        if (Depthkit._geometryLookup == null) {
            Depthkit._geometryLookup = {};
        }
    }

    setMeshScalar(_scalar) {
        this.meshScalar = _scalar;
    }

    buildGeometry() {

        const vertsWide = (this.props.textureWidth / this.meshScalar) + 1;
        const vertsTall = (this.props.textureHeight / this.meshScalar) + 1;

        let instanceGeometry;

        if (this.geometryBufferExistsInLookup(vertsWide * vertsTall)) {
            instanceGeometry = Depthkit._geometryLookup[vertsWide * vertsTall];
        } else {
            instanceGeometry = this.createGeometryBuffer(vertsWide, vertsTall);
            Depthkit._geometryLookup[vertsWide * vertsTall] = instanceGeometry;
        }

        this.add(new THREE.Mesh(instanceGeometry, this._material));
    }

    createGeometryBuffer(_vertsWide, _vertsTall) {
        const vertexStep = new THREE.Vector2(this.meshScalar / this.props.textureWidth, this.meshScalar / this.props.textureHeight)
        let _geometry = new THREE.Geometry();

        for (let y = 0; y < _vertsTall; y++) {
            for (let x = 0; x < _vertsWide; x++) {
                _geometry.vertices.push(new THREE.Vector3(x * vertexStep.x, y * vertexStep.y, 0));
            }
        }

        for (let y = 0; y < _vertsTall - 1; y++) {
            for (let x = 0; x < _vertsWide - 1; x++) {
                _geometry.faces.push(
                    new THREE.Face3(
                        x + y * _vertsWide,
                        x + (y + 1) * _vertsWide,
                        (x + 1) + y * _vertsWide
                    ));

                _geometry.faces.push(
                    new THREE.Face3(
                        x + 1 + y * _vertsWide,
                        x + (y + 1) * _vertsWide,
                        (x + 1) + (y + 1) * _vertsWide
                    ));
            }
        }

        return _geometry;
    }

    geometryBufferExistsInLookup(meshWxH) {
        for (let lookupKey in Object.keys(Depthkit._geometryLookup)) {
            if (meshWxH === lookupKey) {
                return true;
            }
        }
        return false;
    }

    buildMaterial() {

        //Load the shaders
        let rgbdFrag = glsl.file('./shaders/rgbd.frag');
        let rgbdVert = glsl.file('./shaders/rgbd.vert');

        const extrinsics = new THREE.Matrix4();
        const ex = this.props.extrinsics;
        extrinsics.set(
            ex["e00"], ex["e10"], ex["e20"], ex["e30"],
            ex["e01"], ex["e11"], ex["e21"], ex["e31"],
            ex["e02"], ex["e12"], ex["e22"], ex["e32"],
            ex["e03"], ex["e13"], ex["e23"], ex["e33"]
        );

        const extrinsicsInv = new THREE.Matrix4();
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

    createVideoElement(_src) {
        const vid = document.createElement('video');
        vid.id = 'depthkit-video';
        vid.crossOrigin = 'anonymous';
        vid.setAttribute('crossorigin', 'anonymous');
        vid.setAttribute('webkit-playsinline', 'webkit-playsinline');
        vid.setAttribute('playsinline', 'playsinline');
        vid.src = _src;
        vid.autoplay = false;
        vid.loop = false;
        vid.load();

        return vid;
    }

    createVideoTexture(_videoElement) {
        const videoTex = new THREE.VideoTexture(this.video);
        videoTex.minFilter = THREE.NearestFilter;
        videoTex.magFilter = THREE.LinearFilter;
        videoTex.format = THREE.RGBFormat;
        videoTex.generateMipmaps = false;

        return videoTex;
    }

    load(_props, _movieUrl, _onComplete, _onError) {

        this.video = this.createVideoElement(_movieUrl);

        this.videoTexture = this.createVideoTexture(this.video);

        if (this.isJson(_props)) {
            const jsonProps = JSON.parse(_props);
            this.setProps(jsonProps);
            this.createMesh();

            if (_onComplete) {
                _onComplete(this);
            }
        } else {
            this.loadPropsFromFile(_props).then(props => {
                this.setProps(props);
                this.createMesh();

                if (_onComplete) {
                    _onComplete(this);
                }
            }).catch(err => {
                if (_onError) {
                    _onError(err);
                } else {
                    console.error(err);
                }
            })
        }
    }

    createMesh() {
        this.buildMaterial();
        this.buildGeometry();
        this.children[0].frustumCulled = false;
        this.children[0].name = 'depthkit';
    }

    loadPropsFromFile(filePath) {
        return new Promise((resolve, reject) => {
            const jsonLoader = new THREE.FileLoader(this.manager);
            jsonLoader.setResponseType('json');
            jsonLoader.load(filePath, data => {
                resolve(data);
            }, null, err => {
                reject(err);
            });
        });
    }

    isJson(item) {
        item = typeof item !== "string"
            ? JSON.stringify(item)
            : item;

        try {
            item = JSON.parse(item);
        } catch (e) {
            return false;
        }

        if (typeof item === "object" && item !== null) {
            return true;
        }

        return false;
    }

    setProps(_props) {
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

    setOpacity(opacity) {
        this._material.uniforms.opacity.value = opacity;
    }

    /*
    * Video Player methods
    */
    play() {
        if (!this.video.isPlaying) {
            this.video.play();
        } else {
            console.warn('Can not play because the character is already playing');
        }
    }

    stop() {
        this.video.currentTime = 0.0;
        this.video.pause();
    }

    pause() {
        this.video.pause();
    }

    setLoop(isLooping) {
        this.video.loop = isLooping;
    }

    setVolume(volume) {
        this.video.volume = volume;
    }

    update(time) {
        this._material.uniforms.time.value = time;
    }

    dispose() {
        //Remove the mesh from the scene
        try {
            this.mesh.parent.remove(this.mesh);
        } catch (e) {
            console.warn(e);
        } finally {
            this.mesh.traverse(child => {
                if (child.geometry !== undefined) {
                    child.geometry.dispose();
                    child.material.dispose();
                }
            });
        }
    }
}
