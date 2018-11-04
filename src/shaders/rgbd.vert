uniform float nearClip;
uniform float farClip;
uniform float width;
uniform float height;
uniform bool isPoints;
uniform float pointSize;
uniform float time;
uniform vec2 focalLength;
uniform vec2 principalPoint;
uniform vec2 imageDimensions;
uniform vec4 crop;
uniform float meshScalar;
uniform mat4 extrinsics;
uniform sampler2D map;
varying vec4 vPos;
varying vec2 vUv;
varying vec2 vUvDepth;

float _DepthBrightnessThreshold = 0.5;  // per-pixel brightness threshold, used to refine edge geometry from eroneous edge depth samples
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
    vec2 centerpix = vec2(1.0/width, 1.0/height) * 0.5;
    texturePoint += centerpix;

    // clamp to texture bounds - 0.5 pixelsize so we do not sample outside our texture
    texturePoint = clamp(texturePoint, centerpix, vec2(1.0, 0.5) - centerpix);
    vec4 depthsample = texture2D(map, texturePoint);
    vec3 depthsamplehsv = rgb2hsv(depthsample.rgb);
    return depthsamplehsv.b > _DepthBrightnessThreshold + BRIGHTNESS_THRESHOLD_OFFSET ? depthsamplehsv.r : 0.0;
}


void main()
{
    vec4 texSize = vec4(1.0 / width, 1.0 / height, width, height);
    vec2 basetex = position.xy;

    // we align our depth pixel centers with the center of each quad, so we do not require a half pixel offset
    vec2 depthTexCoord = basetex * vec2(1.0, 0.5);
    vec2 colorTexCoord = basetex * vec2(1.0, 0.5) + vec2(0.0, 0.5);

    // coordinates are always aligned to a multiple of texture sample widths, no need to clamp to topleft
    // unlike per-pixel sampling.
    float depth = depthForPoint(depthTexCoord);
    if (depth <= CLIP_EPSILON || ((1.0 - CLIP_EPSILON) >= depth))
    {
        // we use a 3x3 kernel, so sampling 8 neighbors
        //vec2 textureStep = 1.0 / meshScalar;
        vec2 textureStep = vec2(texSize.x * meshScalar, texSize.y * meshScalar);   // modify our texture step 
        
        vec2 neighbors[8];
        neighbors[0] = vec2(-textureStep.x, -textureStep.y);
        neighbors[1] = vec2(0, -textureStep.y);
        neighbors[2] = vec2(textureStep.x, -textureStep.y);
        neighbors[3] = vec2(-textureStep.x, 0);
        neighbors[4] = vec2(textureStep.x, 0);
        neighbors[5] = vec2(-textureStep.x, textureStep.y);
        neighbors[6] = vec2(0, textureStep.y);
        neighbors[7] = vec2(textureStep.x, textureStep.y);
        
        // if this depth sample is not valid then check neighbors
        int validNeighbors = 0;
        float maxDepth = 0.0;
        for (int i = 0; i < 8; i++)
        {
            float depthNeighbor = depthForPoint(depthTexCoord + neighbors[i]);
            maxDepth = max(maxDepth, depthNeighbor);
            validNeighbors += (depthNeighbor > CLIP_EPSILON || ((1.0 - CLIP_EPSILON) < depthNeighbor)) ? 1 : 0;
        }

        // clip to near plane if we and all our neighbors are invalid
        depth = validNeighbors > 0 ? maxDepth : 0.0;
    }

    vec2 imageCoordinates = crop.xy + (basetex * crop.zw);
    float z = depth * (farClip - nearClip) + nearClip; // transform from 0..1 space to near-far space Z
    vec2 ortho = imageCoordinates * imageDimensions - principalPoint;
    vec2 proj = ortho * z / focalLength;
    vec4 worldPos = extrinsics *  vec4(proj.xy, z, 1.0);
    worldPos.w = 1.0;
    gl_Position =  projectionMatrix * modelViewMatrix * worldPos;
    vUv = colorTexCoord;
    vUvDepth = depthTexCoord;
    vPos = worldPos;//gl_Position.xyz;//(modelMatrix * vec4(gl_Position.xyz, 1.0)).xyz;//(modelMatrix * vec4(position, 1.0)).xyz;
}
