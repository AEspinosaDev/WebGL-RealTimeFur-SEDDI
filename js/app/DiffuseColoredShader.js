'use strict';

define(['framework/BaseShader'], function (BaseShader) {

    /**
     * Simple diffuse texture shader.
     * @class
     */
    class DiffuseColoredShader extends BaseShader {
        fillCode() {
            this.vertexShaderCode = '#version 300 es\r\n' +
                'precision highp float;\r\n' +
                'uniform mat4 view_proj_matrix;\r\n' +
                'uniform mat4 view_model_matrix;\r\n' +
                'uniform mat4 view_matrix;\r\n' +
                'uniform vec3 lightPos;\n' +
                '\r\n' +
                'in vec4 rm_Vertex;\r\n' +
                'in vec2 rm_TexCoord0;\r\n' +
                'in vec3 rm_Normal;\r\n' +
                'in vec3 rm_Tangent;\r\n' +
                '\r\n' +
                'out vec2 vTexCoord0;\r\n' +
                'out vec3 finNormal;\n' +
                'out vec3 vPos;\n' +
                'out vec3 lightViewPos;\n' +
                '\r\n' +

                '\r\n' +
                'void main( void )\r\n' +
                '{\r\n' +
                '  gl_Position = view_proj_matrix * rm_Vertex;\r\n' +
                '  vTexCoord0 = vec2(rm_TexCoord0);\r\n' +
                '  vec3 n = mat3(transpose(inverse(view_model_matrix))) * rm_Normal;\n' +
                '  lightViewPos = (view_matrix * vec4(lightPos,1.0)).xyz;\n' +
                '  finNormal = n;\n' +
                '  rm_Tangent;\n' +
                '  vPos =  (view_model_matrix * rm_Vertex).xyz;\n' +
                '}';

            this.fragmentShaderCode = '#version 300 es\r\n' +
                'precision highp float;\r\n' +

                'uniform sampler2D diffuseMap;\r\n' +
                'uniform sampler2D depthMap;\r\n' +
                'uniform vec3 lightColor;\n' +
                'uniform vec4 color;\n' +
                'uniform float intensity;\n' +

                'in vec2 vTexCoord0;\r\n' +
                'in vec3 finNormal;\n' +
                'in vec3 vPos;\n' +

                'in vec3 lightViewPos;\n' +
                'out vec4 fragColor;\r\n' +

                '  float Pa = 0.2;\n' +
                '  float Pd = 1.0;\n' +
                '  float Ps = 1.0;\n' +
                '  vec3 Ka;\n' +
                '  vec3 Kd;\n' +
                '  float Ks;\n' +
                '  float shininess = 4.0;\n' + //this should be a shininess texture


                'vec4 computePointLight();\n' +
                '\r\n' +
                'void main()\r\n' +
                '{\r\n' +
                '   Ka = texture(diffuseMap, vTexCoord0).rgb;\r\n' +
                '   Kd = Ka;' +
                '   Ks = 0.5;\r\n' +
                '   fragColor = computePointLight();\r\n' +
                '   fragColor*=color;\r\n' +
                // '   fragColor=texture(depthMap, vTexCoord0);\r\n' +

                '}\n' +
                'vec4 computePointLight() {\n' +
                '  vec3 lightDir = normalize(lightViewPos-vPos);\n' +
                '  vec3 viewDir = normalize(-vPos);\n' +
                '  vec3 halfwayDir = normalize(lightDir-viewDir);\n' +

                '  vec3 n = normalize(finNormal);\n' +

                //Ambient
                '  vec3 ambient = Pa*Ka*lightColor;\n' +
                //Diffuse
                '  float lambertian = Ps*max(dot(n, lightDir), 0.0);\n' +
                '  vec3 diffuse =Kd*lambertian*lightColor;\n' +
                //Specular
                '  vec3 reflectDir = reflect(-lightDir,n);\n' +
                '  float spec = Ks*Ps * pow(max(dot(n, halfwayDir), 0.0), shininess);\n' +
                '  vec3 specular = spec*lightColor;\n' +
                //Result
                '  return vec4((ambient+diffuse+specular),1.0)*intensity;\n' +
                '}';
        }

        fillUniformsAttributes() {
            this.view_proj_matrix = this.getUniform('view_proj_matrix');
            this.view_matrix = this.getUniform('view_matrix');
            this.view_model_matrix = this.getUniform('view_model_matrix');
            this.rm_Vertex = this.getAttrib('rm_Vertex');
            this.rm_TexCoord0 = this.getAttrib('rm_TexCoord0');
            this.rm_Normal = this.getAttrib('rm_Normal');
            this.rm_Tangent = this.getAttrib('rm_Tangent');
            this.diffuseMap = this.getUniform('diffuseMap');
            this.lightPos = this.getUniform('lightPos');
            this.lightColor = this.getUniform('lightColor');
            this.lightIntensity = this.getUniform('intensity');
            this.color = this.getUniform('color');

            this.depthMap = this.getUniform('depthMap');
        }
    }

    return DiffuseColoredShader;
});
