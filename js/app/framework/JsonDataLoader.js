'use strict';

define(function() {

    function JsonDataLoader() {}

    /**
     * Static function to load binary data
     * @param  {string} url - URL for content
     * @param  {Function} - callback to receive binary data
     */
    JsonDataLoader.load = function(url, callback) {
        var root = this,
            xhr = new XMLHttpRequest();

        xhr.open('GET', url, true);
        xhr.responseType = 'json';
        xhr.onload = function() {
            callback && callback(this.response);
        };
        xhr.send(null);
    }

    return JsonDataLoader;
});
