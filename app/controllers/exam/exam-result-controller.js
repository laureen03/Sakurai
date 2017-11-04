SakuraiWebapp.ExamResultController = Ember.Controller.extend(
    Ember.Evented,
    SakuraiWebapp.ControllerMixin,
    SakuraiWebapp.FeatureMixin,
    SakuraiWebapp.QuestionPartialMixin, {
    headerClasses: Ember.inject.controller(),

    /**
     * @property {Class} current class information
     */
    class: null,

    /**
     * @property {ExamResult} exam result information
     */
    examResult: null,

    /**
     * @property {Exam} current exam information
     */
    exam: null,

    /**
     * @property {Assignment} current assignment related to exam, this may be null for non exam assignments
     */
    assignment: null,

    /**
     * @property {Question} Current question to see full question
     */
    currentQuestion: null,

    /**
     * @property {Boolean} Flag to know is a multiple choice see full question
     */
    isMultiple: false,

    /**
     * @property {String} String with the name of the component need to show into "See Full Question"
     */
    componentName: "question-choice",

    /**
     * @property {String} Filter Question Criteria
     */
    radioFilterVal: "all",

    /**
    * @property {Array} Answers Keys
    **/
    answerKeys: null,

    /**
     * @property {number} Total number of answers in the chart
     **/
    answerTotal: Ember.computed('answerKeys', function(){
        return this.get('answerKeys').get('length');
    }),

    /**
     * @property {number} Number of answers to show per page in the chart
     **/
    answerPageLength: 0,

    /**
     * @property {number} Current page number in the chart
     **/
    answerCurrentPage: 1,

    /**
     * @property {String} Product passing threshold lower limit
     */
    thresholdLowerLimit: 0,

    /**
     * @property {String} Product passing threshold upper limit
     */
    thresholdUpperLimit: 0,

    /**
     * @property {number}
     **/
    examMasteryThreshold: Ember.computed('assignment', function(){
        if (this.get("assignment")) {
            var result = this.get("assignment").get("examMasteryThreshold");
            return result;
        }
        return this.get("class").get("product").get("chartPassingThreshold");
    }),

    /**
     * @property {Array} List of filter for questions
     */
    filters: [{"label": I18n.t("exam.allQuestions"), "value": "all"},
              {"label": I18n.t("exam.incorrectAnswers"), "value": "incorrect"},
              {"label": I18n.t("exam.correctAnswers"), "value": "correct"}],

    /**
     * Function to show the filters"
     */
    filterQuestion: Ember.observer('radioFilterVal', function(){
        var controller = this;
        var filterCriteria = controller.get("radioFilterVal");
        $(".answerKey-content > .hide").removeClass("hide");
        if (filterCriteria === "incorrect"){
            $(".correct-answer").addClass("hide");
        }
        if (filterCriteria === "correct"){
            $(".incorrect-answer").addClass("hide");
        }
    }),

    /**
     * Indicates if the performance chart should be displayed
     * @property {bool}
     */
    displayChart: Ember.computed(function(){
        return !SakuraiWebapp.MobileUtil.xSmall();
    }),

    /**
     * @property {bool} indicates if it can increment the remediation link view
     * @see SakuraiWebapp.QuestionPartialMixin
     */
    canIncRemediationLinkView: Ember.computed(function(){
        return true;
    }),

    rotateElement: function(arrow, deg){
        arrow.css('-ms-transform', 'rotate('+deg+')'); /* IE 9 */
        arrow.css('-webkit-transform', 'rotate('+deg+')'); /* Chrome, Safari, Opera */
        arrow.css('transform', 'rotate('+deg+')');
    },

    actions:{
        showFullQuestion:function(answer, template){
        	var controller = this;
                controller.set("componentName", template);
        	answer.get("question").then(function(value) {
    			controller.set("currentQuestion", value);
    			//Check if is choice if is multiple or single choice
    			value.get("interactions").forEach(function(item) {
       	       		if (item.type === SakuraiWebapp.Question.CHOICE){
       	          		if ((item.maxChoices == 1) && (item.maxChoices == 1))
    				        controller.set("isMultiple", false);
    				    else
    				        controller.set("isMultiple", true);
    				}
    			});

    			$('#fullQuestion').modal('show');
    		});
        },

        onSectionDisplay: function(selector_id, section){
            var section_div = $('#'+section+'-content-'+selector_id),
                arrow = $('.arrow-'+section+'-'+selector_id);
            if (section_div.hasClass('hide')){
                this.rotateElement(arrow, '-30deg');
                section_div.removeClass('hide');
            }
            else{
                this.rotateElement(arrow, '0deg');
                section_div.addClass('hide');
            }
        },

        goToAnswerKey: function(index){
            var $this = $(this),
                scrollTo = 'answer-key-' + index;

            if ($('#' + scrollTo).hasClass('hide')){
                if (this.get("radioFilterVal") == "incorrect"){
                    $('.filter-questions input[type="radio"]:eq(2)').prop("checked",true)
                    this.set("radioFilterVal", "correct");
                }else{
                    $('.filter-questions input[type="radio"]:eq(1)').prop("checked",true)
                    this.set("radioFilterVal", "incorrect");
                }
            }

            $('html, body').animate({
                scrollTop: $('#' + scrollTo).offset().top
            }, 300);
        },

        /**
         * Resets default values
         */
        updateGraph: function(currentPage){
            this.set("answerCurrentPage", currentPage);
        }
    }

});

