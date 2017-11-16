import DS from 'ember-data';
import Ember from "ember";
import Assignment from "sakurai-webapp/models/assignment";
import DateUtil from 'sakurai-webapp/utils/date-util';
import context from 'sakurai-webapp/utils/context';

export default DS.Model.extend({
    /**
     * @property {Assignment} parent assignment
     */
    parentAssignment: DS.belongsTo('assignment', {async: true, inverse: null}),

    /**
     * @property {string} type, mastery_level, question_collection
     */
    type: DS.attr('string'),

    /**
     * @property {string} name
     */
    name: DS.attr('string'),

    /**
     * @property {Chapter} assignment chapter
     */
    chapter: DS.belongsTo('chapter', { async: true }),

    /**
     * @property {number} assignment target mastery level
     */
    targetMasteryLevel: DS.attr('number'),

    /**
     * @property {Class[]} assignment classes
     */
    classes: DS.hasMany('class', { async: true }),

    /**
     * @propety {QuestionSet} question set
     */
    questionSet: DS.belongsTo('questionSet', { async : true }),

    /**
     * @property {number} assignment points
     */
    points: DS.attr('number'),

    /**
     * @property {string} indicates when to display the answer key
     */
    answerKeyView:  DS.attr('string'),

    /**
     * @property {number} indicates if a quiz has time limit
     */
    timeLimit:  DS.attr('number'),

    /**
     * @property {string} assignment time zone
     */
    timeZone:  DS.attr('string'),

    /**
     * @property {date} assignment available date
     */
    availableDate: DS.attr('date'),

    /**
     * @property {date} assignment due date
     */
    dueDate: DS.attr('date'),
    
    /**
     * @property {JSON} Custom dates for Classes
     */
    customDataByClass: DS.attr(), //[{idClass:1, dueDate: , availableDate, timezone, parentID}, {idClass:2, dueDate: , availableDate, timezone, autoSubmit}

    /**
     * @property {Bool} show what kind of assigment.
     */
    staggered: DS.attr('boolean'), 

    /**
     * @property {number} total questions completed by the student
     */
    numberQuestion: DS.attr('number'),

    /**
     * @property student-specific information regarding the assignment
     * Includes information such as: status, mastery level and score
     */
    studentStatus: DS.attr(),

    /**
     * @property {number} class average mastery level
     */
    classAverageMasteryLevel: DS.attr('number'),

    /**
     * @property {number} Total students who took the assignment
     */
    totalStudents: DS.attr('number'),

    /**
     * @property {number} students who completed the assignment
     */
    totalQuizzes: DS.attr('number'),

    /**
     * @property {number} number of quizzes taken
     */
    totalCompleted: DS.attr('number'),

    /**
     * @property {number} average score
     */
    avgScore: DS.attr('number'),

    /**
     * @property {StudentResult[]} student results
     */
    studentResults: DS.hasMany('studentResult', { async: true }),

    /**
     * @property {boolean} is this assignment deleted
     */
    deleted: DS.attr('boolean'),

    /**
     * @property {boolean} if this assignment is autoSubmit
     */
    autoSubmit: DS.attr('boolean'),

    /**
     * @property {boolean} if this assignment is auto shutoff
     */
    autoShutoff: DS.attr('boolean'),

    /**
     * @property {boolean} if hide nclex proficiency threshold for this assignment
     */
    hideThresholdLabels: DS.attr('boolean'),

    /**
     * @property {Quiz} current quiz for assignment
     */
    quiz: DS.attr('number'),

    /**
     * @property {number} current Exam for assignment
     */
    exam: DS.belongsTo('exam', { async: true }),

    /**
     * @property {TermTaxonmy} assignment termTaxonomy (Metadata Assignment)
     */
    termTaxonomy: DS.belongsTo('termTaxonomy', { async: true }),

    /**
     * @property {totalStarted} number of quizzes started by students
     */
    totalStarted: DS.attr('number'),

    /**
      * Round the minute to 00 or 30 in Available Date
     */
    availableDateRound: Ember.computed('availableDate', function(){
        var date = this.get("availableDate");
        date.setMinutes(date.getMinutes() >= 30 ? 30 : 0);
        return date;
    }),

    /**
     * Round the minute to 00 or 30 in DorDate
     */
    dueDateRound: Ember.computed('dueDate', function(){
        var date = this.get("dueDate");
        date.setMinutes(date.getMinutes() >= 30 ? 30 : 0);
        return date;
    }),

    /**
     * Converts the due date to correct format to sort the assignments
     */
    timestampDueDate: Ember.computed('dueDate', 'timeZone', function(){
        var dateUtil = DateUtil.create({});
        var timezone = this.get("timeZone");
        var dueDate = this.get('dueDate');
        return dateUtil.format(dueDate,'YYYY-MM-DD HH:mm:ss', timezone, true);
    }),

    /**
     * Converts the due date to correct format to sort the assignments
     */
    timestampAvailableDate: Ember.computed('availableDate', "timeZone", function(){
        var dateUtil = (new DateUtil());
        var timezone = this.get("timeZone");
        var availableDate = this.get('availableDate');
        return dateUtil.format(availableDate,'YYYY-MM-DD HH:mm:ss', timezone, true);
    }),

    /**
     * Indicates when the assignment is available
     */
    isAvailable: Ember.computed('studentStatus', function(){
        var studentStatus = this.get("studentStatus");
        return studentStatus && studentStatus.status === "available";
    }),

    /**
     * Indicates when the assignment is past due
     */
    isPastDue: Ember.computed('studentStatus', function(){
        var studentStatus = this.get("studentStatus");
        return studentStatus && studentStatus.status === "pastDue";
    }),

    /**
     * Indicates when the assignment is completed
     */
    isCompleted: Ember.computed('studentStatus', function(){
        var studentStatus = this.get("studentStatus");
        return studentStatus && studentStatus.status === "completed";
    }),

    isStarted: Ember.computed('totalStarted', function(){
      var totalStarted = this.get('totalStarted');
      return totalStarted && totalStarted >= 1; //At least one student has started the assignment
    }),

    /**
     * Indicates when the assignment is not available
     */
    isNotAvailable: Ember.computed('studentStatus', function(){
        var studentStatus = this.get("studentStatus");
        return studentStatus && studentStatus.status === "notAvailable";
    }),

    isAutoSubmitted: Ember.computed('studentStatus', function(){
        var studentStatus = this.get("studentStatus");
        return studentStatus && studentStatus.status === "autoSubmitted";
    }),

    isAutoCompleted: Ember.computed('studentStatus', function(){
        var studentStatus = this.get("studentStatus");
        return studentStatus && studentStatus.status === "autoCompleted";
    }),

    isAutoShutoff: Ember.computed('autoShutoff', function(){
        return this.get("autoShutoff");
    }),

    isTimeOut: Ember.computed('studentStatus', function(){
        var studentStatus = this.get("studentStatus");
        return studentStatus && studentStatus.status === "timeOut";
    }),

    score: Ember.computed('studentStatus', function(){
        var studentStatus = this.get("studentStatus");
        var score = numeral(studentStatus.score).format("0.00");
        if (this.get("isNotAvailable") || this.get("isAvailable")){
            score = "-";
        }
        return score;
    }),

    /* Property for sort the list by score */
    orderScore: Ember.computed('studentStatus', function(){
        var studentStatus = this.get("studentStatus");
        var score = studentStatus.score;
        if (this.get("isNotAvailable") || this.get("isAvailable")){
            score = -1;
        }
        return parseFloat(score);
    }),

    avgScorePercent: Ember.computed('avgScore', function(){
        var avgScore = this.get("avgScore") || 0,
            totalPoints = this.get("points");

        return totalPoints ? (avgScore / totalPoints) * 100 : 0;
    }),

    /**
     * Returns true if it is a mastery level assignment
     */
    isMasteryLevelAssignment:  Ember.computed('type', function(){
        return this.get("type") === "mastery_level";
    }),

    /**
     * Returns true if it is a question collection assignment
     */
    isQuestionCollectionAssignment:  Ember.computed('type', function(){
        return this.get("type") === "question_collection";
    }),

    /**
     * Returns true if it is a exam assignment
     */
    isExamAssignment:  Ember.computed('type', function(){
        return this.get("type") === "exam";
    }),

    /**
     * Indicates when the assignment has a time limit
     */
    hasTimeLimit:  Ember.computed('timeLimit', function(){
        var typeOk = this.get("isQuestionCollectionAssignment") || this.get("isExamAssignment");
        return  typeOk && this.get("timeLimit") > 0;
    }),

    totalQuestions: Ember.computed('numberQuestion', function(){
        var typeOk = (this.get('isQuestionCollectionAssignment') || this.get("isExamAssignment") );
        return typeOk ? this.get('numberQuestion') : undefined;
    }),

    /**
     * A text label that displays the number of questions for an assignment (e.g. "2 questions")
     * FIXME: This would better done in the template but it would require changing the i18n helper
     */
    totalQuestionsLabel: Ember.computed('numberQuestion', function(){
        var self = this;
        return this.get('isQuestionCollectionAssignment') ?
            I18n.t('hmcd.assignmentsResults.totalQuestions', {count: self.get('totalQuestions')} ) : '';
    }),

    isUngraded: Ember.computed('points', function(){
        return this.get("points") === 0 || this.get("points") === "0";
    }),

    /**
     * Indicates when the answer key view is overdue
     */
    isAnswerKeyViewOverdue: Ember.computed('answerKeyView', function(){
        return this.get("answerKeyView") === Assignment.ANSWER_KEY_OVERDUE ||
            this.get("answerKeyView") === undefined;
    }),
    /**
     * Indicates when the answer key view is completed
     */
    isAnswerKeyViewCompleted: Ember.computed('answerKeyView', function(){
        return this.get("answerKeyView") === Assignment.ANSWER_KEY_COMPLETED;
    }),
    /**
     * Indicates when the answer key view is never
     */
    isAnswerKeyViewNever: Ember.computed('answerKeyView', function(){
        return this.get("answerKeyView") === Assignment.ANSWER_KEY_NEVER;
    }),

    /**
     * Indicates when this assignment has been completed at least one
     */
    hasBeenCompletedAtLeastOnce: Ember.computed('totalCompleted', function(){
        return this.get("totalCompleted") > 0;
    }),

    /**
     * Indicates when this assignment has term taxonomies
     */
    hasTermTaxonomy: Ember.computed('termTaxonomy', function(){ //TODO: Test remove get content in another version of ember.
        return this.get('termTaxonomy').get("content") !== null && this.get('termTaxonomy') !== undefined;
    }),


    /**
     * Indicates when this assignment has chapter
     */
    hasChapter: Ember.computed('chapter', function(){
        return this.get('chapter').get("content") !== null && this.get('chapter') !== undefined;
    }),

    /**
     * Indicates when this assignment has exam
     */
    hasExam: Ember.computed('exam', function(){
        return this.get('exam').get("content") !== null && this.get('exam') !== undefined;
    }),

    /**
     * Has the due date for the assignment already passed?
     */
    hasPassedDueDate: Ember.computed('dueDate', 'timeZone', function(){
        var timezone = this.get('timeZone'),
            now = moment.tz(new Date(), timezone).toDate(),
            dueDate = this.get('dueDate');

        now = now.getTime();
        dueDate = moment.tz(dueDate, timezone).toDate().getTime();

        return dueDate < now;
    }),

    /**
     * Indicates if the assignment has many classes
     * @property {bool}
     */
    hasManyClasses: Ember.computed('totalClasses', function(){
        return this.get("totalClasses") > 1;
    }),

    /**
     * Total classes
     * @property {number}
     */
    totalClasses: Ember.computed('classes.[]', function(){
        return this.get("classes").get("length");
    }),

    /**
     * First assignment class
     * @property {SakuraiWebapp.Class}
     */
    firstClass: Ember.computed('classes.[]', function(){
        return this.get("classes").get("firstObject");
    }),

    examMasteryThreshold: Ember.computed("exam", "targetMasteryLevel", function(){
      if (this.get("hasExam")) {
          var masteryLevel = this.get("targetMasteryLevel");
          if (masteryLevel !== null) {
              return masteryLevel;
          } else {
            return this.get("exam").get("class").get("product").get("chartPassingThreshold");
          }
      }
    }),

    /**
     * Sets the dates for the assignment
     * @param {string} startDate
     * @param {string} startHour
     * @param {string} dueDate
     * @param {string} dueHour
     * @returns {bool} if dates are ok
     */
    setDates: function(startDate, startHour, dueDate, dueHour){
        var assignment = this;
        var dateUtil = DateUtil.create({});
        var timeZone = assignment.get("timeZone");

        var date = startDate + " " + startHour;
        //dates are handle in local time, they are converted to UTC before sending the request
        var availableDate = dateUtil.toLocal(date, "MM-DD-YYYY HH,mm", timeZone);

        date = dueDate + " " + dueHour;
        //dates are handle in local time, they are converted to UTC before sending the request
        dueDate = dateUtil.toLocal(date, "MM-DD-YYYY HH,mm", timeZone);

        var datesOk = moment(availableDate).isBefore(moment(dueDate));

        if (datesOk){
            assignment.set("dueDate", dueDate);
            assignment.set("availableDate", availableDate);
        }

        return datesOk;
    },

    /**
     * Indicates if the assignment has parent
     * @property {boolean}
     */
    hasParent: Ember.computed('parent', function(){
        return this.get("parent").get("content") !== null;
    })

});

