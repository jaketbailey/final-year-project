'use strict'
/**
babel.config.js with useful plugins. 
*/
module.exports = function(api) {
  api.cache(true);
   api.assertVersion("^7.4.5");

  const presets = [
        [
          "@babel/preset-react", {
            runtime: 'automatic',
          }
        ],
        "@babel/preset-env",
        [
          "babel-preset-vite",
          {
            "env": true
          }
        ]
    ];

  const plugins = [
    ['@babel/plugin-transform-modules-commonjs'],
  ];
    
  return {
    presets, plugins
  }
}