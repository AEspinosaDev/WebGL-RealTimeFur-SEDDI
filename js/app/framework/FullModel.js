'use strict';

define(['./BinaryDataLoader','./JsonDataLoader'], function(BinaryDataLoader,JsonDataLoader) {

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
        load: function(url, callback) {
            var root = this;

            function loadBuffer(buffer, target, arrayBuffer) {
                var byteArray = new Uint8Array(arrayBuffer, 0, arrayBuffer.byteLength);
                gl.bindBuffer(target, buffer);
                gl.bufferData(target, byteArray, gl.STATIC_DRAW);
            }

            BinaryDataLoader.load(url + '-indices.bin',
                function(data) {
                    root.bufferIndices = gl.createBuffer();
                    console.log('Loaded ' + url + '-indices.bin: ' + data.byteLength + ' bytes');
                    loadBuffer(root.bufferIndices, gl.ELEMENT_ARRAY_BUFFER, data);
                    root.numIndices = data.byteLength / 2 / 3;
                    root.bufferIndices && root.bufferStrides && callback();
                }
            );
            BinaryDataLoader.load(url + '-strides.bin',
                function(data) {
                    root.bufferStrides = gl.createBuffer();
                    console.log('Loaded ' + url + '-strides.bin: ' + data.byteLength + ' bytes');
                    loadBuffer(root.bufferStrides, gl.ARRAY_BUFFER, data);
                    root.bufferIndices && root.bufferStrides && callback();
                }
            );
        },

        loadJson: function(url, callback) {
            var root = this;

           

            JsonDataLoader.load(url,
                function(data) {
                    root.bufferIndices = gl.createBuffer();
                    console.log('Loaded ' + url + 'JSON');
                    
                    var indexList = [].concat.apply([], data.meshes[0].faces);
                    console.log(indexList);
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,root.bufferIndices);
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexList), gl.STATIC_DRAW);
                    root.numIndices = indexList.length;
                    root.bufferIndices && root.bufferStrides && callback();
                  
                }
                
            );
            JsonDataLoader.load(url,
            function(data) {
                root.bufferStrides = gl.createBuffer();
                // loadBufferJ(root.bufferStrides, gl.ARRAY_BUFFER, data.meshes[0].vertices);
                gl.bindBuffer(gl.ARRAY_BUFFER,root.bufferStrides);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.meshes[0].vertices), gl.STATIC_DRAW);
                root.bufferIndices && root.bufferStrides && callback();
            }
        );
            
        },

        /**
         * Binds buffers for glDrawElements() call
         */
        bindBuffers: function() {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferStrides);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufferIndices);
        },

        /**
         * Returns number of inices in model
         * @return {number} - number of indices
         */
        getNumIndices: function() {
            return this.numIndices;
        }
    }

    return FullModel;
});
