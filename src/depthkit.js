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

//Event emitter for providing event handlers from the class
import EventEmitter from 'event-emitter-es6';

// bundling of GLSL code
const glsl = require('glslify');

export default class DepthKit extends EventEmitter {

    constructor(_type = 'mesh', _props, _movie, _poster) {
        super();

        //Load the shaders
        let rgbdFrag = glsl.file('./shaders/rgbd.frag');
        let rgbdVert = glsl.file('./shaders/rgbd.vert');

        //For building the geomtery
        this.VERTS_WIDE = 256;
        this.VERTS_TALL = 256;

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
        this.geo = this.buildGeomtery();

        //Material
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                "diffuse": {
                    type: 'c',
                    value: new THREE.Color(0x0000ff)
                },
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
                this.mesh = new THREE.Mesh(this.geo, this.material);
                break;

            case 'points':
                this.material.uniforms.isPoints.value = true;
                this.mesh = new THREE.Points(this.geo, this.material);
                break;

            default:
                this.mesh = new THREE.Mesh(this.geo, this.material);
                break;
        }

        //Make sure to read the config file as json (i.e JSON.parse)        
        this.jsonLoader = new THREE.FileLoader(this.manager);
        this.jsonLoader.setResponseType('json');
        this.jsonLoader.load(_props,
            // Function when json is loaded
            data => {
                this.props = data;
                console.log(this.props);

                //Update the shader based on the properties from the JSON
                this.material.uniforms.width.value = this.props.textureWidth;
                this.material.uniforms.height.value = this.props.textureHeight;
                this.material.uniforms.mindepth.value = this.props.nearClip;
                this.material.uniforms.maxdepth.value = this.props.farClip;
            }
        );

        //Apend the object to the Three Object3D that way it's accsesable from the instance
        this.mesh.depthkit = this;

        //Return the object3D so it could be added to the scene
        return this.mesh;
    }

    buildGeomtery() {

        //Temporary geometry
        let geo = new THREE.Geometry();


        for (let y = 0; y < this.VERTS_TALL; y++) {
            for (let x = 0; x < this.VERTS_WIDE; x++) {
                geo.vertices.push(
                    new THREE.Vector3((-640 + x * 5), (480 - y * 5), 0));
            }
        }
        for (let y = 0; y < this.VERTS_TALL - 1; y++) {
            for (let x = 0; x < this.VERTS_WIDE - 1; x++) {
                geo.faces.push(
                    new THREE.Face3(
                        x + y * this.VERTS_WIDE,
                        x + (y + 1) * this.VERTS_WIDE,
                        (x + 1) + y * (this.VERTS_WIDE)
                    ));
                geo.faces.push(
                    new THREE.Face3(
                        x + 1 + y * this.VERTS_WIDE,
                        x + (y + 1) * this.VERTS_WIDE,
                        (x + 1) + (y + 1) * (this.VERTS_WIDE)
                    ));
            }
        }

        return geo;
    }

    /*
    * Render related methods
    */
    setPointSize(size) {
        if (this.material.uniforms.isPoints.value) {
            this.material.uniforms.pointSize.value = size;
        } else {
            console.warn('Can not set point size because the current character is not set to render points');
        }
    }

    setOpacity(opacity) {
        this.material.uniforms.opacity.value = opacity;
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
        this.material.uniforms.time.value = time;
    }

    //Clean everything up
    dispose() {

    }
}