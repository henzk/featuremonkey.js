var featuremonkey = {}

featuremonkey.CompositionError = function(msg) {
    return 'featuremonkey.CompositionError: ' + msg
}

featuremonkey._refine = function(attribute_name, refinement, current_impl) {
    if (typeof refinement == 'function') {
        current_impl[attribute_name] = refinement(current_impl[attribute_name], current_impl)
    } else {
        current_impl[attribute_name] = refinement
    }
}

featuremonkey._introduce = function(attribute_name, introduction, current_impl) {
    if (typeof introduction == 'function') {
        current_impl[attribute_name] = introduction(current_impl)
    } else {
        current_impl[attribute_name] = introduction
    }
}

featuremonkey._child_refine = function(attribute_name, child_fst, current_impl) {
    featuremonkey._compose(child_fst, current_impl[attribute_name])
}

featuremonkey._compose = function(superimposable_fst, current_impl) {

    $.each(superimposable_fst, function(key, value) {
        if (key.indexOf('refine_') === 0) {
            var attr = key.substring('refine_'.length)
            if (current_impl[attr] == undefined) {
                throw featuremonkey.CompositionError('cannot refine "' + attr + '"! Original has no such property!')
            }
            featuremonkey._refine(attr, value, current_impl)
        } else if (key.indexOf('introduce_') === 0) {
            var attr = key.substring('introduce_'.length)
            if (current_impl[attr] != undefined) {
                throw featuremonkey.CompositionError('cannot introduce "' + attr + '"! Original already contains such a key!')
            }
            featuremonkey._introduce(attr, value, current_impl)
        } else if (key.indexOf('child_') === 0) {
            var attr = key.substring('child_'.length)
            if (current_impl[attr] == undefined) {
                throw featuremonkey.CompositionError('cannot apply refinement on "' + attr + '"! Original has no such property!')
            }
            featuremonkey._child_refine(attr, value, current_impl)
        }
    })

    return current_impl
}

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
