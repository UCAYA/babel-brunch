babel6-brunch
=============

*This is a fork of the official Babel plugin for brunch, one which adds .babelrc
reading and fixes patterns and sourcemaps*.

Brunch plugin using [babel](https://github.com/babel/babel) to turn the latest
ECMAScript standard code into vanilla ES5 with no runtime required.

All the `.js` files in your project will be run through the babel compiler,
except those it is configured to ignore, unless you use the `pattern` option.

Additionally, starting Brunch 2.7.3, babel-brunch will also compile NPM dependencies.

Installation
------------

`npm install --save babel6-brunch`

Usage
-----

- **No configuration is required by default.** `es2015` and `es2016` presets are included.
- To add **React** preset:
    - Execute `npm install --save-dev babel-preset-react`, then adjust the `presets` option in `brunch-config.js`:
    - `plugins: {babel: {presets: ['es2015', 'es2016', 'react']}}`
- Default behavior is to handle `js` files which are not dependencies and `jsx` files if you enable React preset.
- To specify preset options: `{presets: [['transform-es2015-template-literals', { spec: true }]]}`

Configuration
-------------

This plugin will read in your `.babelrc` file or the `babel` section of your
`package.json` as the base for your configuration. These values will be
overridden by anything in the brunch config file.

Set [babel options](https://babeljs.io/docs/usage/options) in your brunch
config (such as `brunch-config.js`) except for `filename` and `sourceMap`
which are handled internally.

This plugin uses, by default,
[babel-preset-env](https://github.com/babel/babel-preset-env/).
To configure, use `env` option:

```js
plugins: {
  babel: {
    env: {
      targets: {
        safari: 7, // explicitly
        browsers: '>2%' // with browserslist query
      }
    }
  }
}
```
Without providing any options, behavior will be like using [babel-preset-latest](https://babeljs.io/docs/plugins/preset-latest/) (es2015, es2016, es2017).

To use no preset, set the configuration option to an empty array.

Additionally, you can set an `ignore` value to specify which `.js` files in
your project should not be compiled by babel. By default, `ignore` is set to
`/^(bower_components|node_modules|vendor)/`.

You can also set `pattern` to a regular expression that will match the file
paths you want compiled by babel, which will override the standard behavior of
compiling every `.js` file.

```js
plugins: {
  babel: {
    presets: ['env', 'react'], // env is default
    ignore: [
      /^(bower_components|vendor)/,
      'app/legacyES5Code/**/*'
    ],
    pattern: /\.jsx?$/ // es6, js and jsx are defaults.
  }
}
```

Change Log
----------
[See release notes page on GitHub](https://github.com/babel/babel-brunch/releases)

License
-------
[ISC](https://raw.github.com/babel/babel-brunch/master/LICENSE)
