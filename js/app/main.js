'use strict';

define([
    'FurRenderer',
    'jquery',
    'bootstrap-slider',
    'framework/utils/FullscreenUtils'
],
    function (
        FurRenderer,
        $,
        Slider,
        FullScreenUtils) {

        var renderer,
            timeoutHideName;

        /**
         * Initialize renderer
         */
        function initRenderer() {
            var oldYaw = 0;

            window.gl = null;

            if (renderer) {
                renderer.resetLoaded();
            }

            renderer = new FurRenderer();
            renderer.init('canvasGL', true);
        }

        function initUI() {
            // initialize fullscreen if supported
            if (FullScreenUtils.isFullScreenSupported()) {
                $('#toggleFullscreen').on('click', function (e) {
                    var $body = $('body');

                    if ($body.hasClass('fs')) {
                        FullScreenUtils.exitFullScreen();
                    } else {
                        FullScreenUtils.enterFullScreen();
                    }
                    FullScreenUtils.addFullScreenListener(function () {
                        if (FullScreenUtils.isFullScreen()) {
                            $body.addClass('fs');
                        } else {
                            $body.removeClass('fs');
                        }
                    });
                });
            } else {
                $('#toggleFullscreen').addClass('hidden');
            }

            // toggle settings visibility
            $('#toggleSettings').on('click', function (e) {
                var $this = $(this),
                    $controls = $('#row-settings, #nextPreset, #previousPreset, #help');

                $this.toggleClass('open');
                $controls.toggle();
                $('#presetName').hide();
                renderer.settingsToggle ? renderer.settingsToggle = false : renderer.settingsToggle = true;
            });

            $('#nextPreset').on('click', function (e) {
                renderer.chooseNextPreset();
            });

            $('#previousPreset').on('click', function (e) {
                renderer.choosePreviousPreset();
            });

            $('input.slider').slider();

            $('#sliderLayers').on('change', function (e) {
                renderer.layers = e.value.newValue;
            });
            $('#sliderhairLength').on('change', function (e) {
                renderer.hairLength = e.value.newValue;
            });
            $('#sliderDensity').on('change', function (e) {
                renderer.textureDensity = e.value.newValue;
            });
            $('#sliderCurlyness').on('change', function (e) {
                renderer.curlyness = e.value.newValue;
                renderer.curlyDegree = renderer.curlyness * renderer.CURLY_DEGREE_STEP;
                renderer.curlyFrequency = renderer.curlyness * renderer.CURLY_FREQ_STEP + renderer.CURLY_FREQ_OFFSET;
                renderer.curlyAmplitude = renderer.curlyness * renderer.CURLY_AMP_STEP + renderer.CURLY_AMP_OFFSET;
            });

            $('#sliderShellTexture').on('change', function (e) {
                renderer.shellTextureSize = e.value.newValue;
            });
            $('#sliderFinTexture').on('change', function (e) {
                renderer.finTextureSize = e.value.newValue;
            });
            $('#sliderLightPosX').on('change', function (e) {
                renderer.lightPos[1] = e.value.newValue;
            });
            $('#sliderLightPosY').on('change', function (e) {
                renderer.lightPos[2] = e.value.newValue;
            });
            $('#sliderLightIntensity').on('change', function (e) {
                renderer.lightIntensity = e.value.newValue;
            });
            $('#sliderAmbientStrength').on('change', function (e) {
                renderer.ambientStrength = e.value.newValue;
            });
            $('#sliderDiffusePower').on('change', function (e) {
                renderer.diffusePower = e.value.newValue;
            });
            $('#sliderSpecularPower').on('change', function (e) {
                renderer.specularPower = e.value.newValue;
            });

            $('#renderFins').on('change', function () {
                if (renderer.renderFins) { renderer.renderFins = false } else { renderer.renderFins = true };
            });
            $('#renderShells').on('change', function () {
                if (renderer.renderShells) { renderer.renderShells = false } else { renderer.renderShells = true };
            });
            $('#renderFur').on('change', function () {
                if (renderer.renderFur) { renderer.renderFur = false } else { renderer.renderFur = true };
            });
            $('#finOpacity').on('change', function () {
                if (renderer.finOpacity) { renderer.finOpacity = false } else { renderer.finOpacity = true };
            });
            $("#furColor").change(function () {
                var color = $(this).val();
                const r = parseInt(color.substr(1, 2), 16) / 255;
                const g = parseInt(color.substr(3, 2), 16) / 255;
                const b = parseInt(color.substr(5, 2), 16) / 255;
                renderer.furColor = [r, g, b];
            });


            //Mouse events

            $(window).bind('mousewheel DOMMouseScroll', function (event) {
                if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
                    renderer.size += 0.1;
                }
                else {
                    renderer.size -= 0.1;
                }
            });
            $(window).mousedown(function (event) {
                renderer.mouseLastPosition[0] = event.clientX;
                renderer.mouseLastPosition[1] = event.clientY;
                if (!renderer.settingsToggle) {
                    if (event.which == 1) {
                        renderer.dragging = true;
                        document.body.style.cursor = 'all-scroll';
                    }
                    if (event.which == 2 && renderer.dragging == false) {
                        renderer.combing = true;
                        document.body.style.cursor = 'none';
                    }
                    if (renderer.combing && event.which == 1) {
                        renderer.dragging = false;
                        renderer.combing = false;
                        renderer.resizingComb = true;
                        document.body.style.cursor = 'e-resize';
                        renderer.mouseResizeLastPosition[0] = renderer.mouseLastPosition[0];
                        renderer.mouseResizeLastPosition[1] = renderer.mouseLastPosition[1];
                    }

                }
            });
            $(window).mouseup(function () {
                renderer.mouseMoving = false;
                renderer.dragging = false;
                renderer.combing = false;
                renderer.resizingComb = false;
                document.body.style.cursor = 'context-menu';
                renderer.combAngle = 0;

            });
            $(window).mousemove(function (event) {

                renderer.mouseMoving = true;
                var x = event.clientX;
                var y = event.clientY;

                if (renderer.dragging) {
                    var speed = renderer.rotationFactor / renderer.canvas.clientHeight;
                    var dx = speed * (x - renderer.mouseLastPosition[0]);
                    var dy = speed * (y - renderer.mouseLastPosition[1]);

                    renderer.dragAngles[0] += dy;
                    renderer.dragAngles[1] += dx;

                    renderer.mouseLastPosition[0] = x;
                    renderer.mouseLastPosition[1] = y;


                }
                if (renderer.combing) {

                    //Normalize device coordinates CLIP position
                    const canvas = gl.canvas;
                    const rect = canvas.getBoundingClientRect();
                    const aux_x = x - rect.left;
                    const aux_y = y - rect.top;
                    const new_x = aux_x / rect.width * 2 - 1;
                    const new_y =  aux_y / rect.height * -2 + 1;

                    var speed = renderer.rotationFactor / renderer.canvas.clientHeight;
                    var dx = 10*(new_x - renderer.mouseNDCPosition[0]);
                    var dy = 10*(new_y - renderer.mouseNDCPosition[1]);


                    // renderer.combAngle = Math.sqrt(dx * dx + dy * dy);
                    renderer.combAngle = 0.1;
                    renderer.combViewDirection2D = [dx, dy];

                    renderer.mouseNDCPosition[0] = new_x;
                    renderer.mouseNDCPosition[1] = new_y;

                    renderer.combNDCRadius = renderer.combRadius / (rect.width * 0.5);


                    renderer.mouseLastPosition[0] = x;
                    renderer.mouseLastPosition[1] = y;




                }
                if (renderer.resizingComb) {

                    var speed = 1000 / renderer.canvas.clientHeight;
                    var dx = speed * (x - renderer.mouseResizeLastPosition[0]);
                    var dy = speed * (y - renderer.mouseResizeLastPosition[1]);

                    renderer.mouseResizeLastPosition[0] = x;
                    renderer.mouseResizeLastPosition[1] = y;
                    if (renderer.combRadius >= 0) {
                        renderer.combRadius += (dx + dy) * 0.5;
                        if (renderer.combRadius < 0) { renderer.combRadius = 0; }
                    }





                }
            });

            // object.style.cursor = 'all-scroll';



            renderer.onPresetLoaded = function () {
                $('#sliderLayers').slider('setValue', renderer.layers);
                $('#sliderhairLength').slider('setValue', renderer.hairLength);
                $('#sliderDensity').slider('setValue', renderer.textureDensity);
                $('#sliderCurlyness').slider('setValue', renderer.curlyness);
                $('#sliderShellTexture').slider('setValue', renderer.shellTextureSize);
                $('#sliderFinTexture').slider('setValue', renderer.finTextureSize);
                $('#sliderLightPosX').slider('setValue', renderer.lightPos[1]);
                $('#sliderLightPosY').slider('setValue', renderer.lightPos[2]);
                $('#sliderLightIntensity').slider('setValue', renderer.lightIntensity);
                $('#sliderAmbientStrength').slider('setValue', renderer.ambientStrength);
                $('#sliderDiffusePower').slider('setValue', renderer.diffusePower);
                $('#sliderSpecularPower').slider('setValue', renderer.specularPower);

                clearTimeout(timeoutHideName);
                $('#presetName')
                    .show()
                    .text(renderer.presetName);
                timeoutHideName = setTimeout(function () {
                    $('#presetName').hide();
                }, 3000);
            };
        }

        $(function () {
            initRenderer();
            initUI();
        });
    });
