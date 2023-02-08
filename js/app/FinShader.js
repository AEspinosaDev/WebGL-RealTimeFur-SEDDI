'use strict';

define(['framework/BaseShader'], function(BaseShader) {

    /**
     * Simple diffuse texture shader.
     * @class
     */
    class FinShader extends BaseShader {
        fillCode() {
            this.vertexShaderCode = 'uniform mat4 view_proj_matrix;\n' +
                'attribute vec4 rm_Vertex;\n' +
                'attribute vec2 rm_TexCoord0;\n' +
                'attribute vec3 rm_Normal;\n' +
                'varying vec2 vTextureCoord;\n' +
                '\n' +
                'void main() {\n' +
                '  ;\n' +
                '  vec4 vertex = rm_Vertex + vec4(rm_Normal, 0.0) * vec4(0.1, 0.1, 0.1, 0.0);\n' +
                '  gl_Position = view_proj_matrix * vertex;\n' +
                '  vTextureCoord = rm_TexCoord0;\n' +
                '}';

            this.fragmentShaderCode = 'precision mediump float;\n' +
                'varying vec2 vTextureCoord;\n' +
                'uniform sampler2D sTexture;\n' +
                '\n' +
                'void main() {\n' +
                //'  gl_FragColor = texture2D(sTexture, vTextureCoord);\n' +
                '  gl_FragColor =vec4(1, 0, 0, 1);\n' +

                '}';
        }

        fillUniformsAttributes() {
            this.view_proj_matrix = this.getUniform('view_proj_matrix');
            this.rm_Vertex = this.getAttrib('rm_Vertex');
            this.rm_TexCoord0 = this.getAttrib('rm_TexCoord0');
            this.sTexture = this.getUniform('sTexture');
            this.rm_Normal = this.getAttrib('rm_Normal');
        }
    }

    return FinShader;
});
