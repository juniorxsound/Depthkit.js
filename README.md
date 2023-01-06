# DepthKit.js
[![Build Status](https://travis-ci.org/juniorxsound/DepthKit.js.svg?branch=master)](https://travis-ci.org/juniorxsound/DepthKit.js)                [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

A plugin for visualising [DepthKit](http://www.depthkit.tv/) volumteric captures using [Three.js](https://github.com/mrdoob/three.js) in WebGL. The plugin requires Three.js and a DepthKit *combined-per-pixel* video export from Visualise.
The plugin was developed for [Tzina: A Symphony of Longing](https://tzina.space). The project's code is [available here](https://github.com/Avnerus/tzina).

![DepthKit.js screencapture](https://raw.githubusercontent.com/juniorxsound/DepthKit.js/master/assets/gh/wire.gif)

# Install

## Install via NPM

`npm i dephtkit` and then `import { DepthKit } from 'depthkit'`  
See [npm package](https://www.npmjs.com/package/depthkit).  

## Install from CDN - es module (es6)

```html
<!-- Import maps polyfill -->
<!-- Remove this when import maps will be widely supported -->
<script async src="https://unpkg.com/es-module-shims@1.3.6/dist/es-module-shims.js"></script>
<script type="importmap">
    {
        "imports": {
            "three": "https://unpkg.com/three@0.147.0/build/three.module.js",
            "three/": "https://unpkg.com/three@0.147.0/"
        }
    }
</script>
<script type="module">
    import * as THREE from 'three'

    //TODO be checked once published on npm
    import { DepthKit } from 'https://cdn.jsdelivr.net/npm/depthkit@latest/src/dephkit.js'
    // or
    //TODO to be checked once on github - replace remmel by juniorxsound in PR - not recommented when published on npm
    import { DepthKit } from 'https://cdn.jsdelivr.net/gh/remmel/Depthkit.js/src/dephkit.js'
    //...
</script>
```

### Creating a character
```JavaScript
var character = new DepthKit("mesh", "meta.txt", "take.mp4");

scene.add(character);
```
Where the first argument takes a string for the rendering type (i.e "mesh", "wire" or "points"), the second and the third arguments are the path to the metadata file exported by Visualise and the top-bottom video.

### Controlling a character
Calling ```new DepthKit()``` returns a three.js Object3D which has all the regular properties and methods (e.g character.position.set()). Inside the character there is a ```depthkit``` object that has the neccesery methods to control the playback and rendering of the character

```character.depthkit.play()``` - Play the video

```character.depthkit.pause()``` - Pause the video

```character.depthkit.stop()``` - Stop and rewind to begining

```character.depthkit.setLoop(isLooping)``` - Set loop to true or false

```character.depthkit.setVolume(volume)``` - Change the volume of the audio

```character.depthkit.setPointSize(size)``` - Only when rendering points

```character.depthkit.setOpacity(opacity)``` - Change opacity

```character.depthkit.setLineWidth(width)``` - Change line width when rendering wireframe

```character.depthkit.dispose()```
- Dispose and clean the character instance

## Examples:
[Simple DepthKit example](https://juniorxsound.github.io/Depthkit.js/examples/simple.html)

[Mouse hover example](https://juniorxsound.github.io/Depthkit.js/examples/raycast.html)

[Raycasting webVR example](https://juniorxsound.github.io/Depthkit.js/examples/webxr_raycast.html)

## How to contribute:
1. Fork/Clone/Download
1. Install all dependencies using `npm install`
1. Start http server : `npm run start`  
1. Open http://localhost:8080/examples/simple.html

## Thanks
Originally written by [@mrdoob](https://github.com/mrdoob) and [@obviousjim](https://github.com/obviousjim) ported and modified by [@juniorxsound](https://github.com/juniorxsound) and [@avnerus](https://github.com/Avnerus). Special thank you to [Shirin Anlen](https://github.com/ShirinStar) and all the Tzina crew, [@ZEEEVE](https://github.com/zivschneider), [@jhclaura](https://github.com/jhclaura)
