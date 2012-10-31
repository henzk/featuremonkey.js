featuremonkey.compose(
    {
        child_main: {
            introduce__filter_predicate: function(self) {
                return function(model) {return true}
            },
            introduce_set_filter_predicate: function(self) {
                return function(predicate) {
                    self._filter_predicate = predicate
                }
            },
            introduce_get_filter_predicate: function(self) {
                return function() {
                    return self._filter_predicate
                }
            },
            introduce_update_filter: function(self) {
                return function() {
                    $.each(self.items, function(index, item) {
                        if (self.get_filter_predicate()(item.model)) {
                            item.dom.main.show()
                        } else {
                            item.dom.main.hide()
                        }
                    })
                }
            },
            introduce_init_filterbar: function(self) {
                return function() {
                    self.dom.filterbar = $('<div/>', {
                        id: 'filterbar'
                    })
                    self.dom.filter_show_all = $('<a>all</a>')
                    self.dom.filter_show_todo = $('<a>todo</a>')
                    self.dom.filter_show_done = $('<a>done</a>')
                    self.dom.filterbar
                        .append(self.dom.filter_show_all)
                        .append(self.dom.filter_show_todo)
                        .append(self.dom.filter_show_done)

                    self.dom.main.prepend(self.dom.filterbar)

                    self.dom.filter_show_all.click(function() {
                        self.dom.filterbar.find('.current').removeClass('current')
                        self.dom.filter_show_all.addClass('current')
                        self.set_filter_predicate(function(model) {
                            return true
                        })
                        self.update_filter()
                    })
                    self.dom.filter_show_todo.click(function() {
                        self.dom.filterbar.find('.current').removeClass('current')
                        self.dom.filter_show_todo.addClass('current')
                        self.set_filter_predicate(function(model) {
                            return !model.done
                        })
                        self.update_filter()
                    })
                    self.dom.filter_show_done.click(function() {
                        self.dom.filterbar.find('.current').removeClass('current')
                        self.dom.filter_show_done.addClass('current')
                        self.set_filter_predicate(function(model) {
                            return model.done
                        })
                        self.update_filter()
                    })
                }
            },
            refine_init: function(original, self) {
                return function() {
                    var el = original()
                    self.init_filterbar()
                    return el
                }
            }
        }
    },
    todos
)
