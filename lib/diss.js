"use strict";

// this should be refactored to module

function dissForge() {
    var registry = {}, resolved = {};

    function module(name, module) {
        //
        // Register a module.
        //
        // Module is a object which will be passed verbatim to providers depending on it. 
        //
        if (typeof (name) !== 'string') {
            throw TypeError("Module name must be a string");
        }
        resolved[name] = {
            module,
            useCount:0
        }
    }

    function provider(name, provider) {
        // 
        // Register a provider.
        //
        // Provider is a function whose arguments are dependencies. It should create instance of module,
        // which will be passed to providers depending on it.
        // 
        
        if (typeof (name) !== 'string') {
            throw TypeError("Module name must be a string");
        }
        if (provider instanceof Function) {
            registry[name] = {
                provider,
                useCount: 0
            }
        } else {
            throw new TypeError("Only forges can be registrated. Module must be a function.");
        }
        return diss;
    }

    function getResolved(name) {
        if (resolved[name]) {
            if (!resolved[name].module) {
                throw new SyntaxError("Circual dependency detected in "+name);
            }
        } else {
            if ( registry[name] ) {
                resolved[name] = { 
                    module: undefined,
                    useCount: 0
                };
                registry[name].useCount += 1;
                resolved[name].module = resolve( registry[name].provider );
            } else {
                throw new SyntaxError("Unknown module "+name);
            }
        }
        resolved[name].useCount += 1;
        return resolved[name];
    }

    function resolve(module) {
        if ( module === undefined ) throw new SyntaxError("Resolving undefined module");
        if ( !(module instanceof Function) ) throw new TypeError("Trying to resolve non-module. Module must be a forge function.");
        var argstring = module.toString().match(/^(function)?\s*[^\(]*\(\s*([^\)]*)\)/m)[2].replace(/ /g, '');
        var deps;
        if (argstring!=='') {
            deps = argstring.split(',')
                .map(getResolved)
                .map(envelope => envelope.module);
        } else {
            deps = [];
        }

        return module.apply(null, deps);
    }
    var diss = {
        resolve,
        register: {
            module,
            provider
        },
    };
    return diss;
}
module.exports = dissForge;