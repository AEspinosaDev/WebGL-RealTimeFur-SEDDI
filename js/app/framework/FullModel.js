'use strict';

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

            function precomputeFinGeometry(indices, vertices, normals,tangents) {
                var indexList = [].concat.apply([], indices);
                var finIndices = new Array();
                var finVertices = new Array();
                var finExtrudables = new Array();
                var finNormals = new Array();
                var finTangents = new Array();
                var newIndex = 0;
                //Ir indice por indice de dos en dos creando a su vez otros dos puntos
                for (let i = 0; i < indexList.length; i++) {
                    finIndices.push(newIndex);
                    finIndices.push(newIndex + 1);
                    finIndices.push(newIndex + 2);
                    finIndices.push(newIndex);
                    finIndices.push(newIndex + 2);
                    finIndices.push(newIndex + 3);

                    newIndex += 4;

                }
                for (let f = 0; f < (vertices.length / 3) / 4; f++) {
                    var duplas = new Array();
                    var offset = f*12;
                    duplas.push([0, 1]);
                    duplas.push([1, 2]);
                    duplas.push([2, 3]);
                    duplas.push([3, 0]);
                    duplas.push([3, 1]);
                    duplas.push([2, 0]);

                    for (let i = 0; i < duplas.length; i++) {
                        //verticesPos
                        for (let j = 0; j < 3; j++) {
                            finVertices.push(vertices[duplas[i][0] * 3+offset + j]);
                            finNormals.push(normals[duplas[i][0] * 3+offset + j]);
                            finTangents.push(tangents[duplas[i][0] * 3+offset + j]);
                        }
                        finExtrudables.push(0);
                        for (let j = 0; j < 3; j++) {
                            finVertices.push(vertices[duplas[i][1] * 3+offset + j]);
                            finNormals.push(normals[duplas[i][1] * 3+offset + j]);
                            finTangents.push(tangents[duplas[i][1] * 3+offset + j]);
                        }
                        finExtrudables.push(0);
                        for (let j = 0; j < 3; j++) {
                            finVertices.push(vertices[duplas[i][1] * 3+offset + j]);
                            finNormals.push(normals[duplas[i][1] * 3+offset + j]);
                            finTangents.push(tangents[duplas[i][1] * 3+offset + j]);
                        }
                        finExtrudables.push(1);
                        for (let j = 0; j < 3; j++) {
                            finVertices.push(vertices[duplas[i][0] * 3+offset + j]);
                            finNormals.push(normals[duplas[i][0] * 3+offset + j]);
                            finTangents.push(tangents[duplas[i][0] * 3+offset + j]);
                        }
                        finExtrudables.push(1);
                        // //extrudedPos
                        // var pos = MatrixUtils.vec3.create();
                        // var normal = MatrixUtils.vec3.create();
                        // var extrude = MatrixUtils.vec3.create();
                        // var newPos = MatrixUtils.vec3.create();
                        // MatrixUtils.vec3.set(extrude, 4.0, 4.0, 4.0);
                        // MatrixUtils.vec3.set(pos, vertices[duplas[i][1] * 3+offset], vertices[duplas[i][1] * 3 + 1+offset], vertices[duplas[i][1] * 3 + 2+offset]);
                        // MatrixUtils.vec3.set(normal, normals[duplas[i][1] * 3+offset], normals[duplas[i][1] * 3 + 1+offset], normals[duplas[i][1] * 3 + 2+offset]);
                        // MatrixUtils.vec3.add(newPos, pos, MatrixUtils.vec3.multiply(normal, normal, extrude));
                        // for (let j = 0; j < 3; j++) {
                        //     finVertices.push(newPos[j]);
                        // }
                        // MatrixUtils.vec3.set(pos, vertices[duplas[i][0] * 3+offset], vertices[duplas[i][0] * 3 + 1+offset], vertices[duplas[i][0] * 3 + 2+offset]);
                        // MatrixUtils.vec3.set(normal, normals[duplas[i][0] * 3+offset], normals[duplas[i][0] * 3 + 1+offset], normals[duplas[i][0] * 3 + 2+offset]);
                        // MatrixUtils.vec3.add(newPos, pos, MatrixUtils.vec3.multiply(normal, normal, extrude));
                        // for (let j = 0; j < 3; j++) {
                        //     finVertices.push(newPos[j]);
                        // }


                    }

                    //posIndex = (posIndex + 3) % vertices.length;
                }

                console.log(finIndices);

                //BIND FIN BUFFERS
                root.finBufferIdices = gl.createBuffer();
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, root.finBufferIdices);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(finIndices), gl.STATIC_DRAW);
                root.numFinIndices = finIndices.length;

                root.finBufferPos = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, root.finBufferPos);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(finVertices), gl.STATIC_DRAW);
                console.log(finVertices);
                
                root.finBufferNormals = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, root.finBufferNormals);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(finNormals), gl.STATIC_DRAW);

                root.finBufferTangents = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, root.finBufferTangents);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(finTangents), gl.STATIC_DRAW);
                
                
                console.log(finNormals);
                root.finExtrudableBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, root.finExtrudableBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(finExtrudables), gl.STATIC_DRAW);
            }

            JsonDataLoader.load(url,
                function (data) {
                    root.bufferIndices = gl.createBuffer();
                    console.log('Loaded ' + url + 'JSON');

                    var indexList = [].concat.apply([], data.meshes[0].faces);
                    console.log(indexList);
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
                    console.log(data.meshes[0].vertices);
                    root.UVs = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, root.UVs);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.meshes[0].texturecoords[0]), gl.STATIC_DRAW);
                    root.bufferNormals = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, root.bufferNormals);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.meshes[0].normals), gl.STATIC_DRAW);

                    //Precompute fins ->
                    precomputeFinGeometry(data.meshes[0].faces, data.meshes[0].vertices, data.meshes[0].normals,data.meshes[0].tangents);


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

            gl.bindBuffer(gl.ARRAY_BUFFER, this.finExtrudableBuffer);
            gl.enableVertexAttribArray(shader.rm_Extrudable);
            gl.vertexAttribPointer(shader.rm_Extrudable, 1, gl.FLOAT, false,Float32Array.BYTES_PER_ELEMENT, 0);


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
