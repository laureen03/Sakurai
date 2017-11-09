import Ember from "ember"; 
import DateUtil from "utils/date-util";

export default Ember.Component.extend({
    tagName: 'span',

    //Current assignment
    assignment: null,

    /**
     * @property data to convert to csv
     */
    data: null,

    /**
     * @property {Product} the product
     */
    'data-product': null,

    /**
     * @property {Class} the class
     */
    'data-class': null,

    /**
     * @property {Bool} if remediation link is allowed
     */
    isRemediationLinkAllowed: false,

    /**
     * @property classes for the inner element
     */
    linkClass: "",

    /**
     * @property text for the inner element
     */
    linkText: "",

    /**
     * @property link action
     */
    linkAction: "",

    /**
     * @property name of file to download
     */
    fileName: "",

    saveCSV: function (csv) {
        var component = this;
        component.download(component.get("fileName"), csv);
    },

    /**
     * Indicates if it is IE
     * @see http://code.ciphertrick.com/2014/12/07/download-json-data-in-csv-format-cross-browser-support/
     * @returns {boolean}
     */
    isInternetExplorer: function () {
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE ");
        return (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)); // If Internet Explorer, return true
    },

    /**
     * Downloads content
     * @see http://code.ciphertrick.com/2014/12/07/download-json-data-in-csv-format-cross-browser-support/
     * @param fileName
     * @param data 
     */
    download: function (fileName, data) {
        if (this.isInternetExplorer()) {
            var IEwindow = window.open();
            IEwindow.document.write('sep=,\r\n' + data);
            IEwindow.document.close();
            IEwindow.document.execCommand('SaveAs', true, fileName + ".csv");
            IEwindow.close();
        } else {
            var uri = 'data:application/csv;charset=utf-8,' + escape(data);
            var link = document.createElement("a");
            link.href = uri;
            link.style = "visibility:hidden";
            link.download = fileName + ".csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    },

    didReceiveAttrs: function () {
        var component = this;
        var linkClass = "",
                linkText = "",
                linkAction = "",
                fileName = "";
        switch (component.get("type")) {
            case "studentUsage":
                linkClass = "download-student-usage-link highlight-link";
                linkText = I18n.t('hmcd.studentUsage.download');
                linkAction = "downloadStudentUsage";
                fileName = component.get("data-product").get("name") + "_StudentUsage_" + component.get("data-class").get("name") + "_" + moment().format('MM-DD-YY');
                break;
            case "practiceExamResults":
                linkClass = "download-practice-exam-results-link highlight-link";
                linkText = I18n.t('examSummary.practiceExamResultsDownload');
                linkAction = "downloadPracticeExamResults";
                fileName = component.get("data-product").get("name") + "_PracticeExamResults_" + component.get("data-class").get("name") + "_" + moment().format('MM-DD-YY');
                break;
            default:
                linkClass = "covert-csv-link";
                linkText = I18n.t('assignment.donwloadAssignmentResultsCSV');
                linkAction = "covertToCSV";
                //this will remove the blank-spaces from the title and replace it with an underscore
                fileName = component.get("assignment.name").replace(/ /g, "_") + "_" + component.get("type") + "_assignment_results";
                break;
        }
        component.set("linkClass", linkClass);
        component.set("linkText", linkText);
        component.set("linkAction", linkAction);
        component.set("fileName", fileName);
    },

    formatDate: function (date) {
        if (!(date instanceof Date)) {
            throw new Ember.Error('LoginCalendarModalComponent: date objected expected');
        }
        var dateUtil = (new DateUtil()),
                format = 'lll',
                timezone = DateUtil.getLocalTimeZone(),
                tz = true;
        return dateUtil.format(date, format, timezone, tz);
    },

    actions: {
        covertToCSV: function () {
            var component = this,
                    json = [],
                    studentResults = component.get("assignment.studentResults"),
                    lastPosition = (studentResults.get("length") - 1),
                    dateUtil = new DateUtil();
            studentResults.then(function (_studentResults) {
                _studentResults.forEach(function (studentResult, index) {
                    studentResult.get("user").then(function (user) {
                        var timezone = component.get("assignment").get("timeZone");
                        var lastQuestionSubmittedTime = dateUtil.format(studentResult.get("lastQuestionSubmittedTime"), 'lll', timezone, true);
                        if (component.get("assignment").get("isMasteryLevelAssignment")) {
                            if (component.get("assignment").get("hasPassedDueDate")) {
                                json.push({
                                    "Name": user.get("fullName"),
                                    "Email": user.get("email"),
                                    "No. of Quizzes on This Assignment": (studentResult.get("numQuizzes") !== null) ? studentResult.get("numQuizzes") : 0,
                                    "Total No. of Quizzes on This Category": (studentResult.get("numQuizzesTotal") !== null) ? studentResult.get("numQuizzesTotal") : 0,
                                    "No. of Questions on This Assignment": (studentResult.get("questionsAnswered") !== null) ? studentResult.get("questionsAnswered") : 0,
                                    "Total No. of Questions on This Category": (studentResult.get("questionsAnsweredTotal") !== null) ? studentResult.get("questionsAnsweredTotal") : 0,
                                    "Mastery Level at Due Date": (studentResult.get("masteryLevel") !== null) ? studentResult.get("masteryLevel") : 0,
                                    "Score": (studentResult.get("score") !== null) ? studentResult.get("score") : 0
                                });
                            } else {
                                json.push({
                                    "Name": user.get("fullName"),
                                    "Email": user.get("email"),
                                    "No. of Quizzes on This Assignment": (studentResult.get("numQuizzes") !== null) ? studentResult.get("numQuizzes") : 0,
                                    "Total No. of Quizzes on This Category": (studentResult.get("numQuizzesTotal") !== null) ? studentResult.get("numQuizzesTotal") : 0,
                                    "No. of Questions on This Assignment": (studentResult.get("questionsAnswered") !== null) ? studentResult.get("questionsAnswered") : 0,
                                    "Total No. of Questions on This Category": (studentResult.get("questionsAnsweredTotal") !== null) ? studentResult.get("questionsAnsweredTotal") : 0,
                                    "Current Mastery Level": (studentResult.get("masteryLevel") !== null) ? studentResult.get("masteryLevel") : 0,
                                    "Score": (studentResult.get("score") !== null) ? studentResult.get("score") : 0
                                });
                            }
                        } else if (component.get("assignment").get("isQuestionCollectionAssignment")) {
                            

                            json.push({
                                "Name": user.get("fullName"),
                                "Email": user.get("email"),
                                "Number of Questions": (studentResult.get("questionsAnswered") !== null) ? studentResult.get("questionsAnswered") : 0,
                                "Number Correct": (studentResult.get("questionsCorrect") !== null) ? studentResult.get("questionsCorrect") : 0,
                                "Time of the Last Question Submitted": (studentResult.get("lastQuestionSubmittedTime") !== null) ? lastQuestionSubmittedTime : '-',
                                "Score": (studentResult.get("score") !== null) ? studentResult.get("score") : 0
                            });
                        } else if (component.get("assignment").get("isExamAssignment")) {

                            var timeToComplete = null;
                            if(studentResult.get("status") === 'notCompleted' || studentResult.get("status") === 'pastDue')  {
                                timeToComplete = 'Not Completed';
                            } else {
                                if(studentResult.get("minToComplete")){
                                    timeToComplete = studentResult.get("timeToComplete");
                                }
                            }

                            if(component.get("assignment").get("hasPassedDueDate")) {
                                json.push({
                                    "Name": user.get("fullName"),
                                    "Mastery Level at Due Date": (studentResult.get("masteryLevel") !== null) ? studentResult.get("masteryLevel") : '-',
                                    "Time To Complete": (timeToComplete !== null) ? timeToComplete : '-',
                                    "Time Started": (studentResult.get("startDate") !== null) ? dateUtil.format(studentResult.get("startDate"), 'lll', timezone, true) : '-',
                                    "Time of Last Answer": (studentResult.get("lastQuestionSubmittedTime") !== null) ? lastQuestionSubmittedTime : '-',
                                    "Answered Correctly": (studentResult.get("questionsCorrect") !== null) ? studentResult.get("questionsCorrect") + " of " + studentResult.get("questionsAnswered") : '-',
                                    "Remediation Views": (studentResult.get("remediationViews") !== null) ? studentResult.get("remediationViews") : '-',
                                });
                            } else {
                                json.push({
                                    "Name": user.get("fullName"),
                                    "Current Mastery Level": (studentResult.get("masteryLevel") !== null) ? studentResult.get("masteryLevel") : '-',
                                    "Time To Complete": (timeToComplete !== null) ? timeToComplete : '-',
                                    "Time Started": (studentResult.get("startDate") !== null) ? dateUtil.format(studentResult.get("startDate"), 'lll', timezone, true) : '-',
                                    "Time of Last Answer": (studentResult.get("lastQuestionSubmittedTime") !== null) ? lastQuestionSubmittedTime : '-',
                                    "Answered Correctly": (studentResult.get("questionsCorrect") !== null) ? studentResult.get("questionsCorrect") + " of " + studentResult.get("questionsAnswered") : '-',
                                    "Remediation Views": (studentResult.get("remediationViews") !== null) ? studentResult.get("remediationViews") : '-',
                                });
                            }
                        } else {
                            json.push({
                                "Name": user.get("fullName"),
                                "Email": user.get("email"),
                                "Number of Questions": (studentResult.get("questionsAnswered") !== null) ? studentResult.get("questionsAnswered") : 0,
                                "Number Correct": (studentResult.get("questionsCorrect") !== null) ? studentResult.get("questionsCorrect") : 0,
                                "Score": (studentResult.get("score") !== null) ? studentResult.get("score") : 0
                            });
                        }

                        if (index === lastPosition) {
                            var csv = Papa.unparse(json.sort(function (a, b) {
                                return (a.Name.toLowerCase() > b.Name.toLowerCase()) ? 1 : ((b.Name.toLowerCase() > a.Name.toLowerCase()) ? -1 : 0);
                            }));
                            component.saveCSV(csv);
                        }
                    });
                });
            });
        },

        downloadStudentUsage: function () {
            var component = this,
                    json = [],
                    studentUsages = component.get("data"),
                    lastPosition = (studentUsages.get("length") - 1);
            studentUsages.forEach(function (studentUsage, index) {
                studentUsage.get("user").then(function (user) {
                    if (component.get("isRemediationLinkAllowed")) {
                        json.push({
                            "Name": user.get("fullName"),
                            "Email Address": user.get("email"),
                            "Logins": (studentUsage.get("logins") !== null) ? studentUsage.get("logins") : 0,
                            "Last Login": (studentUsage.get("lastLogin") !== null) ? component.formatDate(studentUsage.get("lastLogin")) : '-',
                            "Quizzes Completed": (studentUsage.get("quizzesCompleted") !== null) ? studentUsage.get("quizzesCompleted") : 0,
                            "Questions Answered": (studentUsage.get("questionsAnswered") !== null) ? studentUsage.get("questionsAnswered") : 0,
                            "Mastery Level Avg.": (studentUsage.get("masteryLevel") !== null) ? numeral(studentUsage.get("masteryLevel")).format('0.00') : 0,
                            "Remediation Views": (studentUsage.get("totalRemediationLinkViews") !== null) ? studentUsage.get("totalRemediationLinkViews") : 0
                        });
                    } else {
                        json.push({
                            "Name": user.get("fullName"),
                            "Email Address": user.get("email"),
                            "Logins": (studentUsage.get("logins") !== null) ? studentUsage.get("logins") : 0,
                            "Last Login": (studentUsage.get("lastLogin") !== null) ? component.formatDate(studentUsage.get("lastLogin")) : '-',
                            "Quizzes Completed": (studentUsage.get("quizzesCompleted") !== null) ? studentUsage.get("quizzesCompleted") : 0,
                            "Questions Answered": (studentUsage.get("questionsAnswered") !== null) ? studentUsage.get("questionsAnswered") : 0,
                            "Mastery Level Avg.": (studentUsage.get("masteryLevel") !== null) ? numeral(studentUsage.get("masteryLevel")).format('0.00') : 0
                        });
                    }

                    if (index === lastPosition) {
                        var csv = Papa.unparse(json.sort(function (a, b) {
                            return (a.Name.toLowerCase() > b.Name.toLowerCase()) ? 1 : ((b.Name.toLowerCase() > a.Name.toLowerCase()) ? -1 : 0);
                        }));
                        component.saveCSV(csv);
                    }
                });
            });
        },

        downloadPracticeExamResults: function() {
            var component = this,
                    json = [],
                    practiceExamResults = component.get("data"),
                    lastPosition = (practiceExamResults.get("length") - 1);
            practiceExamResults.forEach(function (practiceExamResult, index) {
                practiceExamResult.get("user").then(function (user) {
                    json.push({
                            "Name": user.get("fullName"),
                            "Email Address": user.get("email"),
                            "Number of Exams": (practiceExamResult.get("examsCompleted") !== null) ? practiceExamResult.get("examsCompleted") : 0,
                            "Last Exam": (practiceExamResult.get("lastExamAt") !== null) ? component.formatDate(practiceExamResult.get("lastExamAt")) : '-',
                            "Questions Answered": (practiceExamResult.get("questionsAnswered") !== null) ? practiceExamResult.get("questionsAnswered") : 0,
                            "Mastery Level Avg.": (practiceExamResult.get("masteryLevel") !== null) ? numeral(practiceExamResult.get("masteryLevel")).format('0.00') : 0
                    });

                    if (index === lastPosition) {
                        var csv = Papa.unparse(json.sort(function (a, b) {
                            return (a.Name.toLowerCase() > b.Name.toLowerCase()) ? 1 : ((b.Name.toLowerCase() > a.Name.toLowerCase()) ? -1 : 0);
                        }));
                        component.saveCSV(csv);
                    }
                });
            });
        },
    }
});
