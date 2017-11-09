import Ember from "ember"; 

export default Ember.Component.extend({

  tagName: 'select',
  content: null,
  selectedValue: null,
  attributeBindings: ['selectedValue', 'content'],
  questionSet: null,
  onChangeAction : null,
  "data-change-action" : "onOrderList",

  groupContent: Ember.computed('content.[]', function(){ 
      var self = this,
          newList= [],
          groupName = "",
          group = null;
      $.each(self.get("content"), function( index, value ) {
        if (groupName !== value.group){
          if (group!= null){
            newList.push(group);
          }
          group = new Object({});
          group.name = value.group;
          group.children = [];
          self.addOption(group.children, value);
        }else{ //Same Group
          self.addOption(group.children, value);
        }
        groupName = value.group;
      });

      newList.push(group);

      return newList;
  }),

  plainContent: Ember.computed('content.[]', function(){  //Return same content
      var self=this,
          newList = [];

      if (self.get("content")){    
        $.each(self.get("content"), function( index, content ) {
          self.addOption(newList, content);
        });  
      }
      return newList;
  }),

  addOption: function(array, content){
    var self=this;
    if (self.get("optionValuePath") && self.get("optionLabelPath")){
      array.push({"id": content[self.get("optionValuePath")], "name": content[self.get("optionLabelPath")]});
    }
    else{
      array.push({"id": content, "name": content}); 
    }
  },

  change: function() {
    var self = this;
    self.set("selectedValue", self.$("option").filter(":selected").val());
    self.sendAction("data-change-action", self.get("questionSet"), self.get("selectedValue"));
  }

});