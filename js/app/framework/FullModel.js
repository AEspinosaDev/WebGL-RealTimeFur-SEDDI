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

            function precomputeFinGeometry(indices, vertices, normals) {
                var indexList = [].concat.apply([], indices);
                var finIndices = new Array();
                var finVertices = new Array();
                // var finUVS = new Array();
                // var finNormals = new Array();
                var newIndex = 0;
                var vertIndex = 0;
                //Ir indice por indice de dos en dos creando a su vez otros dos puntos
                for (let i = 0; i < indexList.length; i++) {
                    finIndices.push(newIndex); finIndices.push(newIndex + 1); finIndices.push(newIndex + 2); finIndices.push(newIndex); finIndices.push(newIndex + 2); finIndices.push(newIndex + 3);
                    for (let c = 0; c < 4; c++) {
                        if (c < 2) {
                            //verticesPos
                            for (let j = 0; j < 3; j++) {
                                finVertices.push(vertices[vertIndex + j]);
                            }
                            vertIndex += 3;
                        } else {
                            //extrudedPos
                            vertIndex -= 3;

                            var pos = MatrixUtils.vec3.create();
                            var normal = MatrixUtils.vec3.create();
                            var extrude = MatrixUtils.vec3.create();
                            var newPos = MatrixUtils.vec3.create();
                            MatrixUtils.vec3.set(pos, vertices[vertIndex], pos[1] = vertices[vertIndex + 1], pos[2] = vertices[vertIndex + 2]);
                            MatrixUtils.vec3.set(extrude, 8.0, 8.0, 8.0);
                            MatrixUtils.vec3.set(normal, normals[vertIndex], normal[1] = normals[vertIndex + 1], normal[2] = normals[vertIndex + 2]);
                            //pos[0]=vertices[vertIndex];pos[1]=vertices[vertIndex+1];pos[2]=vertices[vertIndex+2];
                            // normal[0]=normals[vertIndex];normal[1]=normals[vertIndex+1];normal[2]=normals[vertIndex+2];
                            MatrixUtils.vec3.add(newPos, pos, MatrixUtils.vec3.multiply(normal, normal, extrude));
                            for (let j = 0; j < 3; j++) {
                                finVertices.push(newPos[j]);
                            }

                        }

                    }
                    newIndex += 4;
                    vertIndex += 6;

                }

                //BIND FIN BUFFERS
                root.finBufferIdices = gl.createBuffer();
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, root.finBufferIdices);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexList), gl.STATIC_DRAW);
                root.numFinIndices = indexList.length;

                root.finBufferPos = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, root.finBufferPos);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(finVertices), gl.STATIC_DRAW);
                console.log(finVertices);
                // root.UVs = gl.createBuffer();
                // gl.bindBuffer(gl.ARRAY_BUFFER, root.UVs);
                // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.meshes[0].texturecoords[0]), gl.STATIC_DRAW);
                // root.bufferNormals = gl.createBuffer();
                // gl.bindBuffer(gl.ARRAY_BUFFER, root.bufferNormals);
                // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.meshes[0].normals), gl.STATIC_DRAW);
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
                    precomputeFinGeometry(data.meshes[0].faces, data.meshes[0].vertices, data.meshes[0].normals);


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

            // gl.bindBuffer(gl.ARRAY_BUFFER, this.UVs);
            // gl.enableVertexAttribArray(shader.rm_TexCoord0);
            // gl.vertexAttribPointer(shader.rm_TexCoord0, 2, gl.FLOAT, false, 2 * Float32Array.BYTES_PER_ELEMENT, 0);

           

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
