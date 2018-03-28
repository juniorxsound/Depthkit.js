uniform float mindepth;
uniform float maxdepth;

uniform float width;
uniform float height;

uniform bool isPoints;
uniform float pointSize;

uniform float time;

uniform vec2 focalLength;
uniform vec2 principalPoint;
uniform vec2 imageDimensions;
uniform vec4 crop;
uniform vec2 meshDensity;
uniform mat4 extrinsics;

varying vec3 vNormal;
varying vec3 vPos;

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


/*
    vertOut = float4(
        (imageCoordinates.x * _ImageDimensions.x - _PrincipalPoint.x) * z / _FocalLength.x,
        (imageCoordinates.y * _ImageDimensions.y - _PrincipalPoint.y) * z / _FocalLength.y,
        z, vertIn.w);
*/

vec3 xyz( float x, float y, float depth ) {
    z = depth * ( maxdepth - mindepth ) + mindepth;
    vec2 imageCoordinates = vec2(x,y);
    return vec3((imageCoordinates * imageDimensions - principalPoint) * z / focalLength, z);
    // return vec3( ( x / height  ) * z * fx, ( y / (width * 2.0)  ) * z * fy, - z );
}

void main() {

/*
    float2 centerpix = _MainTex_TexelSize.xy * .5;
    float2 textureStep = float2(1.0 / (_MeshDensity - 1.0), 1.0 / (_MeshDensity - 1.0));
    float2 basetex = floor(vertIn.xy * _MainTex_TexelSize.zw) * _MainTex_TexelSize.xy;
    float2 imageCoordinates = _Crop.xy + (basetex * _Crop.zw);

    //flip texture
    if (_TextureFlipped == 1)
    {
        basetex.y = 1.0 - basetex.y;
        depthTexCoord = basetex * float2(1.0, 0.5) + float2(0.0, 0.5) + centerpix;
        colorTexCoord = basetex * float2(1.0, 0.5) + centerpix;
    }
    else
    {
        depthTexCoord = basetex * float2(1.0, 0.5) + centerpix;
        colorTexCoord = basetex * float2(1.0, 0.5) + float2(0.0, 0.5) + centerpix;
    }
*/
    vec4 texSize = vec4(1.0 / width, 1.0 / height, width, height);

    vec2 centerpix = texSize.xy * .5;
    vec2 textureStep = 1.0 / meshDensity;
    vec2 basetex = floor(position.xy * textureStep * texSize.zw) * texSize.xy;
    vec2 imageCoordinates = crop.xy + (basetex * crop.zw);

    vec2 depthTexCoord = basetex * vec2(1.0, 0.5) + centerpix;
    vec2 colorTexCoord = basetex * vec2(1.0, 0.5) + vec2(0.0, 0.5) + centerpix;

    // vUv = (position.xy + texSize * 0.5) / texSize;// ( position.x + 512.0 ) / 1024.0 , ( position.y + 512.0  ) / 1024.0 );
    // vUv.y = vUv.y * 0.5;// + 0.5;
    // vUv = vUv * crop.wz + crop.xy;

    vUv = depthTexCoord;
    vPos = (modelMatrix * vec4(position, 1.0 )).xyz;
    vNormal = normalMatrix * normal;

    vec3 hsl = rgb2hsl( texture2D( map, depthTexCoord ).xyz );
    vec4 pos = extrinsics * vec4( xyz( imageCoordinates.x, imageCoordinates.y, hsl.x ), 1.0 );
    pos.w = 1.0;
    // pos.z += 2600.0;

    visibility = hsl.z * 2.1;

    if(isPoints){
        gl_PointSize = pointSize;
    }

    gl_Position = projectionMatrix * modelViewMatrix * pos;
}