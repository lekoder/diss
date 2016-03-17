var should = require('should');
var dissForge = require('../lib/inject.js');

describe('inject', function () {

    var diss;
    var noDeps, named, arrow, depends, dependsOnMore, dependsOnEvenMore, arrowDepends, circa, circb, circself;

    beforeEach(function () {
        diss = dissForge();
        
        noDeps = function () { return { mod: noDeps } },
        named = function name() { return { mod: named } },
        arrow = () => ({ mod: arrow });
        
        depends = function (noDeps) { return { mod:depends, dep:[noDeps] }; };
        dependsOnMore = function (noDeps, named, arrow) { return { mod:dependsOnMore, dep: [noDeps,named,arrow] } };
        dependsOnEvenMore = function (dependsOnMore) { return { mod: dependsOnEvenMore, dep: [dependsOnMore] }; };

        arrowDepends = (named) => ({mod:arrowDepends, dep:[named]});
        
        circa = function(circb) { return { mod: circb, dep:[circa]}; };
        circb = function(circa) { return { mod: circa, dep:[circb]}; };
        
        circself = function( circself ) { return { mod:circself, dep: [circself] } }
    });

;

    describe('register(name,module)', function () {
        it("regiters anonymous function", function () {
            (function() { diss.register('noDeps', noDeps); }).should.not.throw();
        });
        it("registers named function", function() {;
            (function() { diss.register('named', named); }).should.not.throw();
        });
        it("registers fat arrow", function() {
            (function() { diss.register('arrow', arrow); }).should.not.throw();
        });
    });
    describe('resolve(module)', function() {
        it("resolves anonymous module without dependencies", function() {
            diss.resolve(noDeps).should.have.property('mod').which.is.equal(noDeps);
        });
        it("resolves named module without dependencies", function() {
            diss.resolve(named).should.have.property('mod').which.is.equal(named);
        });
        it("resolves arrow without dependencies", function() {
            diss.resolve(arrow).should.have.property('mod').which.is.equal(arrow); 
        });
        it("resolves dependency", function() {;
            diss.register('noDeps',noDeps);
            diss.resolve(depends).should.have.property('mod').which.is.equal(depends);
            diss.resolve(depends).should.have.property('dep')
                    .which.has.property(0)
                    .which.has.property('mod')
                    .which.is.equal(noDeps);
        });
        it("resolves multiple dependencies", function() {
            diss.register('noDeps',noDeps)
                .register('named', named)
                .register('arrow',arrow);
                
            var resolved = diss.resolve(dependsOnMore);
            resolved.should.have.property('mod').which.is.equal(dependsOnMore);
            
            [noDeps,named,arrow].forEach(function(f,idx) {
                resolved.dep[idx].should.have.property('mod').which.is.equal(f);
            });
        });
        it("resolves passing dependency", function() {
            diss.register('noDeps',noDeps)
                .register('named', named)
                .register('arrow',arrow)
                .register('dependsOnMore', dependsOnMore);
                
            var resolved = diss.resolve(dependsOnEvenMore);
            resolved.should.have.property('mod').which.is.equal(dependsOnEvenMore);
            resolved.dep[0].should.have.property('mod').which.is.equal(dependsOnMore);
            [noDeps,named,arrow].forEach(function(f,idx) {
                resolved.dep[0].dep[idx].should.have.property('mod').which.is.equal(f);
            });
        });
        it("resolves arrow function with dependencies", function() {
            diss.register('named', named);
            var resolved = diss.resolve(arrowDepends);
            resolved.should.have.property('mod').which.is.equal(arrowDepends);
            resolved.dep[0].should.have.property('mod').which.is.equal(named);
        });
        it("resolves circual dependency", function() {
            diss.register('circa',circa)
                .register('circb',circb);
                
            var resolved = diss.resolve(circa);
            resolved.should.have.property('mod').shich.is.equal(circa);
            resolved.dep[0].should.have.property('mod').shich.is.equal(circb);
        });
        
    });
});