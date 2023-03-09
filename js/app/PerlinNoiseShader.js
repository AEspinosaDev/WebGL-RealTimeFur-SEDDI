'use strict';

define(['framework/BaseShader'], function (BaseShader) {

    /**
     * Simple diffuse texture shader.
     * @class
     */
    class PerlinNoiseShader extends BaseShader {
        fillCode() {
            this.vertexShaderCode = '#version 300 es\r\n' +
            'const vec2 quadVertices[4] = vec2[4]( vec2( -1.0, -1.0), vec2( 1.0, -1.0), vec2( -1.0, 1.0), vec2( 1.0, 1.0));\n' +
            'void main()\n' +
            '{\n' +
                'gl_Position = vec4(quadVertices[gl_VertexID], 0.0, 1.0);\n' +
            '}\n' 

            this.fragmentShaderCode = '#version 300 es\r\n' +
                'precision highp float;\r\n' +

                'uniform vec2 u_resolution;\n' +
                
                
                
                'out vec4 fragColor;\n' +
                
                'uint hash(uint x, uint seed) {\n' +
                    'const uint m = 0x5bd1e995U;\n' +
                    'uint hash = seed;\n' +
                    // process input
                    'uint k = x;\n' +
                    'k *= m;\n' +
                    'k ^= k >> 24;\n' +
                    'k *= m;\n' +
                    'hash *= m;\n' +
                    'hash ^= k;\n' +
                    // some final mixing
                    'hash ^= hash >> 13;\n' +
                    'hash *= m;\n' +
                    'hash ^= hash >> 15;\n' +
                    'return hash;\n' +
                '}\n' +
                
                // implementation of MurmurHash (https://sites.google.com/site/murmurhash/) for a  
                // 2-dimensional unsigned integer input vector.
                
                'uint hash(uvec2 x, uint seed){\n' +
                    'const uint m = 0x5bd1e995U;\n' +
                    'uint hash = seed;\n' +
                    // process first vector element
                    'uint k = x.x; \n' +
                    'k *= m;\n' +
                    'k ^= k >> 24;\n' +
                    'k *= m;\n' +
                    'hash *= m;\n' +
                    'hash ^= k;\n' +
                    // process second vector element
                    'k = x.y; \n' +
                    'k *= m;\n' +
                    'k ^= k >> 24;\n' +
                    'k *= m;\n' +
                    'hash *= m;\n' +
                    'hash ^= k;\n' +
                    // some final mixing
                    'hash ^= hash >> 13;\n' +
                    'hash *= m;\n' +
                    'hash ^= hash >> 15;\n' +
                    'return hash;\n' +
                '}\n' +
                
                
                'vec2 gradientDirection(uint hash) {\n' +
                    'switch (int(hash) & 3) {\n' + // look at the last two bits to pick a gradient direction
                    'case 0:\n' +
                        'return vec2(1.0, 1.0);\n' +
                    'case 1:\n' +
                        'return vec2(-1.0, 1.0);\n' +
                    'case 2:\n' +
                        'return vec2(1.0, -1.0);\n' +
                    'case 3:\n' +
                        'return vec2(-1.0, -1.0);\n' +
                   ' }\n' +
                '}\n' +
                
                'float interpolate(float value1, float value2, float value3, float value4, vec2 t) {\n' +
                    'return mix(mix(value1, value2, t.x), mix(value3, value4, t.x), t.y);\n' +
                '}\n' +
                
                'vec2 fade(vec2 t) {\n' +
                    // 6t^5 - 15t^4 + 10t^3
                    'return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\n' +
                '}\n' +
                
                'float perlinNoise(vec2 position, uint seed) {\n' +
                    'vec2 floorPosition = floor(position);\n' +
                    'vec2 fractPosition = position - floorPosition;\n' +
                    'uvec2 cellCoordinates = uvec2(floorPosition);\n' +
                    'float value1 = dot(gradientDirection(hash(cellCoordinates, seed)), fractPosition);\n' +
                    'float value2 = dot(gradientDirection(hash((cellCoordinates + uvec2(1, 0)), seed)), fractPosition - vec2(1.0, 0.0));\n' +
                    'float value3 = dot(gradientDirection(hash((cellCoordinates + uvec2(0, 1)), seed)), fractPosition - vec2(0.0, 1.0));\n' +
                    'float value4 = dot(gradientDirection(hash((cellCoordinates + uvec2(1, 1)), seed)), fractPosition - vec2(1.0, 1.0));\n' +
                    'return interpolate(value1, value2, value3, value4, fade(fractPosition));\n' +
                '}\n' +
                
                'float perlinNoise(vec2 position, int frequency, int octaveCount, float persistence, float lacunarity, uint seed) {\n' +
                    'float value = 0.0;\n' +
                    'float amplitude = 1.0;\n' +
                    'float currentFrequency = float(frequency);\n' +
                    'uint currentSeed = seed;\n' +
                    'for (int i = 0; i < octaveCount; i++) {\n' +
                        'currentSeed = hash(currentSeed, 0x0U); // create a new seed for each octave\n' +
                        'value += perlinNoise(position * currentFrequency, currentSeed) * amplitude;\n' +
                        'amplitude *= persistence;\n' +
                        'currentFrequency *= lacunarity;\n' +
                    '}\n' +
                    'return value;\n' +
                '}\n' +
                
        
             
                '\r\n' +
                'void main()\r\n' +
                '{\r\n' +
                'vec2 position = gl_FragCoord.xy / u_resolution;\n' +
                // 'position.x *= u_resolution.x / u_resolution.y;\n' +
                // 'position += iTime * 0.25;\n' +
                'uint seed = 0x578437adU;\n' + // can be set to something else if you want a different set of random values
                // float frequency = 16.0;
                // 'float value = perlinNoise(position * 200.0, seed);\n' + // single octave perlin noise
                'float value = perlinNoise(position,   1000, 9, 0.8, 0.2, seed);\n' + // multiple octaves
                'value = (value + 1.0) * 0.5;\n' + // convert from range [-1, 1] to range [0, 1]

                'fragColor=vec4(vec3(value), 1.0);\r\n' +
                // 'fragColor=vec4(1.0,0.0,0.0,1.0);\r\n' +
                '}\n' 
              
        }

        fillUniformsAttributes() {
            this.view_proj_matrix = this.getUniform('view_proj_matrix');
            this.view_matrix = this.getUniform('view_matrix');
            this.view_model_matrix = this.getUniform('view_model_matrix');
        
            this.resolution = this.getUniform('u_resolution');
        }
    }

    return PerlinNoiseShader;
});