Assignment.reopenClass({

    ANSWER_KEY_COMPLETED : "completed",
    ANSWER_KEY_NEVER : "never",
    ANSWER_KEY_OVERDUE : "overdue",

    MASTERY_LEVEL: "mastery_level",
    QUESTION_COLLECTION: "question_collection",

    fetch: function(assignment){
        return new Ember.RSVP.Promise(function(resolve, reject){
            assignment.reload().then(function(){
                Ember.RSVP.hash({
                    "questionSet": (!assignment.get("isMasteryLevelAssignment")) ? assignment.get("questionSet"): false,
                    "chapter": (assignment.get("isMasteryLevelAssignment")) ? assignment.get("chapter") : false,
                    "termTaxonomy": (assignment.get("isMasteryLevelAssignment")) ? assignment.get("termTaxonomy") : false,
                    "classes": assignment.get("classes")
                })
                    .then(function(){
                        resolve(assignment);
                    }, reject);
            }, reject);
        });
    },

    /**
     * Increments the answer key view for the provided assignment
     * @param {Store} store
     * @param {number} assignmentId
     * @param {number} studentId
     * @returns {Ember.RSVP.Promise} fulfills true if success
     */
    incAnswerKeyViews: function (store, assignmentId, studentId){
        return new Ember.RSVP.Promise(function(resolve, reject){
            /*
             NOTE: if there is more work related to updating the data for a student assignment
             it will be best to create a model and an adapter for it, like AuthKey
             For now it is just to much work for a single request
             */
            var url = Context.getBaseUrl() + "/studentAssignments/incAnswerKeyView";
            var data = { assignment: assignmentId, student: studentId };

            Ember.$.ajax(url, {
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(data),
                dataType: 'json'
            }).then(function (response) {
                    return resolve(response.data);
                },
                reject);
        });

    },

    /**
     * Copy an assignment record into a new record
     * @param {Ember.DS.Store} store
     * @param {Assignment} assignment
     * @returns {Em.RSVP.Promise}
     */
    copyAssignmentRecord: function(store, assignment){
        return store.createRecord("assignment", {
                    parentAssignment: assignment,
                    answerKeyView: assignment.get('answerKeyView'),
                    autoShutoff: assignment.get('autoShutoff'),
                    autoSubmit: assignment.get('autoSubmit'),
                    avgScore: assignment.get('avgScore'),
                    chapter: assignment.get('chapter'),
                    classAverageMasteryLevel: assignment.get('classAverageMasteryLevel'),
                    deleted: assignment.get('deleted'),
                    exam: assignment.get('exam'),
                    hideThresholdLabels: assignment.get('hideThresholdLabels'),
                    name: assignment.get('name'),
                    numberQuestion: assignment.get("numberQuestion"),
                    points: assignment.get('points'),
                    questionSet: assignment.get('questionSet'),
                    quiz: assignment.get('quiz'),
                    staggered: assignment.get('staggered'),
                    targetMasteryLevel: assignment.get('targetMasteryLevel'),
                    termTaxonomy: assignment.get('termTaxonomy'),
                    timeLimit: assignment.get('timeLimit'),
                    type: assignment.get('type')
                });
    },

    /**
     * Method returns the Hours availables for start time and End time
     * returns array
     */
    availableHoursList: function(){
        var am_pm = 'am',
            hour = 0,
            hours = [],
            hourStr = '',
            hourDisplay = 0;

        for (var i = 0; i < 24; i++) {
            am_pm = (i === 12) ? 'pm' : am_pm;
            hour = (i === 13) ? 1 : hour;
            hourDisplay = (i === 0) ? '12' : hour;

            // Make all hour values have two digits so it readily
            // matches the hour value from the HH:mm format
            hourStr = (i < 10) ? '0' + i : i;

            hours.push({"hour" : hourDisplay + ':00 ' + am_pm, "value": hourStr + ',' +'00'});
            hours.push({"hour" : hourDisplay + ':30 ' + am_pm, "value": hourStr + ',' +'30'});
            hour++;
        }
        return hours;
    }
});
