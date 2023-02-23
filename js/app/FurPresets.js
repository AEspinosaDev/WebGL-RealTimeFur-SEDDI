'use strict';

define(function() {

    function FurPresets() {}

    FurPresets.presets = [ {
        'name': 'Timber Wolf',
        'layers': 50,
        'hairLength': 2.5,
        'waveScale': 0.3,
        'diffuseTexture': 'color.png',
        // 'alphaTexture': 'uneven-alpha.png',
        'alphaTexture': 'bunnyalpha_base.png',
        // 'alphaTexture': 'density5alpha_alphamask.png',
        // 'tipAlphaTexture':'density5alpha_alphamask.png',
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
        'diffuseTexture': 'fur-leo.png',
        'alphaTexture': 'uneven-alpha.png',
        'startColor': [0.6, 0.6, 0.6, 1.0],
        'endColor': [1.0, 1.0, 1.0, 0.0],
        'diffusePower': 8,
        'specularPower': 18
    }, {
        'name': 'Cow',
        'layers': 32,
        'hairLength': 1,
        'waveScale': 0.2,
        'diffuseTexture': 'fur-cow.png',
        'alphaTexture': 'uneven-alpha.png',
        'startColor': [0.7, 0.7, 0.7, 1.0],
        'endColor': [1.0, 1.0, 1.0, 0.0],
        'diffusePower': 0.4,
        'specularPower': 0.12
    },{
        'name': 'Moss',
        'layers': 7,
        'hairLength': 2,
        'waveScale': 0.0,
        'diffuseTexture': 'moss.png',
        'alphaTexture': 'moss-alpha.png',
        'startColor': [0.2, 0.2, 0.2, 1.0],
        'endColor': [1.0, 1.0, 1.0, 0.8],
        'diffusePower': 0.4,
        'specularPower': 0.12
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
