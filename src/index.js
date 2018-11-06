//Depthkit.js class
import Depthkit from './depthkit'

//Make it global
if(typeof window !== 'undefined' && typeof window.THREE === 'object'){
  window.Depthkit = Depthkit;
} else {
  console.warn('[Depthkit.js] It seems like THREE is not included in your code, try including it before Depthkit.js');
}

export { Depthkit };
