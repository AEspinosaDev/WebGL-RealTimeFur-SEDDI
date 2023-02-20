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
                    $controls = $('#row-settings, #nextPreset, #previousPreset');

                $this.toggleClass('open');
                $controls.toggle();
                $('#presetName').hide();
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
            $('#sliderThickness').on('change', function (e) {
                renderer.thickness = e.value.newValue;
            });
            $('#sliderSize').on('change', function (e) {
                renderer.size = e.value.newValue;
            });
            $('#sliderPitchRot').on('change', function (e) {
                renderer.anglePitch = e.value.newValue;
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
            // $('#lightColor').on('change', function(e) {
            //     renderer.lightColor = e.value.newValue;
            // });
           
           



            renderer.onPresetLoaded = function () {
                $('#sliderLayers').slider('setValue', renderer.layers);
                $('#sliderThickness').slider('setValue', renderer.thickness);
                $('#sliderSize').slider('setValue', renderer.size);
                $('#sliderPitchRot').slider('setValue', renderer.anglePitch);
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
