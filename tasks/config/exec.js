module.exports = function(grunt) {

    grunt.config.set('exec', {
        webpackBuild : 'webpack',
        webpackDevServerLift : 'node webpackDevServer.js &',
    });

    grunt.loadNpmTasks('grunt-exec');
};

