var todos = {}

todos.models = {}

todos.models.todo_list = [
    {
        done: false,
        label: 'get milk'
    },
    {
        done: false,
        label: 'call mom'
    }
]

todos.main = (function() {
    var self = {}
    self.model = todos.models.todo_list
    self.dom = {
        main:null,
        todolist:null
    }
    self.items = []

    self.init = function() {
        self.dom.main = $('<div/>').addClass('todos')
        self.dom.add_button = $('<a href="#">Add</a>').addClass('add-button')
        self.dom.todolist = $('<ul/>').addClass('todolist')
        self.dom.main.append(self.dom.add_button)
        self.dom.main.append(self.dom.todolist)
        $('body').append(self.dom.main)
        
        self.dom.add_button.click(function() {
            var itemmodel = {
                done: false,
                label: 'New task'
            }
            self.model.splice(0, 0, itemmodel)
            var item = todos.Todo(itemmodel)
            self.items.push(item)
            self.dom.todolist.prepend(item.init())
            return false
        })
    }
    self.refresh_list = function() {
        self.items.splice(0, self.items.length)
        self.dom.todolist.empty()
        $.each(self.model, function(index, value) {
            var item = todos.Todo(value)
            self.items.push(item)
            self.dom.todolist.append(item.init())
        })
    }
    self.refresh = function() {
        self.refresh_list()
    }
    return self
})()

todos.Todo = function(model) {
    var self = {}
    self.model = model
    self.dom = {
        main: $('<li/>')
    }

    self.refresh = function() {
        self.dom.done.prop('checked', self.model.done)
        self.dom.label.text(self.model.label)
        if (self.model.done) {
            self.dom.label.addClass('done')
        } else {
            self.dom.label.removeClass('done')
        }
    }

    self._done_changed = function() {
        self.model.done = self.dom.done.prop('checked')
        if (self.dom.done.prop('checked')) {
            self.dom.label.addClass('done')
        } else {
            self.dom.label.removeClass('done')
        }
        return false
    }

    self._label_click = function() {
        self.dom.labeledit.val(self.model.label)
        self.dom.label.hide()
        self.dom.labeledit.show().focus()
        return false
    }

    self._labeledit_blur = function() {
        self.model.label = self.dom.labeledit.val()
        self.dom.label.text(self.model.label)
        self.dom.label.show()
        self.dom.labeledit.hide()
        return false
    }

    self.init = function() {
        self.dom.done = $('<input/>', {
            type: 'checkbox'
        })
        self.dom.label = $('<span/>').addClass('label')
        self.dom.labeledit = $('<input/>', {
            type: 'text'
        }).css('display', 'none')

        self.dom.main.append(self.dom.done)
        self.dom.main.append(self.dom.label)
        self.dom.main.append(self.dom.labeledit)

        self.dom.done.change(self._done_changed)
        self.dom.label.click(self._label_click)
        self.dom.labeledit.blur(self._labeledit_blur)
        self.dom.labeledit.keypress(function(event){
            var keycode = (event.keyCode ? event.keyCode : event.which)
            if(keycode == '13') {self._labeledit_blur()}
        })

        self.refresh()
        return self.dom.main
    }

    return self
}

todos.init = function() {
    todos.main.init()
    todos.main.refresh()
}

$(function() {
    todos.init()
    $('#pagetitle').text(document.title)
})
