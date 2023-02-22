'use strict';

define(['framework/BaseShader'], function (BaseShader) {

    class ShellShader extends BaseShader {
        fillCode() {
            this.vertexShaderCode = '#version 300 es\r\n' +
                'precision highp float;\r\n' +
                'uniform mat4 view_proj_matrix;\r\n' +
                'uniform mat4 view_model_matrix;\r\n' +
                'uniform mat4 view_matrix;\r\n' +
                'uniform float shellOffset;\r\n' +
                'uniform float layersCount;\r\n' +
                'uniform vec4 colorStart;\r\n' +
                'uniform vec4 colorEnd;\r\n' +
                'uniform float time;\r\n' +
                'uniform float waveScale;\r\n' +
                'uniform float stiffness;\r\n' +
                'uniform vec3 lightPos;\n' +
                '\r\n' +

                'in vec4 rm_Vertex;\r\n' +
                'in vec2 rm_TexCoord0;\r\n' +
                'in vec3 rm_Normal;\r\n' +
                '\r\n' +

                'out vec2 vTexCoord0;\r\n' +
                'out vec4 vAO;\r\n' +
                'out float curlynessCoeff;\r\n' +
                'out vec3 finNormal;\n' +
                'out vec3 vPos;\n' +
                'out vec3 lightViewPos;\n' +
                '\r\n' +
             

                '\r\n' +
                'void main( void )\r\n' +
                '{\r\n' +
                '    float f = float(gl_InstanceID+1) * shellOffset;\r\n' +
                '    float layerCoeff = float(gl_InstanceID) / layersCount;\r\n' +
                '    vec4 vertex = rm_Vertex + vec4(rm_Normal, 0.0) * vec4(f, f, f, 0.0);\r\n' +
              
                '\r\n' +
                '    gl_Position = view_proj_matrix * vertex;\r\n' +
                '    vTexCoord0 = vec2(rm_TexCoord0);\r\n' +
                '    vAO = mix(colorStart, colorEnd, layerCoeff);\r\n' +
                '    curlynessCoeff = mix(0.0, 1.0, layerCoeff);\r\n' +
                '  vec3 n = mat3(transpose(inverse(view_model_matrix))) * rm_Normal;\n' +
                '  lightViewPos = (view_matrix * vec4(lightPos,1.0)).xyz;\n' +
                '  finNormal = n;\n' +
                '  vPos =  (view_model_matrix * vertex).xyz;\n' +
                '}'
              

            this.fragmentShaderCode = '#version 300 es\r\n' +
                'precision highp float;\r\n' +

                'uniform sampler2D diffuseMap;\r\n' +
                'uniform sampler2D alphaMap;\r\n' +
                'uniform vec3 lightColor;\n' +
                'uniform float intensity;\n' +
                'uniform float curlyDegree;\n' +


                'in vec2 vTexCoord0;\r\n' +
                'in vec4 vAO;\r\n' +
                'in vec3 finNormal;\n' +
                'in vec3 vPos;\n' +
                'in vec3 lightViewPos;\n' +
                'in float curlynessCoeff;\r\n' +

                'out vec4 fragColor;\r\n' +

                //Powers
                '  uniform float Sa;\n' +
                '  uniform float Pd;\n' +
                '  uniform float Ps;\n' +
                //Texture colors
                '  vec3 Ka;\n' +
                '  vec3 Kd;\n' +
                '  float Ks;\n' +
                '  float shininess = 8.0;\n' + //this should be a shininess texture
                
                '  float tx = 0.6;\n' +
                '  float ty = 0.1812;\n' +

                'vec2 sineWave(vec2 uv0);\n' +
                'vec2 rotateUV(vec2 uv, float rotation);\n' +
                'vec4 computePointLight();\n' +
                'vec4 computeHairLighting();\n' +
                '\r\n' +
                'void main()\r\n' +
                '{\r\n' +
                '   vec2 outTextCoord = rotateUV(vTexCoord0,curlyDegree*curlynessCoeff);\n' +
                '   Ka = texture(diffuseMap, outTextCoord).rgb;\r\n' +
                '   Kd = Ka;' +
                '   Ks = 0.1;\r\n' +
                '   float alphaColor = texture(alphaMap, outTextCoord).r;\r\n' +
                // '   fragColor = computePointLight();\r\n' +
                '   fragColor = computeHairLighting();\r\n' +
                '   fragColor *= vAO;\r\n' +
                
                '   fragColor.a *= alphaColor;\r\n' +
                '}\n' +
                'vec4 computePointLight() {\n' +
                '  vec3 lightDir = normalize(lightViewPos-vPos);\n' +
                '  vec3 viewDir = normalize(-vPos);\n' +
                '  vec3 halfwayDir = normalize(lightDir-viewDir);\n' +

                '  vec3 n = normalize(finNormal);\n' +
                
                //Ambient
                '  vec3 ambient = Sa*Ka*lightColor;\n' +
                //Diffuse
                '  float lambertian = Ps*max(dot(n, lightDir), 0.0);\n' +
                '  vec3 diffuse =Kd*lambertian*lightColor;\n' +
                //Specular
                '  vec3 reflectDir = reflect(-lightDir,n);\n' +
                '  float spec = Ks*Ps * pow(max(dot(n, halfwayDir), 0.0), shininess);\n' +
                '  vec3 specular = spec*lightColor;\n' +
                //Result
                '  return vec4((ambient+diffuse+specular),1.0)*intensity;\n' +
                '}\n'+ 
                
                
                //Kayijas method
                'vec4 computeHairLighting() {\n' +
                '  vec3 L = normalize(lightViewPos-vPos);\n' + //LightDir
                '  vec3 V = normalize(-vPos);\n' + //ViewDir
                '  vec3 H = normalize(L-V);\n' + //Halfway
                '  vec3 N = normalize(finNormal);\n' + //Normal
                '  vec3 T = N;\n' + //Hair direction :C
                
                '  float u =dot(T,L);\n' + //Lambertian
                '  float v =dot(T,H);\n' + //Spec
                
                '  vec3 color = Sa*Ka+Kd*pow(1.0-pow(u,2.0),Pd*0.5)+Kd*pow(1.0-pow(v,2.0),Ps*0.5);\n' + 
                
                '  return vec4(color,1.0)*intensity;\n' +
                '}\n'+ 
                ' vec2 sineWave(vec2 uv0) {\n' +
                ' vec2 uv = uv0.xy;\n' + 
                ' uv.x += sin(uv.y*200.0)/75.0;\n' + //First param is frecuency, second one is wave length
                '  return uv;\n' + 
                '}\n'+ 
                'vec2 rotateUV(vec2 uv, float rotation) {\n' +
                ' float mid = 0.5;\n' + 
                '  return vec2(\n' + 
                ' cos(rotation) * (uv.x - mid) + sin(rotation) * (uv.y - mid) + mid,\n' + 
                '  cos(rotation) * (uv.y - mid) - sin(rotation) * (uv.x - mid) + mid\n' + 
                '  );\n' + 
                '}'

        }

        fillUniformsAttributes() {
            this.view_proj_matrix = this.getUniform('view_proj_matrix');
            this.view_matrix = this.getUniform('view_matrix');
            this.view_model_matrix = this.getUniform('view_model_matrix');
            this.rm_Vertex = this.getAttrib('rm_Vertex');
            this.rm_TexCoord0 = this.getAttrib('rm_TexCoord0');
            this.rm_Normal = this.getAttrib('rm_Normal');
            this.diffuseMap = this.getUniform('diffuseMap');
            this.alphaMap = this.getUniform('alphaMap');
            this.shellOffset = this.getUniform('shellOffset');
            this.layersCount = this.getUniform('layersCount');
            this.colorStart = this.getUniform('colorStart');
            this.colorEnd = this.getUniform('colorEnd');
            this.time = this.getUniform('time');
            this.waveScale = this.getUniform('waveScale');
            this.stiffness = this.getUniform('stiffness');
            this.lightPos = this.getUniform('lightPos');
            this.lightColor = this.getUniform('lightColor');
            this.lightIntensity = this.getUniform('intensity');
            this.ambientStrength = this.getUniform('Sa');
            this.diffusePower = this.getUniform('Pd');
            this.specularPower = this.getUniform('Ps');
            this.curlyDegree = this.getUniform('curlyDegree');

        }
    }

    return ShellShader;
});
