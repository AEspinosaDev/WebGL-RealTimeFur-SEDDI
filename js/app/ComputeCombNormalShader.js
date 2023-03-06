'use strict';

define(['framework/BaseShader'], function (BaseShader) {

    /**
     * Simple diffuse texture shader.
     * @class
     */
    class ComputeCombNormalShader extends BaseShader {
        fillCode() {
            this.vertexShaderCode = '#version 300 es\r\n' +
                'uniform mat4 view_proj_matrix;\n' +
                'in vec4 rm_Vertex;\n' +
                'in vec3 rm_Normal;\n' +
                'in vec3 rm_C_Normal;\n' +

                'uniform mat4 view_model_matrix;\r\n' +
                'uniform vec3 combNDCdir;\n' +
                'uniform float combAngle;\n' +
                'uniform vec3 mouseNDCPos;\n' +
                'uniform float mouseNDCRadio;\n' +

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

                //Vertex pos to NDC coord to match mouse coordinates
                '    vec4 vertexNDCpos = view_proj_matrix*vec4(rm_Vertex.xyz,1.0);\r\n' +
                '    vertexNDCpos /= vertexNDCpos.w;\r\n' +
                '    float distanceToVertex = distance(mouseNDCPos.xy,vertexNDCpos.xy);\r\n' +
                
                
                //If inside brush area
                '    if(distanceToVertex<=mouseNDCRadio){\r\n' +
                
                '    combedNormal = rm_C_Normal;\r\n' +
                '    vec3 viewNormal = normalize(mat3(transpose(inverse(view_model_matrix))) * rm_Normal);\r\n' +
                '    vec3 viewVertex =  normalize((view_model_matrix * rm_Vertex).xyz);\r\n' +
                '    float normalViewAngle =  dot(-viewVertex,viewNormal);\r\n' +
                
                
                '    if(normalViewAngle>0.6 && combAngle !=0.0){\r\n' + //If there is input movement and hair is more or less facing the camera
                
                // '       vec4 combWorldDir3D = inverse(view_proj_matrix)*vec4(normalize(combNDCdir.xyz),1.0);\r\n' +
                '       vec3 combWorldDir3D =  normalize(mat3(transpose(view_model_matrix))*normalize(combNDCdir));\r\n' +
                // '       combWorldDir3D.xyz /= combWorldDir3D.w;\r\n' +
                
                '       float currentAngle = dot(rm_C_Normal,rm_Normal);\r\n' +
                '       float newAngle;\r\n' +

                //Attenuation calculations
                '       float distanceToBorder = mouseNDCRadio-distanceToVertex;\r\n' +
                '       float att;\r\n' +
                '       float brushEdge = mouseNDCRadio*0.25;\r\n' +
                '       distanceToBorder<=brushEdge ? att= distanceToBorder/brushEdge : att=1.0;\r\n' +
                '       float normalAtt;\r\n' +
                '       normalViewAngle<0.9 ? normalAtt= (normalViewAngle-0.6)/0.3 : normalAtt=1.0;\r\n' +
                //
                
                '       vec3 auxCombedNormal = rotate(normalize(rm_C_Normal),cross(combWorldDir3D,rm_Normal),combAngle*att*normalAtt);\r\n' +
                
                '       if(currentAngle<0.5) {\r\n' + //If angle is higher than 45, stop rotating unless is to the opposite side
                '           newAngle = dot(auxCombedNormal,rm_Normal);\r\n' +
                '           if(newAngle<currentAngle) return;\r\n' +
                '       } \r\n' +
                
                '      combedNormal = auxCombedNormal;\r\n' +
                '       }\r\n' +
                
                '    }else {combedNormal = rm_C_Normal;}\r\n' +
                
                '}';

            //Rasterization should be disabled
            this.fragmentShaderCode = '#version 300 es\r\n' +
                'precision mediump float;\n' +
                'void main() {\n' +
                '}\n'



        }

        fillUniformsAttributes() {
            this.view_model_matrix = this.getUniform('view_model_matrix');
            this.view_proj_matrix = this.getUniform('view_proj_matrix');
            this.mousePos = this.getUniform('mouseNDCPos');
            this.mouseRadio = this.getUniform('mouseNDCRadio');
            this.combNDCdir = this.getUniform('combNDCdir');
            this.combAngle = this.getUniform('combAngle');


            this.rm_Vertex = this.getAttrib('rm_Vertex');
            this.rm_Normal = this.getAttrib('rm_Normal');

            this.rm_C_Normal = this.getAttrib('rm_C_Normal');


        }
    }

    return ComputeCombNormalShader;
});