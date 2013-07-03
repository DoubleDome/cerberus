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

        var path = require('path');
        var destFinal = path.resolve(this.data.dest) + '/';

        if (!grunt.file.exists(destFinal)) {
            var done = this.async();

            var clean = this.data.clean;
            if (typeof(clean) != 'object') clean = [clean];
            // Adding git cleanup
            clean.unshift('.git*');

            // Get git repo name
            var name = this.data.git.substring(this.data.git.lastIndexOf('/'));
            name = name.substring(1, name.lastIndexOf('.git'));
            grunt.log.write("Cloning '" + name + "' into '" + this.data.dest + "'... ");

            // Build command line
            var command = 'git clone {{git}} {{dest}}';
            command = command.replace('{{git}}', this.data.git).replace('{{dest}}', this.data.dest);

            require('child_process').exec(command, cleanup);
        } else {
            grunt.fail.warn('Directory exists!');
        }

        // Cleanup Function
        function cleanup(error, stdout, stderr) {
            var files;

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
                        grunt.fail.warn('Operation failed.');
                    }
                }
            }
            grunt.log.ok();
            grunt.log.writeln();
            grunt.log.success('Template ready!');

            done();
        }

    });

};