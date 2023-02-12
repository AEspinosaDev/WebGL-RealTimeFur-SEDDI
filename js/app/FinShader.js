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
                'in vec4 rm_Vertex;\n' +
                'in vec2 rm_TexCoord0;\n' +
                'in vec3 rm_Normal;\n' +
                'in vec3 rm_Tangent;\n' +
                'in float rm_Extrudable;\n' +
                'uniform int numOfVertices;\n' +
                'uniform float layerThickness;\n' +
                'uniform float layersCount;\n' +
                'uniform vec3 viewPoint;\n' +
                'out vec2 vTextureCoord;\n' +
                'out vec3 finNormal;\n' +
                '\n' +
                'void main() {\n' +
                '  float f = (layersCount-1.0) * layerThickness;\r\n' +
                '  vec4 vertex;\n' +
                '  if(rm_Extrudable==1.0){\n' + //
                '  vertex = rm_Vertex + vec4(rm_Normal, 0.0) * vec4(f, f, f, 0.0);\n' +
                '  }else{\n' +
                '  vertex = rm_Vertex;}\n' +
                '  gl_Position = view_proj_matrix * vertex;\n' +
                '  vTextureCoord = rm_TexCoord0;\n' +
                '  finNormal = cross(rm_Normal,rm_Tangent);\n' +
                
                '}';
                
                this.fragmentShaderCode = '#version 300 es\n' +
                'precision mediump float;\n' +
                'in vec2 vTextureCoord;\n' +
                'in vec3 finNormal;\n' +
                'uniform sampler2D sTexture;\n' +
                'out vec4 outColor;\n' +

                '\n' +
                'void main() {\n' +
                
                '  float p = dot(vec3(1.0,0.5,0.6),finNormal);\n' +
                '  float alpha = max(0.0,2.0*abs(p)-1.0);\n' +
                '  outColor =vec4(1, 0, 0, alpha);\n' +

                '}';
        }

        fillUniformsAttributes() {
            this.view_proj_matrix = this.getUniform('view_proj_matrix');
            this.rm_Vertex = this.getAttrib('rm_Vertex');
            this.rm_TexCoord0 = this.getAttrib('rm_TexCoord0');
            this.sTexture = this.getUniform('sTexture');
            this.rm_Extrudable = this.getAttrib('rm_Extrudable');
            this.rm_Normal = this.getAttrib('rm_Normal');
            this.rm_Tangent = this.getAttrib('rm_Tangent');
            this.numOfVertices = this.getUniform('numOfVertices');
            this.layerThickness = this.getUniform('layerThickness');
            this.layersCount = this.getUniform('layersCount');
        }
    }

    return FinShader;
});
