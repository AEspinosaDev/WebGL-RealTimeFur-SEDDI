'use strict';

define(['framework/BaseShader'], function (BaseShader) {

    /**
     * Simple diffuse texture shader.
     * @class
     */
    class MouseGizmoShader extends BaseShader {
        fillCode() {
            this.vertexShaderCode = '#version 300 es\r\n' +
                'precision highp float;\r\n' +
                'uniform mat4 view_proj_matrix;\r\n' +
                'uniform mat4 view_model_matrix;\r\n' +
                'uniform mat4 view_matrix;\r\n' +

                'uniform vec3 mousePosition;\n' +
                '\r\n' +
               
                'out vec3 vPos;\n' +
                'out vec3 lightViewPos;\n' +
                '\r\n' +

                '\r\n' +
                'void main( void )\r\n' +
                '{\r\n' +
                '  gl_Position = vec4(mousePosition,1.0);\r\n' +
                
                // '  vPos =  (view_model_matrix * rm_Vertex).xyz;\n' +
                '}';

            this.fragmentShaderCode = '#version 300 es\r\n' +
                'precision highp float;\r\n' +

               
              

                
                'in vec3 vPos;\n' +

              
                'out vec4 fragColor;\r\n' +

             

                'vec4 computePointLight();\n' +
                '\r\n' +
                'void main()\r\n' +
                '{\r\n' +
              
                '   fragColor=vec4(1.0,1.0,1.0,1.0);\r\n' +
               
                '}' 
              
        }

        fillUniformsAttributes() {
            this.view_proj_matrix = this.getUniform('view_proj_matrix');
            this.view_matrix = this.getUniform('view_matrix');
            this.view_model_matrix = this.getUniform('view_model_matrix');
          
            this.mousePosition = this.getUniform('mousePosition');

           
        }
    }

    return MouseGizmoShader;
});
