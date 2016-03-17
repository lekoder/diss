# DI+KISS

DISS is simple and convinient dependency injector for `node.js`. It usees similar pattern to AngularJS
dependency injector.

# Usage
## Provider/factory/forge pattern

To use DISS you should use a provider pattern for your code.

Instead of:
```js
var d1 = require('d1'),
    d2 = require('d2');

module.exports = {
    method: m1
}    
```
Use:
```js
module.exports = function( d1, d2 ) {
    return {
        method: m1
    }
}
```

## Intended usage

main.js
```js
var diss = require('diss')(),
    pkg = require('./package.json');
    
// automaticly load all dependencies defined in package.json and register them under their own names    
diss.loadDependencies(pkg);  

// load providers from files and register them under same names: 
diss.loadProviders(['cfg', 'logger', 'worker', 'rest']);

// register pkg as 'pkg', so it can be used by our modules
diss.register.module('pkg',pkg);

// start actual application.
diss.resolve(function(rest) {
   rest.startServer(); 
});
```

# Convinience methods

# Gotchas