'use strict';

define(function() {

    function FurPresets() {}

    FurPresets.presets = [ {
        'name': 'Timber Wolf',
        'layers': 50,
        'hairLength': 2.5,
        'waveScale': 0.3,
        'alphaTexture': 'bunnyalpha_base.png',
        'tipAlphaTexture':'bunnyalpha_tip.png',
        'finAlphaTexture': 'hairs-alpha.png',
        'startColor': [0.1, 0.1, 0.1, 1.0],
        'endColor': [1.0, 1.0, 1.0, 0.0],
        'diffusePower': 4,
        'specularPower': 12
    }, {
        
        'name': 'Leopard',
        'layers': 36,
        'hairLength': 2,
        'waveScale': 0.5,
        'alphaTexture': 'noise_test_b.png',
        'tipAlphaTexture':'noise_test.png',
        // 'finAlphaTexture': 'hairs-alpha.png',
        'startColor': [0.6, 0.6, 0.6, 1.0],
        'endColor': [1.0, 1.0, 1.0, 0.0],
        'diffusePower': 8,
        'specularPower': 18
   
    }];

    FurPresets._current = 0;

    FurPresets.current = function() {
        return this.presets[this._current];
    };

    FurPresets.next = function() {
        this._current++;
        if (this._current >= this.presets.length) {
            this._current = 0;
        }

        return this.presets[this._current];
    };

    FurPresets.previous = function() {
        this._current--;
        if (this._current < 0) {
            this._current = this.presets.length - 1;
        }

        return this.presets[this._current];
    };

    return FurPresets;
});
