//DepthKit.js class
import DepthKit from './depthkit'

//Make it global
if(typeof window !== 'undefined' && typeof window.THREE === 'object'){
  window.DepthKit = DepthKit;
} else {
  console.warn('[DepthKit.js] It seems like THREE is not included in your code, try including it before DepthKit.js');
}

export { DepthKit };
