SakuraiWebapp.LibraryCreateQuestionCollectionController = Ember.Controller.extend(
    Ember.Evented,
    SakuraiWebapp.ControllerMixin, {

	//Reference another contoller
	library: Ember.inject.controller(),

	//Name of Question Library
	qcName: "",

	//Variables if the modal is for copy Question Collection
	isCopyQc: false,

	//Variables with QC need to duplicate
	questionSet: null,

	//Variable with question need to add a new question collection
	question: null,

	/**
	 * @property {bool}
	 */
	invalidQCName: false,

	setQCName: Ember.observer('questionSet', function(){
		var questionSet = this.get("questionSet");
		if (questionSet != null)
			this.set("qcName", questionSet.get("name") + " copy");

	}),

	/*-----------------------------------------------
                          I N I T
        _________________________________________________*/
        initController: function () {
            this._super();
            
            var self = this;

            Ember.run.schedule("afterRender",this,function() {

                /*****************************************
                *  Set validation to Form and messages
                *******************************************/
                $.validator.addMethod(
                    "regex",
                    function(value, element, regexp) {
                        var re = new RegExp(regexp);
                        return this.optional(element) || re.test(value);
                    },
                    I18n.t('classes.errorSpecialCharacter')
                );
                // validate form
                $("#add-qc").validate({
                    ignore: 'input[type=hidden]',
                    onsubmit: false,
                    rules: {
                        name_qc: {
                            required: true,
                            maxlength: 50,
                            regex: "^[A-Za-z0-9 _]*[A-Za-z0-9][A-Za-z0-9 _]*$"
                        }
                    },
                    messages: {
                        name_qc: {
                            required: I18n.t('questionLibrary.nameRequired'),
                            maxlength: I18n.t('classes.errorMaxLegth')
                        }
                    }
                });

                $('#add-qc').bind("keypress", function(e) {
                  var KEYCODE = ( document.all ? window.event.keyCode : e.which) ;
                    self.set("invalidQCName", false);
                  if (KEYCODE == 13) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                });

            });
        }.on('init'),

	/**
	* Clean the modal
	**/
	resetValues: function(){
		this.set("qcName", "");
		this.set("isCopyQc", false);
		this.set("questionSet", null);
		this.set("question", null);
        this.set("invalidQCName", false);
		//Clear Validator
		var validator = $("#add-qc").validate();
		validator.resetForm();
		validator.reset();
	},

	/**
	* Create New question Collection
	**/
	createNewQC: function(data){
		var controller = this;
		var store = this.store;
		var authenticationManager = SakuraiWebapp.context.get('authenticationManager');
		var user = authenticationManager.getCurrentUser();
		var question = controller.get("question");
		user.then(function(user){
			var newQC = store.createRecord("questionSet",{
				product: controller.get('library').get("product"),
				name: controller.get("qcName"),
				user: user
			});

			if (question!= null){
				newQC.get('questions').then(function(questions){
					questions.pushObject(question);
					controller.saveQC(newQC, data);
				});
			}
			else {
                controller.saveQC(newQC, data);
            }
		});
	},

	saveQC: function(newQC, data){
		var controller = this;
		var promise = newQC.save();

		promise.then(function(qcCreated){
			controller.get('library').addQuestionCollection(qcCreated);
            controller.trigger('asyncButton.restore', data.component);
			$('#createql-mdl').modal('hide');
			controller.resetValues();
			//Have a question
			if (qcCreated.get("totalQuestions") == 1){
				toastr.success(I18n.t('questionLibrary.messages.success') + ' ' + qcCreated.get("name"));
			}
		});
	},



	/**
	* Copy question Collection
	**/
	copyQC: function(data){
		var controller = this;
		var store = this.store;
		if ($("#add-qc").valid() && controller.isQCNameValid(controller.get("qcName"))) {
			var questionSet = controller.get("questionSet");
			var name = controller.get("questionSetName");
			SakuraiWebapp.QuestionSet.fetch(questionSet)
				.then(function(questionSet){
					var newQC = store.createRecord("questionSet",{
						name: controller.get("qcName"),
						totalQuestions: questionSet.get("totalQuestions")
					});

					newQC = controller.resolveQuestionSet(questionSet, newQC);

					newQC.then(function(_newQC){
					var promise = _newQC.save();
					promise.then(function(qcCreated){
                        controller.trigger('asyncButton.restore', data.component);
						$('#createql-mdl').modal('hide');
						controller.get('library').addQuestionCollection(qcCreated);
						controller.resetValues();
					});
				});
			});
		}
	},

	isQCNameValid: function(name) {
		var controller = this;
		var questionSetList = controller.get('library').get('questionSets');
		for (var i = 0; i < questionSetList.content.length; i++) {
            var qcName = questionSetList.content[i]._data.name;
			if (name.toLowerCase().trim() === qcName.toLowerCase().trim() && questionSetList.content[i]._data.enabled && questionSetList.nextObject(i).get("parentOwner").get("id") == undefined) {
				controller.set("invalidQCName", true);
				return false;
			}
		}
		return true;
	},

	resolveQuestionSet: function(questionSet, newQC){
		return new Ember.RSVP.Promise(function(resolve, reject){
			Ember.RSVP.Promise.all([
				questionSet.get("product"),
				questionSet.get("user"),
				questionSet.get("questions")
				]).then(function (values) {
					newQC.set('product', values[0]);
					newQC.set('user', values[1]);
					newQC.get('questions').then(function(questions){
						questions.pushObjects(values[2]);
						resolve(newQC);
					});
				});
		});
	},


	actions:{
		create_qc: function(data){
            var controller = this;
			if ($("#add-qc").valid() && controller.isQCNameValid(controller.get("qcName"))) {
				if (this.get("isCopyQc"))
					this.copyQC(data);
				else
					this.createNewQC(data);
			}
            else{
                controller.trigger('asyncButton.restore', data.component);
            }
		},

		cancel: function(){
			this.resetValues();
		}
	}

});
