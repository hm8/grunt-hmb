# grunt-hmb

Build hmb inside a Grunt task

## Getting Started
Install the hmb with: `npm install -g hmb`

Install this grunt plugin next to your project's [grunt.js gruntfile][getting_started] with: `npm install grunt-hmb`

Then add this line to your project's `grunt.js` gruntfile:

```javascript
grunt.loadNpmTasks('grunt-hmb');
```

[grunt]: http://gruntjs.com/
[getting_started]: https://github.com/gruntjs/grunt/blob/master/docs/getting_started.md

## Usage

```javascript
hmb: {
  compile: {
    options: {
      src: './site/',
      dist: '../dist',
      pack: true,	//是否按照将js,css的uri打包
      command: 'm,D,l,o,p' //m: md5, D: domains, l: lint, o: optimize, p: pack
    }
  }
},

//添加模块的相关配置
hma: {
  options: {
	src: './site/',
    dirs: ['/tpl', '/page', '/static', '/static/image'] //需要生成的目录,默认为该数组
  }
}
```

## License
Copyright (c) 2013 leoxie  
Licensed under the MIT license.
