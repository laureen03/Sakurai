SakuraiWebapp.InstructorPartialHmcdStudentUsageController = Ember.Controller.extend(
    SakuraiWebapp.ControllerMixin,
    SakuraiWebapp.FeatureMixin,
    {
    instructorHmcd: Ember.inject.controller(),
    instructorPartialHmcdMisconceptions: Ember.inject.controller(),

    hmcdMisconceptions: Ember.computed.alias('instructorPartialHmcdMisconceptions'),

	class: Ember.computed.alias("instructorHmcd.class"),

    product: Ember.computed.alias('class.product'),

	/**
    * @property {SortableHelper|StudentUsage[]} sortable for student usage
    */
    studentUsageSortable: null,

    /**
     * @property {String} selected name for student usage
     */
    studentName: null,

    /**
     * @property {number} selected student id for student usage
     */
    studentId: null,

    /**
     * @property {false} remediation State
     */
    isFullQuestionRemediation: false,

	controllerSetup: function(){
        this.set("studentUsageSortable",
            SakuraiWebapp.SortableHelper.create({ sort: "user.lastName", direction:true }));
    }.on('init'),

    /**
     * @property return the header for the delete modal
     */
    deleteHeader: Ember.computed('studentName', function(){
        return  I18n.t('hmcd.studentUsage.remove') + this.get("studentName") + ' ' + I18n.t('hmcd.studentUsage.fromClass') ;
    }),


    /**
     * {bool} Indicates if the ccm manage roster is enabled
     */
    ccmStudentRosterEnabled: Ember.computed("isCCMAllowed", "isInFrame", function(){
        return this.get("isInFrame") && this.get("isCCMAllowed");
    }),

    /**
     * {bool} Indicates if the remote student functionality is enabled
     */
    removeStudentEnabled: Ember.computed("isCCMAllowed", "isRemediationLinkAllowed", function(){
        return !this.get("isCCMAllowed") && !this.get("isRemediationLinkAllowed");
    }),

    /**
     * if we are showing studentUsageDownload link
     * @property {Bool}
     */
    showStudentUsageDownload: Ember.computed("studentUsageDownload", function(){
        return this.showModuleByToggle("studentUsageDownload");
    }),

    /**
     * @property {Ember.A} remediation link views
     */
    remediationLinkViews: Ember.A(),

    /**
     * @property {string} user for the corresponding login information (@see loginModelData)
     */
    loginModalUser: null,

    /**
     * @property {string} range of the login information. A string of the form:
     * YYYY-MM-DD:YYYY-MM-DD, where the first date refers to the start date and the
     * second date refers to the end date of the login infomation. Whenever this value
     * is updated, a new request is made to the server to get new login model data (@see loginModelData)
     */
    loginModalDataRange: null,

    /**
     * @property {SakuraiWebapp.Login} login information for a specific user
     */
    loginModalData: {},

    updateLoginModalData: Ember.observer('loginModalDataRange', function () {
        var self = this,
            dateRange = self.get('loginModalDataRange'),
            user = self.get('loginModalUser');

        dateRange = this.parseDateRange(dateRange);

        if (dateRange && dateRange.length == 2) {
            self.store.query("login", {  userId: user.get('id'),
                                        productId: self.get('product').get('id'),
                                        startDate: moment(dateRange[0]).format('YYYY-MM-DD'),
                                        endDate: moment(dateRange[1]).format('YYYY-MM-DD') })
                .then( function(logins) {
                    self.set('loginModalData', logins && logins.objectAt(0));
                }, function(reason) {
                    Ember.Logger.error(self.toString() + ': Error retrieving login modal data -' + reason);
                    self.set('loginModalData', {});
                });
        } else {
            self.set('loginModalData', {});
        }

    }),

    parseDateRange: function(dateRangeString) {
        var dateRange;

        if (dateRangeString) {
            Ember.Logger.assert(typeof dateRangeString == 'string');

            dateRange = dateRangeString.split(':');

            Ember.Logger.assert(dateRange.length == 2);

            dateRange[0] = moment(dateRange[0], 'YYYY-MM-DD');
            dateRange[1] = moment(dateRange[1], 'YYYY-MM-DD');

            Ember.Logger.assert(dateRange[0].isValid());
            Ember.Logger.assert(dateRange[1].isValid());

        } else {
            dateRange = null;
        }

        return dateRange;
    },

    /**
    *  Init values for Student Usage
    **/
	initStudentUsage:function(studentUsage){
		this.loadStudentUsageIfNecessary(studentUsage);
	},

	/**
     * Loads the student usage information if necessary
     */
    loadStudentUsageIfNecessary: function(studentUsage){
        var controller = this;
        var sortable = controller.get('studentUsageSortable');

        var userPromises = studentUsage.map( function(item) {
            return item.get('user');
        });
        Ember.RSVP.all(userPromises).then( function() {
            // Set studentUsage data until we have all the user information
            // Otherwise, sorting by user.lastName before having all the user
            // data won't be accurate
            sortable.set("data", studentUsage);
        });
    },

    /**
     * Removes the student usage
     * @param studentId
     */
    removeStudentUsage: function(studentId){
        var studentUsage = this.get("studentUsageSortable").get("collection");
        studentUsage.forEach(function(item, index){
            item.get("user").then(function(user){
                if (user.get("id") == studentId){
                    studentUsage.removeAt(studentUsage.indexOf(item), 1);
                }
            });
        })
    },

    /* Clean Values */
    resetValues: function(){
    	this.get('studentUsageSortable').set("direction", true);
        this.get('studentUsageSortable').set("sort", "user.lastName");
    },

    /**
     * @properties to create show more details apllied ONLY in mobile
     */
    showStudentUsageDetails:function(idx,quizzesCompleted,masteryLevel){
        $('#mob-details').remove();

        var _quizzesComp;
        var _masteryLevel = numeral(masteryLevel).format('0.00');

        if(quizzesCompleted >= 0){
            _quizzesComp = quizzesCompleted;
        }else{
            quizzesCompleted = '-';
        }

        if( $('.studentUsage-table [data-arrow="'+idx+'"]').hasClass('glyphicon-chevron-up')){
            $('.studentUsage-table [data-arrow="'+idx+'"]').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
            $('#mob-details').remove();
        }else{
            $('.glyphicon-chevron-up').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
            $('.studentUsage-table [data-arrow="'+idx+'"]').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
            var el = $('[data-pos-su="'+idx+'"]');
            el.after('<tr id="mob-details" class="visible-xs" ><td colspan="4"> <div>'+
                '<div class="mdetails-row"> <span class="mTitle">'+I18n.t('hmcd.studentUsage.quizzesCompleted')+
                ':</span> <span class="mDesc">'+_quizzesComp+'</span> </div>' +
                '<div class="mdetails-row"> <span class="mTitle">'+I18n.t('hmcd.studentUsage.masteryLevel')+
                ':</span> <span class="mDesc">'+_masteryLevel+'</span> </div>' +
                '</div></td></tr>');
        }
    },

    actions:{
    	onSortByCriteria: function(sortableId, criteria){
            var controller = this;
            controller.sortByCriteria(sortableId, criteria);
        },

    	setDeleteModal: function(studentId,studentName){
            this.set('studentName',studentName);
            this.set('studentId',studentId);
            $('#deleteStudent-mdl').modal('show');
        },

        showMoreStudentUsage:function(idx,quizzesCompleted,masteryLevel){
            this.showStudentUsageDetails(idx,quizzesCompleted,masteryLevel);
        },

        openStudentView: function(studentId){
            var controller = this;
            var url = "/student/haid/" + this.get("class").get("id") + "?studentId=" + studentId;
            var isTesting = SakuraiWebapp.context.isTesting();
            var isInFrame = this.get("isInFrame");
            //checking for is testing because it is not possible to open a new window while testing
            if (isTesting || isInFrame){
                controller.transitionToRoute(url);
            }
            else{
                window.open("#" + url, "_blank");
            }
        },

        deleteStudent: function(){
            var controller = this;
            var classId     = controller.get('class').get('id'),
                studentId   = controller.get('studentId'),
                store       = controller.store;

            var promise = SakuraiWebapp.Enrollment.deleteEnrollmentRecord(store,
                {
                    classId: classId,
                    studentId: studentId
                });

            promise.then(function(removed){
                if (removed){
                    $('#deleteStudent-mdl').modal('hide');
                    controller.removeStudentUsage(studentId);
                }
                else{
                    alert("Not removed");
                }
            });
        },

        /**
         *
         * @param {number} userId
         */
        showRemediationLinkViews: function(userId){
            var controller = this;
            var store = this.store;
            var clazz = this.get("class");
            var promise = store.query("remediationLinkView", { classId: clazz.get("id"), userId: userId });
            promise.then(function(remediationLinkViews){
                referenceViews = store.query("referenceView", {userId: userId, productId: controller.get("product").get("id")}).then(function(data){
                    controller.get("remediationLinkViews").clear();
                    if(controller.get("isRemediationLinkAllowed"))
                        controller.get("remediationLinkViews").pushObjects(remediationLinkViews.toArray());
                    if(controller.get("isReferenceLinksAllowed")){
                        controller.get("remediationLinkViews").pushObjects(data.toArray());
                    }
                    controller.set("isFullQuestionRemediation", false);
                    $("#remediation-link-views-mdl").modal("show");

                SakuraiWebapp.MobileUtil.reDrawModalPositionIfNecessary('.remediation-link-views','.studentUsage-table')
                });                
            });
        },

        getUserLogins: function(user) {
            var today = moment(),
                startDate = moment(new Date(today.year(), today.month() -1, 1)),
                dateRange = startDate.format('YYYY-MM-DD') + ':' + today.format('YYYY-MM-DD');

            this.set('loginModalUser', user);
            this.set('loginModalDataRange', dateRange);
        },

        /**
         *
         * @see SakuraiWebapp.InstructorPartialHmcdStudentUsageView
         */
        onCloseRemediationLinkModal: function(){
            /*
             Check PUSAK-1041
             this is necessary because remediation link views request also brings
             question information, but it doesn't include stats, so the misconception
             tab is wrongly updated, this is a workaround, a better approach would
             be to have a unbound block helper on the template, but it is not supported
             yet by ember. @TODO use the block helper
             */
            var controller = this;
            controller.get("hmcdMisconceptions").refreshMisconceptions();
            $('#remediation-link-views-mdl').off('hidden.bs.modal');
        }
    }
});
