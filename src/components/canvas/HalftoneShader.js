import * as THREE from 'three';

export function createHalftoneBuildingMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uLightDir: { value: new THREE.Vector3(0.58, 0.8, 0.42).normalize() },
      uShadowColor: { value: new THREE.Color('#090024') },
      uMidColor: { value: new THREE.Color('#27066b') },
      uDotScale: { value: 6.5 },
    },
    vertexShader: /* glsl */ `
      attribute vec3 aAccent;
      varying vec3 vNormal;
      varying vec3 vWorldPos;
      varying vec3 vLocalPos;
      varying vec3 vAccent;

      void main() {
        vAccent = aAccent;
        vLocalPos = position;

        mat4 modelMat = modelMatrix;
        #ifdef USE_INSTANCING
          modelMat = modelMatrix * instanceMatrix;
        #endif

        vec4 worldPosition = modelMat * vec4(position, 1.0);
        vWorldPos = worldPosition.xyz;

        mat3 normalMat = mat3(modelMat);
        vNormal = normalize(normalMat * normal);

        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uLightDir;
      uniform vec3 uShadowColor;
      uniform vec3 uMidColor;
      uniform float uDotScale;

      varying vec3 vNormal;
      varying vec3 vWorldPos;
      varying vec3 vLocalPos;
      varying vec3 vAccent;

      void main() {
        vec3 n = normalize(vNormal);
        float ndotl = dot(n, normalize(uLightDir));

        // 3-band comic cel shading with Spider-Verse watercolor warmth/coolness
        vec3 baseCol = uShadowColor;
        if (ndotl > 0.42) {
          baseCol = mix(uMidColor, vAccent, 0.42);
        } else if (ndotl > 0.04) {
          baseCol = uMidColor;
        }

        // Screen-space Ben-Day halftone dots in shaded regions
        vec2 cell = fract(gl_FragCoord.xy / uDotScale) - 0.5;
        float dist = length(cell);
        float shadowFactor = 1.0 - smoothstep(-0.15, 0.48, ndotl);
        float dotRadius = mix(0.06, 0.4, shadowFactor);
        float dotMask = step(dist, dotRadius);

        vec3 halftoneCol = mix(
          baseCol,
          vAccent * 0.58 + uShadowColor * 0.42,
          dotMask * shadowFactor * 0.72
        );

        // Glowing neon facade windows + rooftop trim
        float isWall = 1.0 - step(0.7, abs(n.y));
        float gridY = step(0.6, fract(vLocalPos.y * 6.0));
        float gridX = step(0.4, fract((vLocalPos.x + vLocalPos.z) * 4.5));
        float winSeed = fract(
          sin(floor(vLocalPos.y * 6.0) * 12.9898 + floor((vLocalPos.x + vLocalPos.z) * 4.5) * 78.233) *
            43758.5453
        );
        float windows = isWall * gridY * gridX * step(0.3, winSeed);
        float roofTrim = step(0.46, vLocalPos.y) * isWall;

        vec3 finalCol = mix(halftoneCol, vAccent * 1.55, clamp(windows * 0.92 + roofTrim * 0.7, 0.0, 1.0));

        // Rim highlight
        float rim = pow(1.0 - max(dot(n, normalize(cameraPosition - vWorldPos)), 0.0), 2.6);
        finalCol += vAccent * rim * 0.48;

        gl_FragColor = vec4(finalCol, 1.0);
      }
    `,
  });
}

export function createInkOutlineMaterial(thickness = 0.055) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uThickness: { value: thickness },
      uInkColor: { value: new THREE.Color('#040308') },
    },
    side: THREE.BackSide,
    vertexShader: /* glsl */ `
      uniform float uThickness;

      void main() {
        vec3 extruded = position + normalize(normal) * uThickness;
        mat4 modelMat = modelMatrix;
        #ifdef USE_INSTANCING
          modelMat = modelMatrix * instanceMatrix;
        #endif
        gl_Position = projectionMatrix * viewMatrix * modelMat * vec4(extruded, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uInkColor;
      void main() {
        gl_FragColor = vec4(uInkColor, 1.0);
      }
    `,
  });
}
