"use strict";

var compileAssets = [
    'clean:dev',
    'jst:dev',
    'less:dev',
    'copy:dev',
    'coffee:dev',
];

if (process.env.NODE_ENV === 'development') {
    compileAssets[compileAssets.length] = 'exec:webpackDevServerLift';
} else {
    compileAssets[compileAssets.length] = 'exec:webpackBuild';
}

module.exports = function (grunt) {
    grunt.registerTask('compileAssets', compileAssets);
};
