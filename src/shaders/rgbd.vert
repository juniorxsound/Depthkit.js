uniform float mindepth;
uniform float maxdepth;

uniform float width;
uniform float height;

uniform bool isPoints;
uniform float pointSize;

uniform float time;

varying vec3 vNormal;
varying vec3 vPos;

//TODO: make uniforms
const float fx = 1.11087;
const float fy = 0.832305;

uniform sampler2D map;

//Making z global
float z;

varying float visibility;
varying vec2 vUv;

vec3 rgb2hsl( vec3 color ) {
    float h = 0.0;
    float s = 0.0;
    float l = 0.0;
    float r = color.r;
    float g = color.g;
    float b = color.b;
    float cMin = min( r, min( g, b ) );
    float cMax = max( r, max( g, b ) );
    l =  ( cMax + cMin ) / 2.0;
    if ( cMax > cMin ) {
        float cDelta = cMax - cMin;
        // saturation
        if ( l < 0.5 ) {
            s = cDelta / ( cMax + cMin );
        } else {
            s = cDelta / ( 2.0 - ( cMax + cMin ) );
        }

        // hue
        if ( r == cMax ) {
            h = ( g - b ) / cDelta;
        } else if ( g == cMax ) {
            h = 2.0 + ( b - r ) / cDelta;
        } else {
            h = 4.0 + ( r - g ) / cDelta;
        }

        if ( h < 0.0) {
            h += 6.0;
        }
        h = h / 6.0;

    }
    return vec3( h, s, l );
}

vec3 xyz( float x, float y, float depth ) {
    z = depth * ( maxdepth - mindepth ) + mindepth;
    return vec3( ( x / height  ) * z * fx, ( y / (width * 2.0)  ) * z * fy, - z );
}

void main() {

    vUv = vec2( ( position.x + 512.0 ) / 1024.0 , ( position.y + 512.0  ) / 1024.0 );

    vUv.y = vUv.y * 0.5;// + 0.5;

    vPos = (modelMatrix * vec4(position, 1.0 )).xyz;
    vNormal = normalMatrix * normal;

    vec3 hsl = rgb2hsl( texture2D( map, vUv ).xyz );
    vec4 pos = vec4( xyz( position.x, position.y, hsl.x ), 1.0 );
    pos.z += 2600.0;

    visibility = hsl.z * 2.1;

    if(isPoints){
        gl_PointSize = pointSize;
    }

    gl_Position = projectionMatrix * modelViewMatrix * pos;
}