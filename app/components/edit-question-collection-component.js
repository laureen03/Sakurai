SakuraiWebapp.EditQuestionCollectionComponent = Ember.Component.extend({

    question_set_name: null,
    invalid_qc_name: false,

    'reset-qc-error-action': "resetQCError",
    'edit-qc-action': "editQL",
    'edit-qc-name-action': "editNameQC",

    didInsertElement : function(){
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
        $("#edit-qc").validate({
            ignore: 'input[type=hidden]',
            onsubmit: false,
            rules: {
                qc_name: {
                    required: true,
                    maxlength: 50,
                    regex: "^[A-Za-z0-9 _]*[A-Za-z0-9][A-Za-z0-9 _]*$"
                },
            },
            messages: {
                qc_name: {
                    required: I18n.t('questionLibrary.nameRequired'),
                    maxlength: I18n.t('classes.errorMaxLegth'),
                }
            }
        });
    },

    keyDown:function(event){
        if(event.keyCode === 13){
            this.sendAction('edit-qc-action');
            event.preventDefault();
            event.stopPropagation();
            // return false;
        }
    },

    actions: {
        resetQCError: function() {
            this.sendAction('reset-qc-error-action');
        },

        editQL: function() {
            this.sendAction('edit-qc-action');
        }
    }

});
