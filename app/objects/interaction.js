import Ember from 'ember';

export default Ember.Object.extend({
    
	type : null,
	subType : null,
	shuffle: null,
	minChoices: null,
	maxChoices: null,
	expectedLength: null,
	label: null,
	prompt: null,
	answerChoices: null, //id, text, media, mediaType, fixed, orderPriority
	correctResponse: null, //id, value[ids], ordered

    /**
    * Please NOT REMOVE this method, we need initialize all atributes to use JSON.stringify
    * For more information http://byronsalau.com/blog/convert-ember-objects-to-json/
    **/
    initObject:function() {
        this.setProperties({
            type: "",
            subType: "",
            minChoices: 0,
            maxChoices: 0,
            shuffle: true,
            expectedLength: 0,
            label: "",
            prompt: "",
            answerChoices: [],
            correctResponse: {},
            tools: []
        });
    }.on('init'),

    /**
    * Insert a new answer choice
    **/
    addAnswerChoice: function(id, text, media, mediaType, fixed, orderPriority){
    	var object = this;
    	object.get("answerChoices").push({"id": id,
    									  "text": text,
    									  "media": media,
    									  "mediaType": mediaType,
    									  "fixed": fixed,
    									  "orderPriority": orderPriority});
    	object.set("expectedLength", object.get("answerChoices").get("length"));
    },

    addTool: function(name) {
        this.get('tools').push(name);
    },

    /**
    * Insert the correct response
    **/
    setCorrectResponse: function(id, value, ordered){
    	var object = this;
        object.set("correctResponse", {"id": id, "value":value, "ordered": ordered});
    },

    /**
    * Convert to Json because the REST is waiting for JSON Object.
    * This Object was created only to set values easier
    **/
    getJson: function(){
        var object = this;
        return JSON.parse(JSON.stringify(object));
    }
});
