import Ember from 'ember';

export function initialize(container, application) {
  	let SakuraiConfig = Ember.Object.extend({
		/**
		* @property {Object} Maps each question type code to its corresponding i18n key
		*/
		questionTypesMap: {
		multiple_choice: 'common.questionTypes.multipleChoice',
		choice_multiple: 'common.questionTypes.choiceMultiple',
		graphic_option: 'common.questionTypes.graphicOption',
		fill_in_the_blank: 'common.questionTypes.textEntry',
		hot_spot: 'common.questionTypes.hotSpot',
		drag_and_drop: 'common.questionTypes.dragDrop'
		},

		/**
		* @property {array} Array of objects with the question types that Sakurai works with.
		* Each object is of the form: {
		*   code: <string code for the question type>
		*   label: <i18n key>
		* }
		*/
		questionTypes: null,

		loadQuestionTypes: function() {
		// This was declared as a promise because the question types may eventually come from a service call
		return new Ember.RSVP.Promise(function (resolve) {

		    // This array may eventually come from a service call
		    resolve([
		        'multiple_choice',
		        'choice_multiple',
		        'graphic_option',
		        'fill_in_the_blank',
		        'hot_spot',
		        'drag_and_drop'
		    ]);
		});
		},

		initConfig: function() {

		var self = this;

		this.loadQuestionTypes().then( function( questionTypes ) {

		    var questionTypesMap = self.get('questionTypesMap'),
		        questionTypesObjects = questionTypes.map(function (questionType) {

		        // Assign the correct text label to each one of the question type codes
		        return Ember.Object.create({
		            code: questionType,
		            label: questionTypesMap[questionType]
		        });
		    });

		    self.set('questionTypes', questionTypesObjects);
		});

		}.on('init')
  	});

  	application.register('sakuraiConfig:main', SakuraiConfig);
  	application.inject('controller', 'sakuraiConfig', 'sakuraiConfig:main');
  	application.inject('component', 'sakuraiConfig', 'sakuraiConfig:main');
}

export default {
  name: 'sakuraiConfig',
  initialize: initialize
};