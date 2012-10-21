/**
 *  featuremonkey.js - FOP for JavaScript
 *  https://github.com/henzk/featuremonkey.js
 *
 *  (c) Hendrik Speidel - http://schnapptack.de/
 *  License: MIT
 **/
var featuremonkey = {}

/**
 *  thrown when things go south during composition
 *  seems best to use simple strings here - there seems to be no
 *  way to inspect thrown objects in webkit inspector...
 **/
featuremonkey.CompositionError = function(msg) {
    return 'featuremonkey.CompositionError: ' + msg
}

/**
 *  refine a property
 *
 *  current_impl - the object containing the property
 *  attribute_name - the name of the property to refine
 *  refinement - refinement to apply to the property
 *
 *  If refinement is not a function, its value is used as 
 *  the refined implementation of the property.
 *  If refinement is a function `func`, `func(original, self)` is called 
 *  to obtain the refined implementation of the property.
 *  `original` is the original implementation of the property;
 *  `self` is a reference to the object containing the property
 *  and may be useful when refining methods.
 **/
featuremonkey._refine = function(current_impl, attribute_name, refinement) {
    if (typeof refinement == 'function') {
        current_impl[attribute_name] = refinement(current_impl[attribute_name], current_impl)
    } else {
        current_impl[attribute_name] = refinement
    }
}

/**
 * introduce a property
 *
 *  current_impl - the object containing the property
 *  attribute_name - the name of the property to refine
 *  introduction - description of the property to introduce
 *
 *  Introductions are specified analogous to refinements.
 *  If introduction is not a function, its value is used as 
 *  value of the new property.
 *  If introduction is a function `func`, `func(self)` is called 
 *  to obtain the new value of the property.
 *  `self` is a reference to the object containing the property
 *  and may be useful when introducing methods.
 **/
featuremonkey._introduce = function(current_impl, attribute_name, introduction) {
    if (typeof introduction == 'function') {
        current_impl[attribute_name] = introduction(current_impl)
    } else {
        current_impl[attribute_name] = introduction
    }
}

/**
 *  refine a factory function - the resulting factory will 
 *  apply the given fst to all produced objects
 *
 *  current_impl - the object that contains the factory function
 *  attribute_name - the name of the property of the factory function in current_impl
 *  element_fst - the fst that needs to be applied to objects produced by the factory
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
 * compose a fst and an implementation
 *
 * superimposable_fst is placed on current_impl
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
 * compose multiple fsts and an implementation
 *
 * the implementation must be the last parameter preceded by one or multiple fsts
 * fsts are composed from right to left - the leftmost fst is composed last!
 **/
featuremonkey.compose = function() {

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
