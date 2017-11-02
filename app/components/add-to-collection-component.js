SakuraiWebapp.AddToCollectionComponent = Ember.Component.extend({
	/**
     * @property {String} search Criteria for textfield 
     */
	searchQCTerm: "",

	/**
     * @property {searchQuestionPlaceholder} placeholder for the input search
     */
    searchQuestionPlaceholder: I18n.t('questionLibrary.searchCollections'),

    /**
     * @property {string} create QC Question action
     */
    createQCWithQuestion: 'createQCWithQuestion',

    /**
     * @property {string} add to Collection action
     */
    addToCollection: 'addToCollection',
    
    /**
     *Observes and filter the search Criteria
     */
    questionSetsEnabledFiltered: Ember.computed('data-questionSetsEnabled','searchQCTerm', function(){
    	var component = this, 
    		searchQCTerm = component.get('searchQCTerm');
    		
    	return component.get('data-questionSetsEnabled').filter(function(item, index, enumerable){
			return (item.get('name').toLowerCase().indexOf(searchQCTerm.toLowerCase()) !== -1);
		});

    }),

    didInsertElement: function(){
        this.$('input').click(function(event) {
            event.stopPropagation();
        });
    },

    actions:{
    	createQCWithQuestion: function(question){
    		this.sendAction("createQCWithQuestion", question);
    	},

    	addToCollection: function(question,questionSet){
    		this.sendAction("addToCollection", question, questionSet);
    	}

    }


});