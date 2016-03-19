"use strict";

function dissProvider() {
    var registry = {}, resolved = {};

    function camelCase(name) {
        return name.split(/[^\w]/)
            .filter(function(s) { return s !== "" })
            .map(function(s,idx) {
                if (idx===0) return s;
                return s[0].toUpperCase() + s.substring(1)
            }).join('');
    }

    function resolveOrGetAlreadyResolved(name) {
        if (resolved.hasOwnProperty(name)) {
            if (resolved[name].module === undefined ) { // if there was attempt to resolve and no module, dependency is circual
                throw new SyntaxError("Circual dependency detected in " + name);
            }
        } else {
            if (registry.hasOwnProperty(name)) {
                resolved[name] = {
                    module: undefined,
                    useCount: 0
                };
                registry[name].useCount += 1;
                resolved[name].module = resolve(registry[name].provider);
            } else {
                throw new SyntaxError("Module " + name+" does not exist or is not registrated");
            }
        }
        resolved[name].useCount += 1;
        return resolved[name];
    }

    function registerModule(name, module) {
        //
        // Register a module.
        //
        // Module is a object which will be passed verbatim to providers depending on it. 
        //
        if (typeof (name) !== 'string') {
            throw TypeError("Module name must be a string");
        }
        resolved[camelCase(name)] = {
            module: module,
            useCount: 0
        }
        return diss;
    }
    
    function requireWrapper(name, main) {
        //
        // Shorthand to diss.register.module('name',require('name'));
        //     
        registerModule(name, ( main || require.main ).require(name));
        return diss;
    }
    
    function loadDependencies(pkg ,main) {
        //
        // Loads all dependencies from given module. Usually you should call it with `require.main`
        //
        Object.keys(pkg.dependencies || {}).forEach( function( name ) { return requireWrapper(name, main || require.main); }  );
        return diss;
    }
    
    function loadProviders(providers, main, directory ) {
        //
        // Loads providers for given module.
        //
        var from = main || require.main;
        providers.forEach( function( name ) { return diss.register.provider(name, from.require( (directory || ".") + '/' + name)) } )
    }

    function registerProvider(name, provider) {
        // 
        // Register a provider.
        //
        // Provider is a function whose arguments are dependencies. It should create instance of module,
        // which will be passed to providers depending on it.
        // 
        if (typeof (name) !== 'string') throw TypeError("Module name must be a string");
        
        if (provider instanceof Function) {
            registry[camelCase(name)] = {
                provider,
                useCount: 0
            }
        } else {
            throw new TypeError(name+" is not a function. Only providers can be registrated.");
        }
        return diss;
    }
    
    function resolve(provider) {
        //
        // Resolves a module. 
        //
        if (provider === undefined) throw new SyntaxError("Resolving undefined module");
        if (!(provider instanceof Function)) throw new TypeError("Trying to resolve non-module. Module must be a provider function.");
        var declaration = provider.toString().match(/^(function)?\s*[^\(]*\(\s*([^\)]*)\)/m);
        if (!(declaration)) throw new TypeError("Module must be defined with parenthesis around dependencies");
        
        var argstring = declaration[2].replace(/ /g, '');
        var deps;
        if (argstring !== '') {
            deps = argstring.split(',')
                .map(resolveOrGetAlreadyResolved)
                .map(function(envelope) { return envelope.module } );
        } else {    // if there was attempt to resolve and no module, dependency is circual
            deps = [];
        }
        return provider.apply(null, deps);
    }
    
    var diss = {
        resolve: resolve,
        require: requireWrapper,
        loadDependencies: loadDependencies,
        loadProviders: loadProviders,
        register: {
            module: registerModule,
            provider: registerProvider
        },
    };
    return diss;
}
module.exports = dissProvider;
