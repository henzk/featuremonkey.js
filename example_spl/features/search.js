featuremonkey.compose(
    {
        child_main: {
            refine_get_filter_predicate: function(original, self) {
                return function() {
                    var predicate = original()
                    return function(model) {
                        return predicate(model) && self.search_predicate(model)
                    }
                }
            },
            refine_init_filterbar: function(original, self) {
                return function() {
                    original()
                    self.dom.searchbar = $('<input/>', {
                        type: 'text'
                    })
                    self.dom.filterbar.prepend(self.dom.searchbar)
                    self.dom.searchbar
                        .keyup(self._searchbar_change)
                }
            },
            introduce_search_predicate: function(self) {
                return function(model) {
                    if (!self._search_str) return true
                    if (model.label.indexOf(self._search_str) !== -1) {
                        return true
                    }
                    return false
                }
            },
            introduce__searchbar_change: function(self) {
                return function() {
                    self._search_str = self.dom.searchbar.val()
                    self.update_filter()
                }
            }
        }
    },
    todos
)
