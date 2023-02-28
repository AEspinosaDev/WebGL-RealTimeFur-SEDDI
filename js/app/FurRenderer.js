'use strict';

define([
    'framework/BaseRenderer',
    'jquery',
    'ShellShader',
    'ShadowMapShader',
    'ComputeShellNormalShader',
    'FinShader',
    'VignetteShader',
    'DiffuseColoredShader',
    'framework/utils/MatrixUtils',
    'framework/FullModel',
    'framework/UncompressedTextureLoader',
    'framework/CompressedTextureLoader',
    'FurPresets',
    'VignetteData'
],
    function (
        BaseRenderer,
        $,
        ShellShader,
        ShadowMapShader,
        ComputeShellNormalShader,
        FinShader,
        VignetteShader,
        DiffuseColoredShader,
        MatrixUtils,
        FullModel,
        UncompressedTextureLoader,
        CompressedTextureLoader,
        FurPresets,
        VignetteData) {

        class FurRenderer extends BaseRenderer {
            constructor() {
                super();

                this.loadedItemsCount = 0; // couter of loaded OpenGL buffers+textures
                this.loaded = false; // won't draw until this is true

                this.angleYaw = 0; // camera rotation angle
                this.anglePitch = 0; // camera rotation angle
                this.lastTime = 0; // used for animating camera
                this.furTimer = 0;
                this.windTimer = 0;
                this.loadingNextFur = false;

                this.currentPreset = null;
                this.nextPreset = null;

                this.matOrtho = MatrixUtils.mat4.create();
                MatrixUtils.mat4.ortho(this.matOrtho, -1, 1, -1, 1, 2.0, 250);

                //Conditionals
                this.renderFins = true;
                this.renderShells = true;
                this.renderFur = true;
                this.finOpacity = false;

                //HairProperties not in presets
                this.curlyness = 0;
                this.curlyDegree = 0;
                this.curlyFrequency = 50;
                this.curlyAmplitude = 0.008;
                this.textureDensity = 0;

                this.CURLY_DEGREE_STEP = 0.2;
                this.CURLY_FREQ_STEP = 15;
                this.CURLY_FREQ_OFFSET = 50;
                this.CURLY_AMP_STEP = 0.0006;
                this.CURLY_AMP_OFFSET = 0.008;

                this.furColor = [0.89, 0.82, 0.65]

                //Mouse and UI events
                this.mouseMoving = false;
                this.dragging = false;
                this.combing = false;
                this.resizingComb = false;

                this.settingsToggle = false;
                this.mouseLastPosition = [-1, -1];
                this.mouseResizeLastPosition = [0, 0];
                this.dragAngles = [0, 0];
                this.rotationFactor = 10;
                this.combRadius = 50;

                this.combAngle = 0;
                this.combViewDirection2D = [0, 0];

                // this.inMousePosition =[0,0];
                // this.outMousePosition =[0,0];

                //Light
                this.lightPos = [1000.0, 1000.0, 1000.0]; //point light //z,x,y because up is the last coord
                this.lightColor = [1.0, 0.98, 0.92];
                this.lightIntensity = 1.0;
                this.shadowsEnabled = true;

                this.ambientStrength = 0.5;


                this.ITEMS_TO_LOAD = 5; // total number of OpenGL buffers+textures to load
                this.FLOAT_SIZE_BYTES = 4; // float size, used to calculate stride sizes
                this.TRIANGLE_VERTICES_DATA_STRIDE_BYTES = 5 * this.FLOAT_SIZE_BYTES;
                this.TRIANGLE_VERTICES_DATA_POS_OFFSET = 0;
                this.TRIANGLE_VERTICES_DATA_UV_OFFSET = 3;
                this.FOV_LANDSCAPE = 25.0; // FOV for landscape
                this.FOV_PORTRAIT = 40.0; // FOV for portrait
                this.YAW_COEFF_NORMAL = 12000.0; // camera rotation speed
                this.DISTANCE_TO_NEXT_CUBE = 200;

                this.FUR_ANIMATION_SPEED = 1500.0;
                this.FUR_WIND_SPEED = 8310.0;
                this.FUR_STIFFNESS = 2.75;



            }

            /**
             * Resets loaded state for renderer
             */
            resetLoaded() {
                this.loaded = false;
                this.loadedItemsCount = 0;
            }

            onAfterInit() {
                super.onAfterInit();



                if (!this.isWebGL2) {
                    this.onInitError();
                }
            }

            onBeforeInit() {
                super.onBeforeInit();

                $('#canvasGL').show();
            }

            onInitError() {
                super.onInitError();

                $('#canvasGL').hide();
                $('#alertError').show();
            }

            initShaders() {
                this.shadowMapShader = new ShadowMapShader();
                this.VignetteShader = new VignetteShader();
                this.diffuseColoredShader = new DiffuseColoredShader();
                this.shaderShell = new ShellShader();
                this.shaderFin = new FinShader();
                this.computeShader = new ComputeShellNormalShader(['combedNormal'])
            }

            /**
             * Callback for all loading function. Updates loading progress and allows rendering after loading all stuff
             */
            updateLoadedObjectsCount() {
                var percent,
                    $progress = $('#progressLoading');

                this.loadedItemsCount++; // increase loaded objects counter

                percent = Math.floor(this.loadedItemsCount * 100 / this.ITEMS_TO_LOAD) + '%';
                $progress
                    .css('width', percent)
                    .html(percent); // update loading progress

                if (this.loadedItemsCount >= this.ITEMS_TO_LOAD) {
                    this.createRenderFBO();
                    this.loaded = true; // allow rendering
                    console.log('Loaded all assets');
                    $('#row-progress').hide();
                    $('.control-icon').show();
                    this.onPresetLoaded && this.onPresetLoaded();
                }
            }

            /**
             * loads all WebGL buffers and textures. Uses updateLoadedObjectsCount() callback to indicate that data is loaded to GPU
             */
            loadData() {
                var boundUpdateCallback = this.updateLoadedObjectsCount.bind(this);

                this.modelCube = new FullModel(true);

                //this.modelCube.load('data/models/box10_rounded', boundUpdateCallback);
                //this.modelCube.loadJson('data/models/cube_bigger.json', boundUpdateCallback);
                //this.modelCube.loadJson('data/models/cube_round_borders.json', boundUpdateCallback);
                // this.modelCube.loadJson('data/models/plane.json', boundUpdateCallback);
                // this.modelCube.loadJson('data/models/bunny.json', boundUpdateCallback);
                this.modelCube.loadJson('data/models/bunnyUV.json', boundUpdateCallback);
                // this.modelCube.loadJson('data/models/cube_rounded.json', boundUpdateCallback);
                // this.modelCube.loadJson('data/models/sphere.json', boundUpdateCallback);
                // this.modelCube.loadJson('data/models/bear.json', boundUpdateCallback);

                // this.textureChecker = UncompressedTextureLoader.load('data/textures/checker.png', boundUpdateCallback);
                this.textureBackground = UncompressedTextureLoader.load('data/textures/bg-gradient.png', boundUpdateCallback);

                this.currentPreset = Object.assign({}, FurPresets.current());

                this.textureFurAlpha = UncompressedTextureLoader.load('data/textures/' + this.getCurrentPresetParameter('alphaTexture'), boundUpdateCallback);
                this.textureFurTipAlpha = UncompressedTextureLoader.load('data/textures/' + this.getCurrentPresetParameter('tipAlphaTexture'), boundUpdateCallback);
                this.textureFinAlpha = UncompressedTextureLoader.load('data/textures/' + this.getCurrentPresetParameter('finAlphaTexture'), boundUpdateCallback);


                this.vignette = new VignetteData();
                this.vignette.initGL(gl);



            }


            getCurrentPresetParameter(param) {
                return this.currentPreset[param];
            }

            getNextPresetParameter(param) {
                return this.nextPreset[param];
            }

            loadNextFurTextures(callback) {
                this.textureFinAlphaNext && gl.deleteTexture(this.textureFinAlphaNext);
                this.textureFurAlphaNext && gl.deleteTexture(this.textureFurAlphaNext);
                this.textureFurTipAlphaNext && gl.deleteTexture(this.textureFurTipAlphaNext);


                this.textureFurAlphaNext = UncompressedTextureLoader.load('data/textures/' + this.getNextPresetParameter('alphaTexture'), callback);
                this.textureFurTipAlphaNext = UncompressedTextureLoader.load('data/textures/' + this.getNextPresetParameter('tipAlphaTexture'), callback);
                this.textureFinAlphaNext = UncompressedTextureLoader.load('data/textures/' + this.getCurrentPresetParameter('finAlphaTexture'), callback);
            }
            //#region getters and setters
            get layers() {
                return this.currentPreset['layers'];
            }

            set layers(value) {
                this.currentPreset['layers'] = value;
            }

            get hairLength() {
                return this.currentPreset['hairLength'];
            }

            set hairLength(value) {
                this.currentPreset['hairLength'] = value;
            }

            get presetName() {
                return this.currentPreset['name'];
            }
            set diffusePower(value) {
                this.currentPreset['diffusePower'] = value;
            }

            get diffusePower() {
                return this.currentPreset['diffusePower'];
            }
            set specularPower(value) {
                this.currentPreset['specularPower'] = value;
            }


            get specularPower() {
                return this.currentPreset['specularPower'];
            }
            set shellTextureSize(value) {
                this.currentPreset['shellTextureSize'] = value;
            }


            get shellTextureSize() {
                return this.currentPreset['shellTextureSize'];
            }

            set finTextureSize(value) {
                this.currentPreset['finTextureSize'] = value;
            }


            get finTextureSize() {
                return this.currentPreset['finTextureSize'];
            }
            //#endregion

            loadPreset(preset) {
                var root = this,
                    counter = 0;

                this.nextPreset = preset;
                this.loadingNextFur = true;

                root.loadNextFurTextures(function () {
                    counter++;
                    if (counter == 3) {
                        root.loadingNextFur = false;
                    }
                });
            }

            chooseNextPreset() {
                this.loadPreset(FurPresets.next());
            }

            choosePreviousPreset() {
                this.loadPreset(FurPresets.previous());
            }

            /**
             * Loads either ETC1 from PKM or falls back to loading PNG
             * @param {string} url - URL to texture without extension
             */
            loadETC1WithFallback(url) {
                var boundUpdateCallback = this.updateLoadedObjectsCount.bind(this);

                if (this.isETC1Supported) {
                    return CompressedTextureLoader.loadETC1(url + '.pkm', boundUpdateCallback);
                } else {
                    return UncompressedTextureLoader.load(url + '.png', boundUpdateCallback);
                }
            }

            /**
             * Calculates camera matrix
             * @param {unmber} a - position in [0...1] range
             */
            positionCamera(pos, target, up) {
                MatrixUtils.mat4.identity(this.mVMatrix);
                MatrixUtils.mat4.lookAt(this.mVMatrix, pos, target, up);
            }

            /**
             * Calculates projection matrix
             */
            setCameraFOV(multiplier) {
                var ratio;

                if (gl.canvas.height > 0) {
                    ratio = gl.canvas.width / gl.canvas.height;
                } else {
                    ratio = 1.0;
                }

                if (gl.canvas.width >= gl.canvas.height) {
                    this.setFOV(this.mProjMatrix, this.FOV_LANDSCAPE * multiplier, ratio, 20.0, 5000.0);
                } else {
                    this.setFOV(this.mProjMatrix, this.FOV_PORTRAIT * multiplier, ratio, 20.0, 5000.0);
                }
            }

            /**
             * Issues actual draw calls
             */
            drawScene() {
                if (!this.loaded) {
                    return;
                }


                if (!this.loadingNextFur) {
                    if (this.textureFinAlphaNext && this.textureFurTipAlphaNext && this.textureFurAlphaNext) {
                        this.currentPreset = Object.assign({}, FurPresets.current());
                        this.onPresetLoaded && this.onPresetLoaded();
                        gl.deleteTexture(this.textureFurTipAlpha);
                        gl.deleteTexture(this.textureFurAlpha);
                        // gl.deleteTexture(this.textureFinAlphaNext);
                        this.textureFinAlpha = this.textureFinAlphaNext;
                        this.textureFurTipAlpha = this.textureFurTipAlphaNext;
                        this.textureFurAlpha = this.textureFurAlphaNext;
                        this.textureFinAlphaNext = null;
                        this.textureFurTipAlphaNext = null;
                        this.textureFurAlphaNext = null;
                    }
                }

                this.resizeRenderFBO();

                //Shadow mapping pass
                // if (this.shadowsEnabled) {

                //     gl.bindFramebuffer(gl.FRAMEBUFFER, this.depthFramebuffer);
                //     gl.viewport(0, 0, this.depthTextureSize, this.depthTextureSize);
                //     gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);



                //     this.positionCamera(this.lightPos, [0, 0, 0], [0, 0, 1]);
                //     this.setCameraFOV(0.6);
                //     this.shadowMapShader.use();

                //     this.drawDiffuseNormalStrideVBOTranslatedRotatedScaled(this.currentPreset, this.shadowMapShader, this.modelCube, 0, 0, 0, 0, this.dragAngles[0], this.dragAngles[1], 1, 1, 1);

                // }

                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

                //Render to texture
                gl.bindFramebuffer(gl.FRAMEBUFFER, this.renderFramebuffer);
                // gl.bindFramebuffer(gl.FRAMEBUFFER, this.renderFramebuffer);

                gl.clearColor(0.3, 0.3, 0.3, 1.0);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                gl.depthMask(false);
                this.drawVignette(this.textureBackground);
                gl.depthMask(true);

                this.positionCamera([190, 0, 270], [0, 0, 0], [0, 0, 1]);
                this.setCameraFOV(0.6);

                this.drawCubeDiffuse(this.textureFurDiffuse, this.currentPreset);

                if (this.combing && this.mouseMoving) {
                    //Compute shader for normals
                    this.computeCombedNormals(this.computeShader, this.modelCube);
                }

                gl.depthMask(false);
                gl.disable(gl.CULL_FACE);

                gl.enable(gl.BLEND);

                if (this.renderFur) {
                    this.drawFur(this.textureFurDiffuse, this.textureFurAlpha, this.currentPreset);
                }

                gl.disable(gl.BLEND);


                //Post process pass
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);

                gl.clearColor(0.3, 0.3, 0.3, 1.0);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


                //Post process only
                if (this.combing || this.resizingComb) {
                    this.VignetteShader.use();
                    gl.uniform1i(this.VignetteShader.isPostProcess, true);
                    gl.uniform1f(this.VignetteShader.mouseRadio, this.combRadius);
                    gl.uniform2f(this.VignetteShader.mousePos, this.mouseLastPosition[0], this.canvas.clientHeight - this.mouseLastPosition[1]);

                }
                this.drawVignette(this.targetTexture);

                gl.uniform1i(this.VignetteShader.isPostProcess, false);

            }

            drawVignette(texture) {
                this.VignetteShader.use();

                this.setTexture2D(0, texture, this.VignetteShader.sTexture);

                gl.bindBuffer(gl.ARRAY_BUFFER, this.vignette.buffer);

                gl.vertexAttribPointer(this.VignetteShader.rm_Vertex, 3, gl.FLOAT, false, this.TRIANGLE_VERTICES_DATA_STRIDE_BYTES, this.TRIANGLE_VERTICES_DATA_POS_OFFSET * this.FLOAT_SIZE_BYTES);
                gl.enableVertexAttribArray(this.VignetteShader.rm_Vertex);

                gl.vertexAttribPointer(this.VignetteShader.rm_TexCoord0, 2, gl.FLOAT, false, this.TRIANGLE_VERTICES_DATA_STRIDE_BYTES, this.TRIANGLE_VERTICES_DATA_UV_OFFSET * this.FLOAT_SIZE_BYTES);
                gl.enableVertexAttribArray(this.VignetteShader.rm_TexCoord0);

                gl.uniformMatrix4fv(this.VignetteShader.view_proj_matrix, false, this.matOrtho);
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            }


            drawCubeDiffuse(texture, preset) {

                this.diffuseColoredShader.use();
                this.setTexture2D(0, texture, this.diffuseColoredShader.diffuseMap);
                this.setTexture2D(1, this.depthTexture, this.diffuseColoredShader.depthMap);
                gl.uniform4f(this.diffuseColoredShader.color, preset.startColor[0], preset.startColor[1], preset.startColor[2], preset.startColor[3]);
                this.drawDiffuseNormalStrideVBOTranslatedRotatedScaled(preset, this.diffuseColoredShader, this.modelCube, 0, 0, 0, 0, this.dragAngles[0], this.dragAngles[1], 1, 1, 1);

            }

            drawFur(textureDiffuse, textureAlpha, preset) {
                this.shaderFin.use();
                this.setTexture2D(0, textureDiffuse, this.shaderFin.diffuseMap);
                this.setTexture2D(1, this.textureFinAlpha, this.shaderFin.alphaMap);

                if (this.renderFins) {
                    this.drawFinsVBOTranslatedRotatedScaled(preset, this.shaderFin, this.modelCube, 0, 0, 0, 0, this.dragAngles[0], this.dragAngles[1], 1, 1, 1);
                }

                gl.depthMask(true);
                // gl.enable(gl.BLEND);
                gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE);


                this.shaderShell.use();
                this.setTexture2D(0, textureDiffuse, this.shaderShell.diffuseMap);
                this.setTexture2D(1, textureAlpha, this.shaderShell.alphaMap);
                this.setTexture2D(2, this.textureFurTipAlpha, this.shaderShell.alphaMapTip);

                if (this.renderShells) {
                    this.drawShellsVBOTranslatedRotatedScaledInstanced(preset, this.shaderShell, this.modelCube, 0, 0, 0, 0, this.dragAngles[0], this.dragAngles[1], 1, 1, 1);
                }

            }


            drawDiffuseNormalStrideVBOTranslatedRotatedScaled(preset, shader, model, tx, ty, tz, rx, ry, rz, sx, sy, sz) {


                model.bindBuffersExtended(shader);

                this.calculateMVPMatrix(tx, ty, tz, rx, ry, rz, sx, sy, sz);

                gl.uniformMatrix4fv(shader.view_proj_matrix, false, this.mMVPMatrix);
                gl.uniformMatrix4fv(shader.view_matrix, false, this.mVMatrix);
                gl.uniformMatrix4fv(shader.view_model_matrix, false, this.mMVMatrix);

                gl.uniform3f(shader.lightPos, this.lightPos[0], this.lightPos[1], this.lightPos[2]);
                gl.uniform3f(shader.lightColor, this.lightColor[0], this.lightColor[1], this.lightColor[2]);
                gl.uniform1f(shader.lightIntensity, this.lightIntensity);



                gl.drawElements(gl.TRIANGLES, model.getNumIndices(), gl.UNSIGNED_SHORT, 0);
            }

            drawShellsVBOTranslatedRotatedScaledInstanced(preset, shader, model, tx, ty, tz, rx, ry, rz, sx, sy, sz) {

                model.bindBuffersExtended(shader);

                this.calculateMVPMatrix(tx, ty, tz, rx, ry, rz, sx, sy, sz);

                gl.uniformMatrix4fv(shader.view_proj_matrix, false, this.mMVPMatrix);
                gl.uniformMatrix4fv(shader.view_matrix, false, this.mVMatrix);
                gl.uniformMatrix4fv(shader.view_model_matrix, false, this.mMVMatrix);

                gl.uniform1f(shader.shellOffset, preset.hairLength / preset.layers);
                gl.uniform1f(shader.layersCount, preset.layers);
                gl.uniform4f(shader.colorStart, preset.startColor[0], preset.startColor[1], preset.startColor[2], preset.startColor[3]);
                gl.uniform4f(shader.colorEnd, preset.endColor[0], preset.endColor[1], preset.endColor[2], preset.endColor[3]);
                gl.uniform1f(shader.time, this.furTimer);

                gl.uniform1f(shader.stiffness, this.FUR_STIFFNESS);
                gl.uniform3f(shader.lightPos, this.lightPos[0], this.lightPos[1], this.lightPos[2]);
                gl.uniform3f(shader.lightColor, this.lightColor[0], this.lightColor[1], this.lightColor[2]);
                gl.uniform1f(shader.lightIntensity, this.lightIntensity);

                gl.uniform1f(shader.ambientStrength, this.ambientStrength);
                gl.uniform1f(shader.diffusePower, preset.diffusePower);
                gl.uniform1f(shader.specularPower, preset.specularPower);

                gl.uniform3f(shader.hairColor, this.furColor[0], this.furColor[1], this.furColor[2]);


                gl.uniform1f(shader.curlyDegree, this.curlyDegree);

                gl.uniform1f(shader.curlyFrequency, this.curlyFrequency);
                gl.uniform1f(shader.curlyAmplitude, this.curlyAmplitude);

                gl.uniform1f(shader.textureFactor, preset.shellTextureSize);


                gl.drawElementsInstanced(gl.TRIANGLES, model.getNumIndices(), gl.UNSIGNED_SHORT, 0, preset.layers);

            }
            drawFinsVBOTranslatedRotatedScaled(preset, shader, model, tx, ty, tz, rx, ry, rz, sx, sy, sz) {

                model.bindFinsBuffersExtended(shader);

                this.calculateMVPMatrix(tx, ty, tz, rx, ry, rz, sx, sy, sz);

                gl.uniformMatrix4fv(shader.view_proj_matrix, false, this.mMVPMatrix);
                gl.uniformMatrix4fv(shader.view_matrix, false, this.mVMatrix);
                gl.uniformMatrix4fv(shader.view_model_matrix, false, this.mMVMatrix);

                gl.uniform4f(shader.colorStart, preset.startColor[0], preset.startColor[1], preset.startColor[2], preset.startColor[3]);
                gl.uniform4f(shader.colorEnd, preset.endColor[0], preset.endColor[1], preset.endColor[2], preset.endColor[3]);
                gl.uniform1f(shader.hairLength, preset.hairLength);
                gl.uniform1f(shader.layersCount, preset.layers);
                gl.uniform3f(shader.lightPos, this.lightPos[0], this.lightPos[1], this.lightPos[2]);
                gl.uniform3f(shader.lightColor, this.lightColor[0], this.lightColor[1], this.lightColor[2]);
                gl.uniform1f(shader.lightIntensity, this.lightIntensity);

                gl.uniform1f(shader.ambientStrength, this.ambientStrength);
                gl.uniform1f(shader.diffusePower, preset.diffusePower);
                gl.uniform1f(shader.specularPower, preset.specularPower);

                gl.uniform3f(shader.hairColor, this.furColor[0], this.furColor[1], this.furColor[2]);

                gl.uniform1f(shader.curlyFrequency, this.curlyFrequency);
                gl.uniform1f(shader.curlyAmplitude, this.curlyAmplitude);

                gl.uniform1i(shader.finOpacity, this.finOpacity);

                gl.uniform1f(shader.textureFactor, preset.finTextureSize);

                gl.drawElements(gl.TRIANGLES, model.numFinIndices, gl.UNSIGNED_SHORT, 0);

            }
            computeCombedNormals(computeShader, model) {
                computeShader.use();

                gl.uniform3f(computeShader.combViewDir3D, 0, this.combViewDirection2D[0], this.combViewDirection2D[1]);
                gl.uniform1f(computeShader.combAngle, this.combAngle);
                gl.uniformMatrix4fv(computeShader.view_model_matrix, false, this.mMVMatrix);

                //Compute shell normals

                model.bindTransformFeedbackBuffers(computeShader, true);

                gl.enable(gl.RASTERIZER_DISCARD);

                gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, model.transformFeedback);
                gl.beginTransformFeedback(gl.POINTS);
                gl.drawArrays(gl.POINTS, 0, model.numVertices);
                gl.endTransformFeedback();
                gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

                gl.disable(gl.RASTERIZER_DISCARD);

                //save it in normal buffer
                gl.bindBuffer(gl.ARRAY_BUFFER, model.TFOutput);
                const shellModifiedNormals = new Float32Array(model.numVertices * 3);
                gl.getBufferSubData(
                    gl.ARRAY_BUFFER,
                    0,    // byte offset into GPU buffer,
                    shellModifiedNormals,
                );
                gl.bindBuffer(gl.ARRAY_BUFFER, model.bufferCombNormals);
                gl.bufferData(gl.ARRAY_BUFFER, shellModifiedNormals, gl.STATIC_DRAW);

                //Compute fin normals

                model.bindTransformFeedbackBuffers(computeShader,false);
                
                gl.enable(gl.RASTERIZER_DISCARD);

                gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, model.transformFeedback);
                gl.beginTransformFeedback(gl.POINTS);
                gl.drawArrays(gl.POINTS, 0, model.numFinVertices);
                gl.endTransformFeedback();
                gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

                gl.disable(gl.RASTERIZER_DISCARD);

                //save it in normal buffer
                gl.bindBuffer(gl.ARRAY_BUFFER, model.TFOutput);
                const finModifiedNormals = new Float32Array(model.numFinVertices * 3);
                gl.getBufferSubData(
                    gl.ARRAY_BUFFER,
                    0,    // byte offset into GPU buffer,
                    finModifiedNormals,
                );
                gl.bindBuffer(gl.ARRAY_BUFFER, model.finBufferCombedNormals);
                gl.bufferData(gl.ARRAY_BUFFER, finModifiedNormals, gl.STATIC_DRAW);



            }

            /**
             * Updates camera rotation
             */
            animate() {
                var timeNow = new Date().getTime(),
                    elapsed;

                this.lastTime = timeNow;
            }

            // createDepthFBO() {


            //     this.depthTexture = gl.createTexture();
            //     this.depthTextureSize = 1024;
            //     gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
            //     gl.texImage2D(
            //         gl.TEXTURE_2D,      // target
            //         0,                  // mip level
            //         gl.DEPTH_COMPONENT24, // internal format
            //         this.depthTextureSize,   // width
            //         this.depthTextureSize,   // height
            //         0,                  // border
            //         gl.DEPTH_COMPONENT, // format
            //         gl.UNSIGNED_INT,    // type
            //         null);              // data
            //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            //     this.depthFramebuffer = gl.createFramebuffer();
            //     gl.bindFramebuffer(gl.FRAMEBUFFER, this.depthFramebuffer);
            //     gl.framebufferTexture2D(
            //         gl.FRAMEBUFFER,       // target
            //         gl.DEPTH_ATTACHMENT,  // attachment point
            //         gl.TEXTURE_2D,        // texture target
            //         this.depthTexture,         // texture
            //         0);                   // mip level


            // }

            createRenderFBO() {

                this.targetTexture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, this.targetTexture);


                // define size and format of level 0
                const level = 0;
                const internalFormat = gl.RGBA;
                const border = 0;
                const format = gl.RGBA;
                const type = gl.UNSIGNED_BYTE;
                const data = null;
                gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                    this.canvas.clientWidth, this.canvas.clientHeight, border,
                    format, type, data);

                // set the filtering so we don't need mips
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);


                // Create and bind the framebuffer
                this.renderFramebuffer = gl.createFramebuffer();
                gl.bindFramebuffer(gl.FRAMEBUFFER, this.renderFramebuffer);

                // attach the texture as the first color attachment
                const attachmentPoint = gl.COLOR_ATTACHMENT0;
                gl.framebufferTexture2D(
                    gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, this.targetTexture, level);


                //Create depth attachment    
                this.depthRenderBuffer = gl.createRenderbuffer();
                gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthRenderBuffer);
                gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, this.canvas.clientWidth, this.canvas.clientHeight);
                gl.bindRenderbuffer(gl.RENDERBUFFER, null);

                gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.depthRenderBuffer);

            }
            resizeRenderFBO() {
                gl.bindTexture(gl.TEXTURE_2D, this.targetTexture);
                // define size and format of level 0
                const level = 0;
                const internalFormat = gl.RGBA;
                const border = 0;
                const format = gl.RGBA;
                const type = gl.UNSIGNED_BYTE;
                const data = null;
                gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                    this.canvas.clientWidth, this.canvas.clientHeight, border,
                    format, type, data);

                gl.enable(gl.DEPTH_TEST);
                gl.enable(gl.CULL_FACE);
                gl.cullFace(gl.BACK);
                gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthRenderBuffer);
                gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, this.canvas.clientWidth, this.canvas.clientHeight);
                gl.bindRenderbuffer(gl.RENDERBUFFER, null);
            }
        }

        return FurRenderer;
    });
