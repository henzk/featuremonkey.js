/**
 *  @fileOverview
 *  featuremonkey.js - FOP for JavaScript
 *  https://github.com/henzk/featuremonkey.js
 *  License: MIT
 *  @author Hendrik Speidel - http://schnapptack.de/
 *
 *  @description
 *  <tt>featuremonkey.js</tt> is a tool to build feature 
 *  oriented javascript application product lines. It is a port of
 *  <a href="http://github.com/henzk/featuremonkey">featuremonkey</a>
 *  from python to JavaScript.
 *  <br>
 *  The project can be found online at 
 *  <a href="http://github.com/henzk/featuremonkey.js">
 *  http://github.com/henzk/featuremonkey.js</a>.
 **/

/**
 *  Most times, it should be sufficient to use only 
 *  <tt>featuremonkey.compose</tt> to superimpose FSTs and
 *  an implementation.
 *  <br>
 *  All functions prefixed with <tt>_</tt> are for advanced usage only.
 *  @see featuremonkey#compose
 *  @namespace
 **/
var featuremonkey = {}

/**
 *  @description
 *  thrown when things go south during composition.
 *  Unfortunately, there seems to be no way to
 *  inspect thrown objects in webkit inspector.
 *  Therefore, this is currently returns a string.
 *  
 *  @param {string} msg  the error message
 *  
 *  @returns {string} composition error message
 **/
featuremonkey.CompositionError = function(msg) {
    return 'featuremonkey.CompositionError: ' + msg
}

/**
 *  @public
 *  @description
 *  refine a property.
 *
 *  If refinement is not a function, its value is used as 
 *  the refined implementation of the property.
 *  If refinement is a function <tt>func</tt>, <tt>func(original, self)</tt> is called 
 *  to obtain the refined implementation of the property.
 *  <tt>original</tt> is the original implementation of the property;
 *  <tt>self</tt> is a reference to the object containing the property
 *  and may be useful when refining methods.
 *
 *  @param {object} current_impl  the object containing the property
 *  @param {string} attribute_name  the name of the property to refine
 *  @param {object} refinement  refinement to apply to the property
 **/
featuremonkey._refine = function(current_impl, attribute_name, refinement) {
    if (typeof refinement == 'function') {
        current_impl[attribute_name] = refinement(current_impl[attribute_name], current_impl)
    } else {
        current_impl[attribute_name] = refinement
    }
}

/**
 *  @public
 *  @description
 *  introduce a property.
 *
 *  Introductions are specified analogous to refinements.
 *  If introduction is not a function, its value is used as 
 *  value of the new property.
 *  If introduction is a function <tt>func</tt>, <tt>func(self)</tt> is called 
 *  to obtain the new value of the property.
 *  <tt>self</tt> is a reference to the object containing the property
 *  and may be useful when introducing methods.
 *
 *  @param {object} current_impl the object containing the property
 *  @param {string} attribute_name the name of the property to refine
 *  @param {object} introduction description of the property to introduce
 **/
featuremonkey._introduce = function(current_impl, attribute_name, introduction) {
    if (typeof introduction == 'function') {
        current_impl[attribute_name] = introduction(current_impl)
    } else {
        current_impl[attribute_name] = introduction
    }
}

/**
 *  @public
 *  @description
 *  refine a factory function - the resulting factory will 
 *  apply the given fst to all produced objects.
 *
 *  @param {object} current_impl  the object that contains the factory function
 *  @param {string} attribute_name  the name of the property of the factory function in current_impl
 *  @param {object} element_fst  the fst that needs to be applied to objects produced by the factory
 **/
featuremonkey._factory_refine = function(current_impl, attribute_name, element_fst) {
    var original = current_impl[attribute_name]
    //inject factory refinement
    current_impl[attribute_name] = function() {
        //proxy to original factory
        var element = original.apply(current_impl, arguments)
        //compose element and return it
        return featuremonkey._compose(element_fst, element)
    }
}

/**
 *  @public
 *  @description
 *  compose a fst and an implementation.
 *
 *  This places <tt>superimposable_fst</tt> on top of <tt>current_impl</tt>.
 *  
 *  @param {object} superimposable_fst  fst that is placed on an implementation
 *  @param {object} current_impl  implementation that the fst is placed on
 **/
featuremonkey._compose = function(superimposable_fst, current_impl) {

    $.each(superimposable_fst, function(key, value) {
        if (key.indexOf('refine_') === 0) {
            var attr = key.substring('refine_'.length)
            if (current_impl[attr] == undefined) {
                throw featuremonkey.CompositionError('cannot refine "' + attr + '"! Original has no such property!')
            }
            featuremonkey._refine(current_impl, attr, value)

        } else if (key.indexOf('factory_refine_') === 0) {
            var attr = key.substring('factory_refine_'.length)
            if (current_impl[attr] == undefined) {
                throw featuremonkey.CompositionError('cannot refine factory "' + attr + '"! Original has no such property!')
            }
            featuremonkey._factory_refine(current_impl, attr, value)

        } else if (key.indexOf('introduce_') === 0) {
            var attr = key.substring('introduce_'.length)
            if (current_impl[attr] != undefined) {
                throw featuremonkey.CompositionError('cannot introduce "' + attr + '"! Original already contains such a key!')
            }
            featuremonkey._introduce(current_impl, attr, value)

        } else if (key.indexOf('child_') === 0) {
            var attr = key.substring('child_'.length)
            if (current_impl[attr] == undefined) {
                throw featuremonkey.CompositionError('cannot apply refinement on "' + attr + '"! Original has no such property!')
            }
            featuremonkey._compose(value, current_impl[attr])
        }
    })

    return current_impl
}

/**
 *  @description
 *  compose multiple fsts and an implementation.
 *
 *  @param {...} varargs  the implementation must be the last parameter preceded by one or multiple fsts
 *  fsts are composed from right to left - the leftmost fst is composed last!
 *  
 *  @throws {string} CompositionError
 **/
featuremonkey.compose = function(varargs) {

    var args = Array.prototype.slice.call(arguments)
    var base_impl = args.pop()
    var refinement_fsts = args
    var current = base_impl

    while(refinement_fsts.length > 0) {
        current = featuremonkey._compose(refinement_fsts.pop(), current)
    }

    return current
}
;
