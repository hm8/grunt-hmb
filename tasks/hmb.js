/*
 * grunt-hmb
 * https://github.com/hm8/grunt-hmb
 *
 * Copyright (c) 2013 leoxie
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {

  'use strict';

  var fs = require('fs');

  var compile_html = function(src, dist, pkg_enable) {

    var path_dist = src + dist,

      map = grunt.file.readJSON(path_dist + "/map.json"),

      res = map['res'],
      pkg = map['pkg'],

      dep_stat = {},

      dep_stat_add = function(dep, name) {
        if (dep_stat[dep] === undefined) {
          dep_stat[dep] = [];
        }
        dep_stat[dep].push(name);
      },

      replace_placeholder = function(name, result) {
        var css = '',
          js = '';

        result['css'].forEach(function(uri) {
          css += '<link href="' + uri + '" rel="stylesheet">\n';
        });

        result['js'].forEach(function(uri) {
          js += '<script src="' + uri + '"></script>\n';
        });

        var html = grunt.file.read(path_dist + '/views/' + name);

        html = html.replace('<!-- [if css placeholder] -->', css)
          .replace('<!-- [if js placeholder] -->', js);

        grunt.file.write(path_dist + '/views/' + name, html);
      };

    for (var key in res) {
      var re = res[key];

      if (re.type === 'ejs' && re.deps) {
        var result = {
          css: [],
          js: [],
          css_pkg: {},
          js_pkg: {}
        };

        re.deps.forEach(function(dep) {
          var res_index = res[dep];
          if (!res_index) {
            grunt.log.error('没有在(' + re.uri + ')中找到依赖(' + dep + ')');
            return false;
          }

          var res_index_pkg = res_index.type + '_pkg';

          dep_stat_add(dep, key);

          if (pkg_enable) {
            if (!result[res_index_pkg][dep]) {
              if (res_index.pkg) {
                var p = pkg[res_index.pkg];

                result[res_index.type].push(p.uri);

                p.has.forEach(function(v) {
                  result[res_index_pkg][v] = true;
                });
              } else {
                result[res_index.type].push(res_index.uri);
                result[res_index_pkg][dep] = true;
              }
            }
          } else {
            result[res_index.type].push(res_index.uri);
            result[res_index_pkg][dep] = true;
          }

        });

        replace_placeholder(key, result);
      }
    }

    grunt.file.write(path_dist + '/dep_stat.json', JSON.stringify(dep_stat));
  };

  grunt.registerTask("hma", 'add a module', function() {
    var options = this.options({
      src: './site/',
      dirs: ['/tpl', '/page', '/static', '/static/image']
    });

    var module_name = grunt.option('name');
    if (module_name) {
      var module_path = options.src + module_name;

      if (fs.existsSync(module_path)) {
        grunt.log.error('该模块已经存在');
      } else {
        fs.mkdirSync(module_path);

        options.dirs.forEach(function(v) {
          fs.mkdirSync(module_path + v);
        });

        grunt.log.success('创建模块:' + module_path);
      }
    } else {
      grunt.log.error('必须设置参数,如 grunt hma --name xxx');
    }
  });

  grunt.registerMultiTask('hmb', 'build hmb by spawning a child process', function() {

    var done = this.async();
    var all_command = 'm,D,l,o,p';

    /**
     * @namespace defaults
     */
    var options = this.options({
      src: './site/',
      dist: '../dist',
      pack: true,
      command: all_command
    });

    grunt.log.subhead('Building hmb...');

    var args = ['release', '-d', options.dist];

    grunt.util._.forEach(options.command.split(','), function(param) {
      if (all_command.indexOf(param) >= 0) {
        args.push('-' + param);
      }
    });

    var child = grunt.util.spawn({
      cmd: 'hmb',
      args: args,
      opts: {
        cwd: options.src
      }
    }, function(err) {
      if (err) {
        grunt.log.error(err);
        return done(false);
      }

      compile_html(options.src, options.dist, options.pack);

      grunt.log.success('Successfully Built hmb...');

      done();
    });

    child.stdout.on('data', function(data) {
      grunt.log.write(data);
    });
    child.stderr.on('data', function(data) {
      grunt.log.error(data);
    });
  });

};