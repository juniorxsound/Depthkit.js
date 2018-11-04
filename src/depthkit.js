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
const glsl = require('glslify');

export default class DepthKit {
    
    //Reduction factor of the mesh.
    setMeshScalar(_scalar)
    {
        this.meshScalar = _scalar;
    }

    buildGeometry() {


        var vertsWide = (this.props.textureWidth  / this.meshScalar) + 1;
        var vertsTall = (this.props.textureHeight / this.meshScalar) + 1;

        var vertexStep = new THREE.Vector2( this.meshScalar / this.props.textureWidth, this.meshScalar / this.props.textureHeight)
        this.geometry = new THREE.Geometry();

        for (let y = 0; y < vertsTall; y++) {
            for (let x = 0; x < vertsWide; x++) {
                this.geometry.vertices.push(new THREE.Vector3(x * vertexStep.x, y * vertexStep.y, 0));
            }
        }

        for (let y = 0; y < vertsTall - 1; y++) {
            for (let x = 0; x < vertsWide - 1; x++) {
                this.geometry.faces.push(
                    new THREE.Face3(
                        x + y * vertsWide,
                        x + (y + 1) * vertsWide,
                        (x + 1) + y * vertsWide
                    ));

                this.geometry.faces.push(
                    new THREE.Face3(
                        x + 1 + y * vertsWide,
                        x + (y + 1) * vertsWide,
                        (x + 1) + (y + 1) * vertsWide
                    ));
            }
        }

        this.mesh = new THREE.Mesh(this.geometry, this.material);
    }

    buildMaterial() {

        //Load the shaders
        let rgbdFrag = glsl.file('./shaders/rgbd.frag');
        let rgbdVert = glsl.file('./shaders/rgbd.vert');

        var extrinsics = new THREE.Matrix4(); 
        let ex = this.props.extrinsics;
        extrinsics.set(
            ex["e00"], ex["e10"], ex["e20"], ex["e30"],
            ex["e01"], ex["e11"], ex["e21"], ex["e31"],
            ex["e02"], ex["e12"], ex["e22"], ex["e32"],
            ex["e03"], ex["e13"], ex["e23"], ex["e33"]
        );

        var extrinsicsInv =  new THREE.Matrix4(); 
        extrinsicsInv.getInverse(extrinsics);

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
                    value : 1.0
                }
            },

            vertexShader: rgbdVert,
            fragmentShader: rgbdFrag,
            transparent: true
        });

        //Make the shader material double sided
        this.material.side = THREE.DoubleSide;
    }

    load(_props, _movie, _callback) {

        //Video element
        this.video = document.createElement('video');
        this.video.id = 'depthkit-video';
        this.video.crossOrigin = 'anonymous';
        this.video.setAttribute('crossorigin', 'anonymous');
        this.video.setAttribute('webkit-playsinline', 'webkit-playsinline');
        this.video.setAttribute('playsinline', 'playsinline');
        this.video.src = _movie;
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
        //this.props;
        if(!this.meshScalar)
        {
            this.meshScalar = 2.0; //default.
        }

        //Make sure to read the config file as json (i.e JSON.parse)
        this.jsonLoader = new THREE.FileLoader(this.manager);
        this.jsonLoader.setResponseType('json');
        this.jsonLoader.load(_props,
            // Function when json is loaded
            data => {
                this.props = data;

                this.buildMaterial();

                this.buildGeometry();
                /*
                //Create the collider
                let boxGeo = new THREE.BoxGeometry(this.props.boundsSize.x, this.props.boundsSize.y, this.props.boundsSize.z);
                let boxMat = new THREE.MeshBasicMaterial(
                    {
                        color: 0xffff00,
                        wireframe: true
                    }
                );
                */
                //this.collider = new THREE.Mesh(boxGeo, boxMat);

                //this.collider.visible = false;
                //this.mesh.add(this.collider);

                //Temporary collider positioning fix - // TODO: fix that with this.props.boundsCenter
                //THREE.SceneUtils.detach(this.collider, this.mesh, this.mesh.parent);
                //this.collider.position.set(0,1,0);

                //Make sure we don't hide the character - this helps the objects in webVR
                this.mesh.frustumCulled = false;

                //Apend the object to the Three Object3D that way it's accsesable from the instance
                this.mesh.depthkit = this;
                this.mesh.name = 'depthkit';

                //Return the object3D so it could be added to the scene
                if(_callback){
                    _callback(this.mesh);
                }

            }
        );
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

    setLineWidth(width){
      if (this.material.wireframe){
        this.material.wireframeLinewidth = width;
      } else {
        console.warn('Can not set the line width because the current character is not set to render wireframe');
      }
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

    toggleColliderVisiblity(){
      this.mesh.collider.visible = !this.mesh.collider.visible;
    }

    dispose() {
      //Remove the mesh from the scene
      try {
        this.mesh.parent.remove(this.mesh);
      } catch (e) {
        console.warn(e);
      } finally {
        this.mesh.traverse(child=>{
          if(child.geometry !== undefined){
            child.geometry.dispose();
            child.material.dispose();
          }
        });
      }
    }
}
