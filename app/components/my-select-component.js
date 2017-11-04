SakuraiWebapp.MySelectComponent = Ember.Component.extend({

  tagName: 'select',
  content: null,
  selectedValue: null,
  groupContent: null,
  optionValuePath : null,
  optionLabelPath : null,
  attributeBindings: ['selectedValue', 'disabled', 'multiple'],


  groupContent: Ember.computed('content.[]', function(){ 
      var self = this,
          newList= [],
          groupName = "",
          group = null;
      $.each(self.get("content"), function( index, value ) {
        if (groupName != value.group){
          if (group!= null)
            newList.push(group);
          group = new Object();
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
        self.get("content").forEach(function(content) {
          if (content.store){ //Is a DS object
            self.addOption(newList, content, false);
          }else{
            self.addOption(newList, content, true);
          }
        });  
      }
      return newList;
  }),

  addOption: function(array, content, isJSON){
    var self=this;
    if (self.get("optionValuePath") && self.get("optionLabelPath"))
      if (isJSON)
        array.push({"id": content[self.get("optionValuePath")], "name": content[self.get("optionLabelPath")]});
      else
        array.push({"id": content.get(self.get("optionValuePath")), "name": content.get(self.get("optionLabelPath"))});
    else
      array.push({"id": content, "name": content}); 
  },

  change: function() {
    this.set("selectedValue", this.$("option").filter(":selected").val());
  }

});