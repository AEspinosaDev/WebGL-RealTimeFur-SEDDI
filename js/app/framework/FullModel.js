'use strict';

class Edge {
    constructor(a, b, o) {
        if (a < b) {
            this.a_ID = a;
            this.b_ID = b;

        }
        else {
            this.b_ID = a;
            this.a_ID = b;
        }
        this.o_ID = o;

        this.hash = this.getHashCode();
    }
    getHashCode() {
        var pts = new Array();
        pts.push(this.a_ID); pts.push(this.b_ID);
        pts = pts.sort((a, b) => { return a - b; });
        // var hcode = ((pts[0] + pts[1]) * (pts[0] + pts[1] + 1)) / 2 + pts[1]; // Cantor pairing
        var hcode = (pts[0] >= pts[1] ? (pts[0] * pts[0]) + pts[0] + pts[1] : (pts[1] * pts[1]) + pts[0]); // Szudzik pairing
        // console.log("hash=" + hcode);
        return hcode;

    }


}
class Vertex {
    constructor(id, pos, normal,tangent) {
        this.ID = id;
        this.pos = pos;
        this.normal = normal;
        this.tangent = tangent;
    }
}

define(['./BinaryDataLoader', './JsonDataLoader', 'framework/utils/MatrixUtils'], function (BinaryDataLoader, JsonDataLoader, MatrixUtils) {

    /**
     * Class to represent mesh data
     * @class
     */
    function FullModel() {
        this.bufferIndices = null;
        this.bufferStrides = null;
        this.numIndices = 0;
    }

    FullModel.prototype = {

        /**
         * Loads binary data for mesh
         * @param  {string} url - URL for mesh files without trailing "-*.bin"
         * @param  {Function} callback when data is loaded
         */
        load: function (url, callback) {
            var root = this;

            function loadBuffer(buffer, target, arrayBuffer) {
                var byteArray = new Uint8Array(arrayBuffer, 0, arrayBuffer.byteLength);
                gl.bindBuffer(target, buffer);
                gl.bufferData(target, byteArray, gl.STATIC_DRAW);
            }

            BinaryDataLoader.load(url + '-indices.bin',
                function (data) {
                    root.bufferIndices = gl.createBuffer();
                    console.log('Loaded ' + url + '-indices.bin: ' + data.byteLength + ' bytes');
                    loadBuffer(root.bufferIndices, gl.ELEMENT_ARRAY_BUFFER, data);
                    root.numIndices = data.byteLength / 2 / 3;
                    root.bufferIndices && root.bufferStrides && callback();
                }
            );
            BinaryDataLoader.load(url + '-strides.bin',
                function (data) {
                    root.bufferStrides = gl.createBuffer();
                    console.log('Loaded ' + url + '-strides.bin: ' + data.byteLength + ' bytes');
                    loadBuffer(root.bufferStrides, gl.ARRAY_BUFFER, data);
                    root.bufferIndices && root.bufferStrides && callback();
                }
            );
        },

        loadJson: function (url, callback) {
            var root = this;

            function precomputeFinGeometry(indices, vertices, normals, tangents) {
                var indexList = [].concat.apply([], indices);
                var finIndices = new Array();
                var finVertices = new Array();
                var finExtrudables = new Array();
                var finNormals = new Array();
                var finTangents = new Array();
                var finUVs = new Array();
                var newIndex = 0;


                ////// NEW STUFF ///////////////////
                var auxVertices = new Array();
                var auxEdges = new Array();
                var edgeMap = new Map();

                var edgeMaxLength = 0;

                for (let i = 0; i < vertices.length; i += 3) {
                    auxVertices.push(new Vertex(i, [vertices[i], vertices[i + 1], vertices[i + 2]], [normals[i], normals[i + 1], normals[i + 2]],[tangents[i], tangents[i + 1], tangents[i + 2]]))
                }

                for (let i = 0; i < indexList.length; i += 3) {
                    var edges = new Array();
                    edges.push(new Edge(indexList[i], indexList[i + 1], indexList[i + 2]));
                    edges.push(new Edge(indexList[i + 1], indexList[i + 2], indexList[i]));
                    edges.push(new Edge(indexList[i], indexList[i + 2], indexList[i + 1]));
                    edges.forEach(edge => {
                        if (!edgeMap.has(edge.hash)) {
                            //La arista no está en el diccionario
                            auxEdges.push(edge);

                            var vector = [auxVertices[edge.a_ID].pos[0]-auxVertices[edge.b_ID].pos[0],
                            auxVertices[edge.a_ID].pos[1]-auxVertices[edge.b_ID].pos[1],
                            auxVertices[edge.a_ID].pos[2]-auxVertices[edge.b_ID].pos[2]];

                            edge.length = Math.pow(vector[0],2)+ Math.pow(vector[1],2)+ Math.pow(vector[2],2);
                            if(edge.length>edgeMaxLength){edgeMaxLength=edge.length};

                            edgeMap.set(edge.hash, edge);
                        }
                        
                    });
                }
                // console.log(edgeMaxLength);
                // console.log(auxEdges);
                for (let i = 0; i < auxEdges.length; i++) {
                    //Aqui se crean los fins. Empezamos a meter en el array de fins indices indices nuevos
                    finIndices.push(newIndex);
                    finIndices.push(newIndex + 1);
                    finIndices.push(newIndex + 2);
                    finIndices.push(newIndex);
                    finIndices.push(newIndex + 2);
                    finIndices.push(newIndex + 3);
                    newIndex += 4;
                    //uv RANDOM offset
                    // var length = (auxEdges[i].length*1)/edgeMaxLength;
                    var length = 0.15;
                    var offset = Math.floor(Math.random() * (0.85 - 0.0 + 1) + 0.0);
                    //LAS UVS DE LOS FINS DEBERÍAN ESCALAS CON LOS EDGES LENGTH////////////////////////


                    //Se duplican los vertices de cada edge para asin crear mas geometría
                    for (let j = 0; j < 3; j++) {
                        finVertices.push(auxVertices[auxEdges[i].a_ID].pos[j]);
                        finNormals.push(auxVertices[auxEdges[i].a_ID].normal[j]);
                        finTangents.push(auxVertices[auxEdges[i].a_ID].tangent[j]);
                        
                    }
                    finUVs.push(-offset);
                    finUVs.push(-0.5);
                    finExtrudables.push(0);
                    for (let j = 0; j < 3; j++) {
                        finVertices.push(auxVertices[auxEdges[i].b_ID].pos[j]);
                        finNormals.push(auxVertices[auxEdges[i].b_ID].normal[j]);
                        finTangents.push(auxVertices[auxEdges[i].b_ID].tangent[j]);
                    }
                    finUVs.push(-offset-length);
                    finUVs.push(-0.5);
                    finExtrudables.push(0);
                    for (let j = 0; j < 3; j++) {
                        finVertices.push(auxVertices[auxEdges[i].b_ID].pos[j]);
                        finNormals.push(auxVertices[auxEdges[i].b_ID].normal[j]);
                        finTangents.push(auxVertices[auxEdges[i].b_ID].tangent[j]);
                    }
                    finUVs.push(-offset-length);
                    finUVs.push(-0.55);
                    finExtrudables.push(1);
                    for (let j = 0; j < 3; j++) {
                        finVertices.push(auxVertices[auxEdges[i].a_ID].pos[j]);
                        finNormals.push(auxVertices[auxEdges[i].a_ID].normal[j]);
                        finTangents.push(auxVertices[auxEdges[i].a_ID].tangent[j]);
                    }
                    finUVs.push(-offset);
                    finUVs.push(-0.55);
                    finExtrudables.push(1);

                }

               
                // console.log(finIndices);

                //BIND FIN BUFFERS
                root.finBufferIdices = gl.createBuffer();
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, root.finBufferIdices);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(finIndices), gl.STATIC_DRAW);
                root.numFinIndices = finIndices.length;

                root.finBufferPos = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, root.finBufferPos);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(finVertices), gl.STATIC_DRAW);
                // console.log(finVertices);

                root.finBufferNormals = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, root.finBufferNormals);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(finNormals), gl.STATIC_DRAW);

                root.finBufferTangents = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, root.finBufferTangents);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(finTangents), gl.STATIC_DRAW);

                root.finUVs = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, root.finUVs);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(finUVs), gl.STATIC_DRAW);


                // console.log(finNormals);
                root.finExtrudableBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, root.finExtrudableBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(finExtrudables), gl.STATIC_DRAW);
            }

            JsonDataLoader.load(url,
                function (data) {
                    root.bufferIndices = gl.createBuffer();
                    console.log('Loaded ' + url + 'JSON');

                    var indexList = [].concat.apply([], data.meshes[0].faces);
                    // console.log(indexList);
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, root.bufferIndices);
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexList), gl.STATIC_DRAW);
                    root.numIndices = indexList.length;
                    root.bufferIndices && root.bufferStrides && callback();

                }

            );
            JsonDataLoader.load(url,
                function (data) {
                    root.bufferStrides = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, root.bufferStrides);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.meshes[0].vertices), gl.STATIC_DRAW);
                    // console.log(data.meshes[0].vertices);
                    root.UVs = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, root.UVs);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.meshes[0].texturecoords[0]), gl.STATIC_DRAW);
                    root.bufferNormals = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, root.bufferNormals);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.meshes[0].normals), gl.STATIC_DRAW);

                    root.bufferTangents = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, root.bufferTangents);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.meshes[0].tangents), gl.STATIC_DRAW);
                    //Precompute fins ->
                    precomputeFinGeometry(data.meshes[0].faces, data.meshes[0].vertices, data.meshes[0].normals, data.meshes[0].tangents);


                    root.bufferIndices && root.bufferStrides && callback();
                }
            );

        },


        /**
         * Binds buffers for glDrawElements() call
         */
        bindBuffers: function () {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferStrides);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufferIndices);
        },

        bindBuffersExtended: function (shader) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufferIndices);
            
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferStrides);
            gl.enableVertexAttribArray(shader.rm_Vertex);
            gl.vertexAttribPointer(shader.rm_Vertex, 3, gl.FLOAT, false, 3 * Float32Array.BYTES_PER_ELEMENT, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.UVs);
            gl.enableVertexAttribArray(shader.rm_TexCoord0);
            gl.vertexAttribPointer(shader.rm_TexCoord0, 2, gl.FLOAT, false, 2 * Float32Array.BYTES_PER_ELEMENT, 0);

            if (shader.rm_Normal != -1) {
                gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferNormals);
                gl.enableVertexAttribArray(shader.rm_Normal);
                gl.vertexAttribPointer(shader.rm_Normal, 3, gl.FLOAT, false, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
            }
           
                gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferTangents);
                gl.enableVertexAttribArray(shader.rm_Tangent);
                gl.vertexAttribPointer(shader.rm_Tangent, 3, gl.FLOAT, false, 3 * Float32Array.BYTES_PER_ELEMENT, 0);

        },
        bindFinsBuffersExtended: function (shader) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.finBufferIdices);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.finBufferPos);
            gl.enableVertexAttribArray(shader.rm_Vertex);
            gl.vertexAttribPointer(shader.rm_Vertex, 3, gl.FLOAT, false, 3 * Float32Array.BYTES_PER_ELEMENT, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.finBufferNormals);
            gl.enableVertexAttribArray(shader.rm_Normal);
            gl.vertexAttribPointer(shader.rm_Normal, 3, gl.FLOAT, false, 3 * Float32Array.BYTES_PER_ELEMENT, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.finBufferTangents);
            gl.enableVertexAttribArray(shader.rm_Tangent);
            gl.vertexAttribPointer(shader.rm_Tangent, 3, gl.FLOAT, false, 3 * Float32Array.BYTES_PER_ELEMENT, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.finUVs);
            gl.enableVertexAttribArray(shader.rm_TexCoord0);
            gl.vertexAttribPointer(shader.rm_TexCoord0, 2, gl.FLOAT, false, 2 * Float32Array.BYTES_PER_ELEMENT, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.finExtrudableBuffer);
            gl.enableVertexAttribArray(shader.rm_Extrudable);
            gl.vertexAttribPointer(shader.rm_Extrudable, 1, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT, 0);


        },

        /**
         * Returns number of inices in model
         * @return {number} - number of indices
         */
        getNumIndices: function () {
            return this.numIndices;
        }
    }

    return FullModel;
});
