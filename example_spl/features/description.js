featuremonkey.compose(
    {
        factory_refine_Todo : {
            introduce_save_description: function(self) {
                return function() {
                    self.model.description = self.dom.description.val()
                }
            },
            introduce__main_click: function(self) {
                return function() {
                    self.dom.description.toggle()
                    self.save_description()
                    return false
                }
            },
            refine_init: function(original, self) {
                return function() {
                    var el = original()
                    self.dom.description = $('<textarea/>').hide()
                    self.dom.main.append(self.dom.description)
                    
                    self.dom.main.dblclick(self._main_click)
                    self.dom.description.blur(self.save_description)
                    return el
                }
            }
        }
    },
    todos
)
