# Depthkit.js - Examples

- [**Simple**](https://github.com/juniorxsound/DepthKit.js/blob/master/examples/simple.html) - a simple Three.js scene with one DepthKit character in it
- [**Raycast**](https://github.com/juniorxsound/DepthKit.js/blob/master/examples/raycast.html) - a Three.js scene using a ```THREE.Raycaster``` attached to the mouse position to start and pause the character
- [**WebVR Simple**](https://github.com/juniorxsound/DepthKit.js/blob/master/examples/webvr_simple.html) - a simple Three.js scene using the WebVR API to enable rendering on VR headsets.
- [**WebVR Raycast**](https://github.com/juniorxsound/DepthKit.js/blob/master/examples/webvr_raycast.html) - a Three.js scene using the WebVR API to enable rendering on VR headsets. ```THREE.Raycaster``` attached to the direction the user is looking at for enabling "gaze-to-play"

**Notes:**
- Please note that since Chromium for WebVR doesn't support ```.mp4``` playback the video needs to be converted into ```.webm```
- Currently, if you plan on distributing your project to Android based mobile headsets you would need an ```origin-trail``` - [Get it here](https://developers.google.com/web/fundamentals/vr/)
- The WebVR examples showen above use the WebVR polyfill for unsupported devices - [more on WebVR polyfill](https://github.com/googlevr/webvr-polyfill)
