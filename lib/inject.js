"use strict";

// this should be refactored to module

function dissForge() {
    var registry = {}, resolved = {};

    function register(name, module) {
        if ( typeof(name) !== 'string' ) {
            throw Error("Module name must be a string");
        }
        if (module instanceof Function) {
            registry[name] = module;
        } else {
            throw new Error("Only forges can be registrated. Module must be a function.");
        }
        return diss;
    }

    function resolve(module) {
        var names = module.toString().match(/^(function)?\s*[^\(]*\(\s*([^\)]*)\)/m)[2].replace(/ /g, '').split(',');
        var deps = names
            .filter(name => !!name)
            .map(function(name) {
                if ( resolved[name] ) return resolved[name];
                return resolved[name]=resolve(registry[name])
            });

        return module.apply(null, deps);
    }
    var diss = {
        register,
        resolve
    };
    return diss;
}
module.exports = dissForge;