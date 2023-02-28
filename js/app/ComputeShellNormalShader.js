'use strict';

define(['framework/BaseShader'], function (BaseShader) {

    /**
     * Simple diffuse texture shader.
     * @class
     */
    class ComputeShellNormalShader extends BaseShader {
        fillCode() {
            this.vertexShaderCode = '#version 300 es\r\n' +
                'uniform mat4 view_proj_matrix;\n' +
                'in vec4 rm_Vertex;\n' +
                'in vec3 rm_Normal;\n' +
                'in vec3 rm_C_Normal;\n' +
                'in vec3 rm_Tangent;\n' +

                'uniform mat4 view_model_matrix;\r\n' +
                'uniform vec3 combViewDir3D;\n' +
                'uniform float combAngle;\n' +

                'out vec3 combedNormal;\n' +

                'mat4 rotationMatrix(vec3 axis, float angle) {\n' +
                '   axis = normalize(axis);\n' +
                '    float s = sin(angle);\n' +
                '    float c = cos(angle);\n' +
                '     float oc = 1.0 - c;\n' +

                '    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,\n' +
                '                 oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,\n' +
                '                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,\n' +
                '                0.0,                                0.0,                                0.0,                                1.0);\n' +
                ' }\n' +

                ' vec3 rotate(vec3 v, vec3 axis, float angle) {\n' +
                '     mat4 m = rotationMatrix(axis, angle);\n' +
                '     return (m * vec4(v, 1.0)).xyz;\n' +
                ' }\n' +

                '\n' +
                'void main() {\n' +
                '    combedNormal = rm_C_Normal;\r\n' +
                '    vec3 viewNormal = normalize(mat3(transpose(inverse(view_model_matrix))) * rm_Normal);\r\n' +
                '    vec3 viewVertex =  normalize((view_model_matrix * rm_Vertex).xyz);\r\n' +

                '    if(dot(-viewVertex,viewNormal)>0.6 && combAngle !=0.0){\r\n' + //If there is input movement and hair is more or less facing the camera
                '       vec4 combWorldDir3D = vec4(normalize(combViewDir3D),1.0)*inverse(view_model_matrix);\r\n' +
                '       float currentAngle = dot(rm_C_Normal,rm_Normal);\r\n' +
                '       float newAngle;\r\n' +

                '       vec3 auxCombedNormal = rotate(normalize(rm_C_Normal),combWorldDir3D.xyz,combAngle);\r\n' +
                '       if(currentAngle<0.5) {\r\n' + //If angle is higher than 45, stop rotating unless is to the opposite side
                '           newAngle = dot(auxCombedNormal,rm_Normal);\r\n' +
                '           if(newAngle<currentAngle) return;\r\n' +
                '       } \r\n' +

                '      combedNormal = auxCombedNormal;\r\n' +
                '       }\r\n' +

                '}';

            this.fragmentShaderCode = '#version 300 es\r\n' +
                'precision mediump float;\n' +
                'void main() {\n' +
                '}\n'



        }

        fillUniformsAttributes() {
            this.view_model_matrix = this.getUniform('view_model_matrix');
            this.mousePos = this.getUniform('mousePos');
            this.mouseRadio = this.getUniform('mouseRadio');
            this.combViewDir3D = this.getUniform('combViewDir3D');
            this.combAngle = this.getUniform('combAngle');


            this.rm_Vertex = this.getAttrib('rm_Vertex');
            this.rm_Normal = this.getAttrib('rm_Normal');
            this.rm_Tangent = this.getAttrib('rm_Tangent');

            this.rm_C_Normal = this.getAttrib('rm_C_Normal');


        }
    }

    return ComputeShellNormalShader;
});