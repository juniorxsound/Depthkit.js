uniform sampler2D map;
uniform float opacity;

uniform float uvdy;
uniform float uvdx;

varying float visibility;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPos;

struct PointLight {
  vec3 color;
  vec3 position;
  float distance; 
};
 
uniform PointLight pointLights[NUM_POINT_LIGHTS];

void main() {

    if ( visibility < 0.75 ) discard;

    vec4 color = texture2D( map, vUv + vec2(uvdx, uvdy));
    color.w = opacity;

    // Pretty basic lambertian lighting...
  vec4 addedLights = vec4(0.0,
                          0.0,
                          0.0,
                          1.0);
  for(int l = 0; l < NUM_POINT_LIGHTS; l++) {
      vec3 lightDirection = normalize(vPos
                            - pointLights[l].position);
      addedLights.rgb += clamp(dot(-lightDirection,
                               vNormal), 0.0, 1.0)
                         * pointLights[l].color
                         * 10.0;
  }

    gl_FragColor = color * addedLights;
    
}