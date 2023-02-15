'use strict';

define(['framework/BaseShader'], function (BaseShader) {

    /**
     * Simple diffuse texture shader.
     * @class
     */
    class DiffuseShader extends BaseShader {
        fillCode() {
            this.vertexShaderCode = '#version 300 es\n' +
                'uniform mat4 view_proj_matrix;\n' +
                'uniform mat4 view_model_matrix;\n' +
                'uniform mat4 view_matrix;\n' +
                'uniform vec3 lightPos;\n' +
                'in vec4 rm_Vertex;\n' +
                'in vec2 rm_TexCoord0;\n' +
                'in vec3 rm_Normal;\n' +
                'out vec2 vTextureCoord;\n' +
                'out vec3 pos;\n' +
                'out vec3 normal;\n' +
                'out vec3 lightViewPos;\n' +
                '\n' +
                'void main() {\n' +
                '  vTextureCoord = rm_TexCoord0;\n' +
                '  normal = mat3(transpose(inverse(view_model_matrix))) * rm_Normal;\n' +
                '  pos = (view_model_matrix * rm_Vertex).xyz;\n' +
                '  lightViewPos = (view_matrix * vec4(lightPos,1.0)).xyz;\n' +
                '  gl_Position = view_proj_matrix * rm_Vertex;\n' +

                '}';

            this.fragmentShaderCode = '#version 300 es\n' +
                'precision mediump float;\n' +
                'in vec2 vTextureCoord;\n' +
                'in vec3 normal;\n' +
                'in vec3 pos;\n' +
                'in vec3 lightViewPos;\n' +
                'uniform sampler2D sTexture;\n' +
                'uniform vec3 lightColor;\n' +
                'uniform vec4 color;\n' +

                'out vec4 fragColor;\n' +

                'vec4 computePointLight();\n' +
                '\n' +
                'void main() {\n' +
                '  fragColor = computePointLight() * texture(sTexture, vTextureCoord);\n' +
                // '  fragColor = texture(sTexture, vTextureCoord)*color;\n' +
                // '  fragColor *=color;\n' +
                '}\n' +
                'vec4 computePointLight() {\n' +
                '  float ka = 0.1;\n' +
                '  float kd = 1.0;\n' +
                '  float ks = 0.2;\n' +

                '  vec3 lightDir = normalize(lightViewPos-pos);\n' +
                '  vec3 n = normalize(normal);\n' +
                //Ambient
                '  vec3 ambient = ka*lightColor;\n' +
                //Diffuse
                '  kd *= max(dot(n, lightDir), 0.0);\n' +
                '  vec3 diffuse =kd*lightColor;\n' +
                //Specular
                '  vec3 viewDir = normalize(-pos);\n' +
                '  vec3 reflectDir = reflect(-lightDir,n);\n' +
                '  ks *= pow(max(dot(viewDir, reflectDir), 0.0), 32.0);\n' +
                '  vec3 specular = ks*lightColor;\n' +
                //Result
                '  return vec4((ambient+diffuse+specular),1.0);\n' +
                '}';
        }

        fillUniformsAttributes() {
            this.view_proj_matrix = this.getUniform('view_proj_matrix');
            this.view_model_matrix = this.getUniform('view_model_matrix');
            this.view_matrix = this.getUniform('view_matrix');
            this.rm_Vertex = this.getAttrib('rm_Vertex');
            this.rm_TexCoord0 = this.getAttrib('rm_TexCoord0');
            this.sTexture = this.getUniform('sTexture');
            this.rm_Normal = this.getUniform('rm_Normal');
            this.color = this.getUniform('color');

            this.lightPos = this.getUniform('lightPos');
            this.lightColor = this.getUniform('lightColor');
        }
    }

    return DiffuseShader;
});
