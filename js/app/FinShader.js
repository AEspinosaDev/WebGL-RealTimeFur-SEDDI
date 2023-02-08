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
                'uniform int numOfVertices;\n' +
                'out vec2 vTextureCoord;\n' +
                '\n' +
                'void main() {\n' +
                '  vec4 vertex;\n' +
                // '  if(gl_VertexID<numOfVertices){\n' + //
                // '  vertex = rm_Vertex;\n' +
                // '  }else{\n' +
                '  vertex = rm_Vertex + vec4(rm_Normal, 0.0) * vec4(8.0, 8.0, 8.0, 0.0);\n' +
                '  gl_Position = view_proj_matrix * rm_Vertex;\n' +
                '  vTextureCoord = rm_TexCoord0;\n' +
                '}';

            this.fragmentShaderCode = '#version 300 es\n' +
                'precision mediump float;\n' +
                'in vec2 vTextureCoord;\n' +
                'uniform sampler2D sTexture;\n' +
                'out vec4 outColor;\n' +

                '\n' +
                'void main() {\n' +
                //'  gl_FragColor = texture2D(sTexture, vTextureCoord);\n' +
                '  outColor =vec4(1, 0, 0, 1);\n' +

                '}';
        }

        fillUniformsAttributes() {
            this.view_proj_matrix = this.getUniform('view_proj_matrix');
            this.rm_Vertex = this.getAttrib('rm_Vertex');
            this.rm_TexCoord0 = this.getAttrib('rm_TexCoord0');
            this.sTexture = this.getUniform('sTexture');
            this.rm_Normal = this.getAttrib('rm_Normal');
            this.numOfVertices = this.getUniform('numOfVertices');
        }
    }

    return FinShader;
});
