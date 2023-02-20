'use strict';

define(['framework/BaseShader'], function (BaseShader) {

    /**
     * Simple diffuse texture shader.
     * @class
     */
    class ShadowMapShader extends BaseShader {
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
                '\r\n' +
                
                '\r\n' +

                '\r\n' +
                'void main( void )\r\n' +
                '{\r\n' +
                'rm_Vertex;\r\n' +
                'rm_TexCoord0;\r\n' +
                'rm_Normal;\r\n' +
                '  gl_Position = view_proj_matrix * rm_Vertex;\r\n' +
                
                '}';

            this.fragmentShaderCode = '#version 300 es\r\n' +
                'precision highp float;\r\n' +

                'uniform vec3 lightColor;\n' +
                'uniform vec4 color;\n' +
                'uniform float intensity;\n' +

                'in vec2 vTexCoord0;\r\n' +
                'in vec3 finNormal;\n' +
                'in vec3 vPos;\n' +
                
                'in vec3 lightViewPos;\n' +
                'out vec4 fragColor;\r\n' +
                
                
                
                '\r\n' +
                'void main()\r\n' +
                '{\r\n' +
                // 'fragColor=color;\r\n' +
                
                '}\n' ;
               
        }

        fillUniformsAttributes() {
            this.view_proj_matrix = this.getUniform('view_proj_matrix');
            this.view_matrix = this.getUniform('view_matrix');
            this.view_model_matrix = this.getUniform('view_model_matrix');
            this.rm_Vertex = this.getAttrib('rm_Vertex');
            this.rm_TexCoord0 = this.getAttrib('rm_TexCoord0');
            this.rm_Normal = this.getAttrib('rm_Normal');
            this.diffuseMap = this.getUniform('depth');
            this.lightPos = this.getUniform('lightPos');
            this.lightColor = this.getUniform('lightColor');
            this.lightIntensity = this.getUniform('intensity');
            this.color = this.getUniform('color');
        }
    }

    return ShadowMapShader;
});
