# DepthKit.js
[![Build Status](https://travis-ci.org/juniorxsound/DepthKit.js.svg?branch=master)](https://travis-ci.org/juniorxsound/DepthKit.js)                [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

A plugin for visualising [DepthKit](http://www.depthkit.tv/) volumteric captures using [Three.js](https://github.com/mrdoob/three.js) in WebGL. The plugin requires Three.js and a DepthKit *combined-per-pixel* video export from Visualise.
The plugin was developed for [Tzina: A Symphony of Longing](https://tzina.space). The project's code is [available here](https://github.com/Avnerus/tzina).

![DepthKit.js screencapture](https://raw.githubusercontent.com/juniorxsound/DepthKit.js/master/assets/gh/wire.gif)

Include ```depthkit.js``` or ```depthkit.min.js``` after loading ```three.js``` in your project.

Alternatively, if you use Node.js you can install the package with npm using ```npm install depthkit``` [npm package](https://www.npmjs.com/package/depthkit)

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

[Simple webVR example](https://juniorxsound.github.io/Depthkit.js/examples/webvr_simple.html)

[Raycasting webVR example](https://juniorxsound.github.io/Depthkit.js/examples/webvr_raycast.html)

## How to contribute:
1. Fork/Clone/Download
1. Install all dependcies using ```npm install```
1. Use the following node commands:

```npm run start``` uses ```concurrently``` to start an ```http-server``` and to run ```watchify``` and bundle on every change to ```build/depthkit.js```

```npm run build``` to bundle and minify to ```build/depthkit.min.js```

## Thanks
Originally written by [@mrdoob](https://github.com/mrdoob) and [@obviousjim](https://github.com/obviousjim) ported and modified by [@juniorxsound](https://github.com/juniorxsound) and [@avnerus](https://github.com/Avnerus). Special thank you to [Shirin Anlen](https://github.com/ShirinStar) and all the Tzina crew, [@ZEEEVE](https://github.com/zivschneider), [@jhclaura](https://github.com/jhclaura)
