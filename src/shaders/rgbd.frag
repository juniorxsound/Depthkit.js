#extension GL_OES_standard_derivatives : enable

uniform sampler2D map;
uniform float opacity;
uniform float width;
uniform float height;

varying vec2 vUv;
varying vec2 vUvDepth;
varying vec4 vPos;
float _DepthBrightnessThreshold = 0.8;  // per-pixel brightness threshold, used to refine edge geometry from eroneous edge depth samples
float _SheerAngleThreshold = 0.04;       // per-pixel internal edge threshold (sheer angle of geometry at that pixel)
#define BRIGHTNESS_THRESHOLD_OFFSET 0.01
#define FLOAT_EPS 0.00001
#define CLIP_EPSILON 0.005

vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + FLOAT_EPS)), d / (q.x + FLOAT_EPS), q.x);
}

float depthForPoint(vec2 texturePoint)
{   
    vec2 centerpix = vec2(.5/width, .5/height);
    texturePoint += centerpix;
    // clamp to texture bounds - 0.5 pixelsize so we do not sample outside our texture
    texturePoint = clamp(texturePoint, centerpix, vec2(1.0, 0.5) - centerpix);
    vec4 depthsample = texture2D(map, texturePoint);
    vec3 depthsamplehsv = rgb2hsv(depthsample.rgb);
    return depthsamplehsv.b > _DepthBrightnessThreshold + BRIGHTNESS_THRESHOLD_OFFSET ? depthsamplehsv.r : 0.0;
}

void main()
{
    vec2 centerpix = vec2(.5/width, .5/height);
    vec2 centerDepthSampleCoord = vUvDepth - mod(vUvDepth, vec2(1.0/width, 1.0/height) ); // clamp to start of pixel

    float depth = depthForPoint(centerDepthSampleCoord);
    // we filter the _SheerAngleThreshold value on CPU so that we have an ease in over the 0..1 range, removing internal geometry at grazing angles
    // we also apply near and far clip clipping, the far clipping plane is pulled back to remove geometry wrapped to the far plane from the near plane
    //convert back from worldspace to local space
    vec4 localPos = vPos;
    //convert to homogenous coordinate space
    localPos.xy /= localPos.z;
    //find local space normal for triangle surface
    vec3 dx = dFdx(localPos.xyz);
    vec3 dy = dFdy(localPos.xyz);
    vec3 n = normalize(cross(dx, dy));
    
    // make sure to handle dot product of the whole hemisphere by taking the absolute of range -1 to 0 to 1
    float sheerAngle = abs(dot(n, vec3(0.0, 0.0, 1.0)));

    // clamp to texture bounds - 0.5 pixelsize so we do not sample outside our texture
    vec2 colorTexCoord = clamp(vUv, vec2(0.0, 0.5) + centerpix, vec2(1.0, 1.0) - centerpix);
    vec4 color = texture2D(map, colorTexCoord);
    color.w = opacity;

    //color.xyz = vPos.xyz * 0.5 + 0.5;
    //color.xyz = n.xyz * 0.5 + 0.5;
    //color.xyz = vec3(sheerAngle, sheerAngle, sheerAngle);

    if ( depth <        CLIP_EPSILON  ||
         depth > (1.0 - CLIP_EPSILON) ||
         sheerAngle < (_SheerAngleThreshold + FLOAT_EPS))
    {
        discard;
    }

    gl_FragColor = color;
}