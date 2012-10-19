$(document).ready(function(){

    function get_base_feature() {
        var self = {
            primitive_i: 1,
            primitive_ii: 'abc',
            func_i: function() {return 1},
        }
        self.func_ii = function() {return self.func_i()}
        
        return self
    }


    //introduction tests

    test("introduce primitive", function() {
        var base = get_base_feature()

        var fst = {
            introduce_primitive_iii: 123,
            introduce_primitive_iv: 'xyz'
        }

        featuremonkey.compose(fst, base)

        equal(base.primitive_i, 1, 'primitive_i still available')
        equal(base.primitive_ii, 'abc', 'primitive_ii still available')
        equal(base.func_i(), 1, 'func_i still available')
        equal(base.func_ii(), 1, 'func_ii self pointer still works')

        equal(base.primitive_iii, 123, 'introduced integer')
        equal(base.primitive_iv, 'xyz', 'introduced str')
    })

    test("introduce func", function() {
        var base = get_base_feature()

        var fst = {
            introduce_func_iii: function(self) {
                return function(a, b) {
                    return a + b
                }
            },
            introduce_func_iv: function(self) {
                return function(a, b) {
                    return a + b + self.primitive_i
                }
            }
        }

        featuremonkey.compose(fst, base)

        equal(base.primitive_i, 1, 'primitive_i still available')
        equal(base.primitive_ii, 'abc', 'primitive_ii still available')
        equal(base.func_i(), 1, 'func_i still available')
        equal(base.func_ii(), 1, 'func_ii self pointer still works')

        equal(base.func_iii(2, 3), 5, 'introduced func')
        equal(base.func_iv(2, 3), 6, 'introduced func that uses self')
    })

    test("introduce existing stuff", function() {
        var base = get_base_feature()

        var fst = {
            introduce_primitive_i: 1
        }

        throws(
            function() {
                featuremonkey.compose(fst, base)
            },
            'introduced existing structure(and got exception)'
        )

    })

    //refinement tests

    test("refine primitive value no original", function() {
        var base = get_base_feature()

        var fst = {
            refine_primitive_i: 2,
            refine_primitive_ii: 'xyz'
        }

        equal(base.primitive_i, 1, 'primitive_i is 1 before compose')
        equal(base.primitive_ii, 'abc', 'primitive_ii is "abc" before compose')
        featuremonkey.compose(fst, base)
        equal(base.primitive_i, 2, 'primitive_i is 2 after compose')
        equal(base.primitive_ii, 'xyz', 'primitive_ii is "xyz" before compose')
    })

    test("refine primitive value using original", function() {
        var base = get_base_feature()

        var fst = {
            refine_primitive_i: function(original) {
                return original + 1
            },
            refine_primitive_ii: function(original) {
                return original + 'xyz'
            }
        }

        equal(base.primitive_i, 1, 'primitive_i is 1 before compose')
        equal(base.primitive_ii, 'abc', 'primitive_ii is "abc" before compose')
        featuremonkey.compose(fst, base)
        equal(base.primitive_i, 2, 'primitive_i is 2 after compose')
        equal(base.primitive_ii, 'abcxyz', 'primitive_ii is "xyz" before compose')
    })

    test("refine function no original", function() {
        var base = get_base_feature()

        var fst = {
            refine_func_i: function(original) {
                return function() {return 42}
            }
        }

        equal(base.func_i(), 1, 'func_i returns 1 before compose')
        featuremonkey.compose(fst, base)
        equal(base.func_i(), 42, 'func_i returns 42 after compose')
    })

    test("refine function and use original", function() {
        var base = get_base_feature()

        var fst = {
            refine_func_i: function(original) {
                return function() {return original() + 42}
            }
        }

        equal(base.func_i(), 1, 'func_i returns 1 before compose')
        featuremonkey.compose(fst, base)
        equal(base.func_i(), 43, 'func_i returns 43 after compose')
    })

    test("refine non-existing function", function() {
        var base = get_base_feature()

        var fst = {
            refine_func_xiii: function(original) {
                return function() {return original() + 42}
            }
        }

        throws(
            function() {
                featuremonkey.compose(fst, base)
            },
            'refined non-existing structure(and got exception)'
        )
    })

})
