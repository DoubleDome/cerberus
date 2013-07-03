/*
 * cerberus
 * https://github.com/DoubleDome/cerberus
 *
 * Copyright (c) 2013 Alex Toledo
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('cerberus', 'Your task description goes here.', function() {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            punctuation: '.',
            separator: ', '
        });

        // Iterate over all specified file groups.
        this.files.forEach(function(f) {
            // Concat specified files.
            var src = f.src.filter(function(filepath) {
                // Warn on and remove invalid source files (if nonull was set).
                if (!grunt.file.exists(filepath)) {
                    grunt.log.warn('Source file "' + filepath + '" not found.');
                    return false;
                } else {
                    return true;
                }
            }).map(function(filepath) {
                // Read file source.
                return grunt.file.read(filepath);
            }).join(grunt.util.normalizelf(options.separator));

            // Handle options.
            src += options.punctuation;

            // Write the destination file.
            grunt.file.write(f.dest, src);

            // Print a success message.
            grunt.log.writeln('File "' + f.dest + '" created.');
        });
    });


    grunt.registerMultiTask('generate', 'Create project template from git repo', function() {

        var options = this.options({
            force: false
        });

        var done = this.async();
        var sys = require('sys');
        var exec = require('child_process').exec;
        var command = 'git clone {{git}} {{dest}}';
        var clean = this.data.clean;
        if (typeof(clean) != 'object') clean = [clean];
        clean.unshift('.git*');

        var path = require('path');
        var destFinal = path.resolve(this.data.dest) + '/';

        var files;

        var name = this.data.git.substring(this.data.git.lastIndexOf('/'));
        name = name.substring(1, name.lastIndexOf('.git'));
        grunt.log.write("Cloning '" + name + "' into '" + this.data.dest + "'... ");

        command = command.replace('{{git}}', this.data.git).replace('{{dest}}', this.data.dest);

        function prepare(error, stdout, stderr) {
            grunt.log.ok();
            grunt.log.write('Cleaning files... ');

            // Clean
            for (var i = 0; i < clean.length; i++) {
                files = grunt.file.expand(destFinal + clean[i]);

                for (var f = 0; f < files.length; f++) {
                    try {
                        grunt.file.delete(files[f], options);
                    } catch (e) {
                        grunt.log.error();
                        grunt.verbose.error(e);
                        grunt.fail.warn('operation failed.');
                    }
                }
            }
            grunt.log.ok();
            grunt.log.writeln();
            grunt.log.success('Template ready!');

            done();
        }

        if (!grunt.file.exists(destFinal)) {
            exec(command, prepare);
        }

    });

};