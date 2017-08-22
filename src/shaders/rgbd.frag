uniform sampler2D map;
uniform float opacity;

uniform float uvdy;
uniform float uvdx;

varying float visibility;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPos;

void main() {

    if ( visibility < 0.75 ) discard;

    vec4 color = texture2D( map, vUv + vec2(uvdx, uvdy));
    color.w = opacity;

    gl_FragColor = color;
    
}