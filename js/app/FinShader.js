'use strict';

define(['framework/BaseShader'], function (BaseShader) {

    /**
     * Simple diffuse texture shader.
     * @class
     */
    class FinShader extends BaseShader {
        fillCode() {
            this.vertexShaderCode =
                '#version 300 es\n' +
                'uniform mat4 view_proj_matrix;\n' +
                'uniform mat4 view_matrix;\n' +
                'uniform mat4 view_model_matrix;\n' +
                'in vec4 rm_Vertex;\n' +
                'in vec2 rm_TexCoord0;\n' +
                'in vec3 rm_Normal;\n' +
                'in vec3 rm_Tangent;\n' +
                'in float rm_Extrudable;\n' +
                'uniform int numOfVertices;\n' +
                'uniform float layerThickness;\n' +
                'uniform float layersCount;\n' +
                'uniform vec4 colorStart;\r\n' +
                'uniform vec4 colorEnd;\r\n' +
                'uniform vec3 lightPos;\n' +
                'out vec2 vTextureCoord;\n' +
                'out vec3 finNormal;\n' +
                'out vec3 vPos;\n' +
                'out vec3 lightViewPos;\n' +
                'out vec4 vAO;\r\n' +
                '\n' +
                'void main() {\n' +
                '  float f = layersCount * layerThickness;\r\n' +
                '  vec4 vertex;\n' +
                '  if(rm_Extrudable==1.0){\n' + //
                '  vertex = rm_Vertex + vec4(rm_Normal, 0.0) * vec4(f, f, f, 0.0);\n' +
                '  }else{\n' +
                '  vertex = rm_Vertex;}\n' +
                '  gl_Position = view_proj_matrix * vertex;\n' +
                '  vTextureCoord = rm_TexCoord0;\n' +
                ' vec3 n = mat3(transpose(inverse(view_model_matrix))) * rm_Normal;\n' +
                // ' vec3 t = mat3(transpose(inverse(view_model_matrix))) * rm_Tangent;\n' +
                // '  finNormal = cross(n,t);\n' +
                '  lightViewPos = (view_matrix * vec4(lightPos,1.0)).xyz;\n' +
                '  finNormal = n;\n' +
                '  vPos =  (view_model_matrix * vertex).xyz;\n' +
                '  vAO = mix(colorStart, colorEnd, rm_Extrudable);\r\n' +
                '}';

            this.fragmentShaderCode = '#version 300 es\n' +
                'precision mediump float;\n' +
                'in vec2 vTextureCoord;\n' +
                'in vec3 finNormal;\n' +
                'in vec3 vPos;\n' +
                'in vec3 viewPos;\n' +
                'in vec4 vAO;\n' +
                'uniform sampler2D diffuseMap;\n' +
                'uniform sampler2D alphaMap;\n' +
                'uniform vec3 lightColor;\n' +
                'in vec3 lightViewPos;\n' +
                'out vec4 fragColor;\n' +
                'vec4 computePointLight();\n' +
                '\n' +
                'void main() {\n' +
                '  float p = dot(normalize(-vPos),normalize(finNormal));\n' +
                '  p = 1.0-p;\n' +
                '  float alpha = max(0.0,2.0*abs(p)-1.0);\n' +
                '  alpha = alpha*texture(alphaMap, vTextureCoord).r;\n' +
                '  vec4 color = texture(diffuseMap, vTextureCoord);\r\n' +
                '  color*=vAO;\r\n' +
                '  color*=computePointLight();\r\n' +
                '  color.a = alpha;\r\n' +
                '  fragColor =vec4(1, 0, 0, alpha);\n' +
                '  fragColor =color;\n' +
                // '  fragColor =vec4(1, 0, 0, 1);\n' +
                '}\n' +
                'vec4 computePointLight() {\n' +
                '  float ka = 0.1;\n' +
                '  float kd = 1.0;\n' +
                '  float ks = 0.2;\n' +
                '  vec3 lightDir = normalize(lightViewPos-vPos);\n' +
                '  vec3 n = normalize(finNormal);\n' +
                //Ambient
                '  vec3 ambient = ka*lightColor;\n' +
                //Diffuse
                '  kd *= max(dot(n, lightDir), 0.0);\n' +
                '  vec3 diffuse =kd*lightColor;\n' +
                //Specular
                '  vec3 viewDir = normalize(-vPos);\n' +
                '  vec3 reflectDir = reflect(-lightDir,n);\n' +
                '  ks *= pow(max(dot(viewDir, reflectDir), 0.0), 32.0);\n' +
                '  vec3 specular = ks*lightColor;\n' +
                //Result
                '  return vec4((ambient+diffuse+specular),1.0);\n' +
                '}';
        }

        fillUniformsAttributes() {
            this.view_proj_matrix = this.getUniform('view_proj_matrix');
            this.view_matrix = this.getUniform('view_matrix');
            this.view_model_matrix = this.getUniform('view_model_matrix');
            this.rm_Vertex = this.getAttrib('rm_Vertex');
            this.rm_TexCoord0 = this.getAttrib('rm_TexCoord0');
            this.sTexture = this.getUniform('sTexture');
            this.rm_Extrudable = this.getAttrib('rm_Extrudable');
            this.rm_Normal = this.getAttrib('rm_Normal');
            this.rm_Tangent = this.getAttrib('rm_Tangent');
            this.numOfVertices = this.getUniform('numOfVertices');
            this.layerThickness = this.getUniform('layerThickness');
            this.layersCount = this.getUniform('layersCount');
            this.eyePos = this.getUniform('eyePos');
            this.diffuseMap = this.getUniform('diffuseMap');
            this.alphaMap = this.getUniform('alphaMap');
            this.colorStart = this.getUniform('colorStart');
            this.colorEnd = this.getUniform('colorEnd');

            this.lightPos = this.getUniform('lightPos');
            this.lightColor = this.getUniform('lightColor');
        }
    }

    return FinShader;
});
