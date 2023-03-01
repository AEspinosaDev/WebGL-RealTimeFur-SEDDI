'use strict';

define(['framework/BaseShader'], function (BaseShader) {

    /**
     * Simple diffuse texture shader.
     * @class
     */
    class VignetteShader extends BaseShader {
        fillCode() {
            this.vertexShaderCode = 'uniform mat4 view_proj_matrix;\n' +
                'attribute vec4 rm_Vertex;\n' +
                'attribute vec2 rm_TexCoord0;\n' +



                'varying vec2 vTextureCoord;\n' +
                '\n' +
                'void main() {\n' +
                '  gl_Position = view_proj_matrix * rm_Vertex;\n' +
                '  vTextureCoord = rm_TexCoord0;\n' +
                '}';

            this.fragmentShaderCode = 'precision mediump float;\n' +
                'varying vec2 vTextureCoord;\n' +
                'uniform sampler2D sTexture;\n' +

                'uniform vec2 mousePos;\n' +
                'uniform float mouseRadio;\n' +
                'uniform int isPostProcess;\n' +

                '\n' +
                'void main() {\n' +
                '  vec4 outColor = vec4(texture2D(sTexture, vTextureCoord).rgb,1.0);\n' +
                '  if(isPostProcess==1){\n' +
                '       float distanceX = abs(gl_FragCoord.x - mousePos.x);\n' +
                '       float distanceY = abs(gl_FragCoord.y - mousePos.y);\n' +
                '       float composeDistance = sqrt(distanceX*distanceX + distanceY * distanceY);\n' +

                '       float distanceToBorder = mouseRadio-composeDistance;\r\n' +
                '       float att;\r\n' +
                '       float brushEdge = mouseRadio*0.25;\r\n' +

                '       distanceToBorder<=brushEdge ? att= distanceToBorder/brushEdge : att=1.0;\r\n' +

                //Circle brush
                '       if(composeDistance <= mouseRadio )\n' +
                '           outColor = mix(outColor,vec4(0.0,1.0,0.1,1.0),0.5*att);\n' +
                //Brush edge
                '       if(composeDistance <= mouseRadio && composeDistance >= mouseRadio-1.0)\n' +
                '           outColor = mix(vec4(0.0,0.0,0.1,1.0),outColor,0.5);\n' +
                '}\n' +

                '  gl_FragColor = outColor;\n' +
                '}';
        }

        fillUniformsAttributes() {
            this.view_proj_matrix = this.getUniform('view_proj_matrix');
            this.rm_Vertex = this.getAttrib('rm_Vertex');
            this.rm_TexCoord0 = this.getAttrib('rm_TexCoord0');
            this.sTexture = this.getUniform('sTexture');
            this.isPostProcess = this.getUniform('isPostProcess');
            this.mousePos = this.getUniform('mousePos');
            this.mouseRadio = this.getUniform('mouseRadio');
            this.rm_Normal = -1;
            this.rm_C_Normal = -1;
        }
    }

    return VignetteShader;
});