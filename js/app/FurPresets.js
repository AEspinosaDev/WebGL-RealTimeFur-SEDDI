'use strict';

define(function() {

    function FurPresets() {}

    FurPresets.presets = [ {
        'name': 'Rabbit',
        'mesh': 'rabbit',
        'layers': 50,
        'hairLength': 2.5,
        'waveScale': 0.3,
        'diffuseTexture': 'noise_test_b.png',
        'alphaTexture': 'bunnyalpha_base.png',
        'tipAlphaTexture':'bunnyalpha_tip.png',
        'finAlphaTexture': 'hairs-alpha.png',
        'startColor': [0.1, 0.1, 0.1, 1.0],
        'endColor': [1.0, 1.0, 1.0, 0.0],
        'skinColor': [240/255, 219/255, 204/255],
        'diffuseColor': [0.89, 0.82, 0.65],
        'diffusePower': 7,
        'specularPower': 15.0,
        'shellTextureSize': 1,
        'finTextureSize': 0.7,
        'useColorText': false
    }, {
        
        'name': 'Dog',
        'mesh': 'dog',
        'layers': 36,
        'hairLength': 0.7,
        'waveScale': 0.5,
        'diffuseTexture': 'noise_test_b.png',
        'alphaTexture': 'noise_test_b.png',
        'tipAlphaTexture':'noise_test_b.png',
        'finAlphaTexture': 'hairs-alpha.png',
        'startColor': [0.2, 0.2, 0.2, 1.0],
        'endColor': [1.0, 1.0, 1.0, 0.0],
        'skinColor': [240/255, 219/255, 204/255],
        'diffuseColor': [0.3, 0.14, 0.03],
        'diffusePower': 9,
        'specularPower': 2.0,
        'shellTextureSize': 2,
        'finTextureSize': 0.5,
        'useColorText': false
    },{
        'name': 'Cloth',
    'mesh': 'cloth',
    'layers': 40,
    'hairLength': 2.6,
    'waveScale': 0.5,
    'diffuseTexture': 'fur-wolf.png',
    'alphaTexture': 'uneven-alpha.png',
    'tipAlphaTexture':'uneven-alpha.png',
    'finAlphaTexture': 'hairs-alpha.png',
    'startColor': [0.1, 0.1, 0.1, 1.0],
    'endColor': [1.0, 1.0, 1.0, 0.0],
    'skinColor': [240/255, 219/255, 204/255],
    'diffuseColor': [0.3, 0.14, 0.03],
    'diffusePower': 6,
    'specularPower': 10,
    'shellTextureSize': 3.3,
    'finTextureSize': 1.5,
    'useColorText': true}];

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
