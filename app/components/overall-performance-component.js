SakuraiWebapp.OverallPerformanceComponent = Ember.Component.extend({

    /**
     * Mastery level items
     * This data is used to render the chart
     *
       [ {
         student: { numQuiz:0, quiz:0, masteryLevel:1, tooltip: false },
         class: {numQuiz:0, masteryLevel:1}
        },
        ....
       ]
     */
    masteryLevelItems: [],
    noMasteryLevelItems : false,

    toolTipDateFormat: "MM/DD/YY hh:mm a (z)",
    
    timeZone: 'America/New_York',
    /**
     * Observes the overall performance to refresh the chart
     */
    observer: Ember.observer('overallPerformance', function(){
        this.drawChart();
    }),


    didInsertElement: function(){
        var component = this;
        component.drawChart();

        SakuraiWebapp.context.addWindowResizeListener(function(){
            if (!component.get("isDestroyed")){
                component.drawChart();
            }
        });
    },

    /**
     * Draws the overall performance chart
     */
    drawChart: function () {
        var component = this;

        // Create and populate the data table.
        var dataTable = new google.visualization.DataTable();

        var overallPerformance = this.get("overallPerformance");

        var classPerformance = overallPerformance.get('classPerformance') || [];
        var studentPerformance = overallPerformance.get('studentPerformance') || [];

        this.reset();

        this.addDataTableColumns(dataTable, overallPerformance);
        this.addMasteryLevelRows(dataTable, overallPerformance);
        var options = this.getChartOptions(overallPerformance);
        // Create and draw the visualization.
        try {


            var visualitation = new google.visualization.LineChart(document.getElementById('chart'));
            visualitation.draw(dataTable, options);

            // Add our over/out handlers.
            google.visualization.events.addListener(visualitation, 'onmouseover', function(e){
                // only call this on row data not labels
                if(e.row && e.row > 0){
                    component.showTooltip(visualitation, dataTable, options, e);
                }

            });

        } catch (e) {
            Ember.Logger.warn(e);
        }
    },
    /**
     * Reset the noMasteryLevelItems flag every time the chart is draw
     */

    reset: function(){
        var component = this;
        component.set('masteryLevelItems',[]);
        component.set('noMasteryLevelItems',false);
    },

    /**
     * Dynamically show the tool tip by finding the quiz information in the store
     * @param visualitation google.visualization.LineChart
     * @param dataTable google.visualization.DataTable
     * @param options and array of option
     * @param e the event element
     */
    showTooltip: function(visualitation, dataTable, options, e){
        var component = this,
            store = component.get("store");

        var numQuestions = dataTable.getValue(e.row, 0);
        var masteryLevelItem = component.get("masteryLevelItems")[numQuestions] || undefined;
        if (masteryLevelItem){
            var isStudent = masteryLevelItem.student || false;
            if (isStudent && !masteryLevelItem.student.tooltip){
                masteryLevelItem.student.tooltip = true;
                var quizId = masteryLevelItem.student.quiz;
                store.find("quiz", quizId).then(function(quiz){
                        var tooltip = component.getQuizDetailTooltip(component.formatToolTipDate(quiz.get("startedOnTimeStamp")), quiz.get("quizLength"), quiz.get("correctResultsCount"));
                        dataTable.setValue(e.row, 6, tooltip);
                        visualitation.draw(dataTable, options);
                    },
                    function(){ //on failure
                        dataTable.setValue(e.row, 6, component.getQuizDetailTooltip('- -', '- -', '- -'));
                        visualitation.draw(dataTable, options);
                    })
            }
            else{
                // TODO
            }

        }
    },

    /**
     * Formats the iso date string to the proper format
     * @parama date string
     */
    formatToolTipDate: function(timeStamp){
        return moment.unix(timeStamp).tz(this.timeZone).format(this.toolTipDateFormat);
    },

    /**
     * Setups the data table columns for the chart
     * @param dataTable
     * @param overallPerformance
     */
    addDataTableColumns: function(dataTable, overallPerformance){
        var component = this;
        // questions answered
        dataTable.addColumn({type: 'number', role: 'domain', label: I18n.t('overallPerformance.numQuizzesTaken') });

        //Next columns are for the class average num of questions
        dataTable.addColumn({type: 'string', role: 'annotation'});
        dataTable.addColumn({type: 'string', role: 'annotationText'});


        if(overallPerformance.get('totalQuizzes') == 0){
            component.set("noMasteryLevelItems", true);
        }

        if (overallPerformance.hasClassPerformance() || overallPerformance.get('totalQuizzes') == 0 || overallPerformance.get("totalQuizzes") == null){
            //Next columns are for the class mastery mastery level line
            dataTable.addColumn({type: 'number', label: I18n.t('overallPerformance.avgClassMastery') });
            dataTable.addColumn({'type': 'string', 'role': 'tooltip', p: {'html':true}});
        }
        if (overallPerformance.hasStudentPerformance() || overallPerformance.get('totalQuizzes') == 0 ){
            //Next columns are for the student mastery level line
            dataTable.addColumn({type: 'number', label: I18n.t('overallPerformance.yourMl') });
            dataTable.addColumn({'type': 'string', 'role': 'tooltip', p: {'html':true}});
        }

    },

    /**
     * Generates the tooltip content for quiz details
     * @param dateTaken
     * @param numQuestions
     * @param numCorrect
     * @returns {string}
     */
    getQuizDetailTooltip: function (dateTaken, numQuestions, numCorrect) {
        return '<div class="graph-container">' +
                '<table id="data">' +
                    '<tr>' +
                        '<td>'+ I18n.t('overallPerformance.dateTaken') + ':</td> <td><b>' + dateTaken + '</b></td>' +
                    '</tr>' +
                    '<tr>' +
                        '<td>'+ I18n.t('overallPerformance.numQuestions') + ':</td> <td><b>' + numQuestions + '</b></td>' +
                    '</tr>' +
                    '<tr>' +
                        '<td>'+ I18n.t('overallPerformance.numCorrect') + ':</td> <td><b>' + numCorrect + '</b></td>' +
                    '</tr>' +
                '</table>' +
            '</div>';
    },

    /**
     * Adds the student mastery level data rows
     * @param dataTable
     * @param overallPerformance
     */
    addMasteryLevelRows: function(dataTable, overallPerformance){
        var component = this,
            masteryLevelItems = this.getMasteryLevelItems(overallPerformance) || null,
            classPerformanceNum = overallPerformance.get('classPerformance').get('length');
            component.set("masteryLevelItems", masteryLevelItems);


        if( component.get("noMasteryLevelItems") ||
                (overallPerformance.get("totalQuizzes")==null && classPerformanceNum == 0)){

            var row = [];
            row.push(null);
            row.push(null);
            row.push(null);
            row.push(0);
            row.push('<div class="hidden-tooltip"></div>');
            if(overallPerformance.get("totalQuizzes")!=null){
                row.push(0);
                row.push('<div class="hidden-tooltip"></div>');
            }

            dataTable.addRow(row);
        }else{

            $.each(masteryLevelItems, function(index, item){
                var row = [];

                row.push(parseInt(index));
                row.push(null);
                row.push(null);

                if (overallPerformance.hasClassPerformance()){
                    row.push(item.class ? item.class.masteryLevel : null);
                    (item.class) ?
                        row.push(I18n.t('overallPerformance.avgClassMastery') +' ' + item.class.masteryLevel) :
                        row.push(null);
                }
                if (overallPerformance.hasStudentPerformance()){
                    row.push(item.student ? item.student.masteryLevel : null);
                    // initialize the HTML to prevent blinking on adding the new dynamic tool tip in the event
                    row.push('<div class="hidden-tooltip"></div>');

                }

                dataTable.addRow(row);
            });
        }

    },

    /**
     * This methods returns the structure to fill up the chart correctly
     * @param overallPerformance
     * @returns {}
     */
    getMasteryLevelItems: function(overallPerformance){

        var oneQuizOnly = overallPerformance.get('totalQuizzes') == 1;
        var hasStudentPerformance = overallPerformance.hasStudentPerformance();
        var hasClassPerformance = overallPerformance.hasClassPerformance();

        var data = {};
        // add init data for 0,0 to give the line a nice curve
        data[0] = {
            student: (hasStudentPerformance) ? {numQuiz:0, quiz:0, masteryLevel:0} : undefined,
            class: (hasClassPerformance) ? {numQuiz:0, masteryLevel:0} : undefined
        };

        if (hasStudentPerformance){
            var studentPerformance = overallPerformance.get("studentPerformance");
            $.each(studentPerformance, function(index, performance){
                var numQuiz = performance.numQuiz;
                data[ numQuiz] = {
                    student:performance,
                    class: undefined
                }
            });
        }


        if (hasClassPerformance){
            var classPerformance = overallPerformance.get("classPerformance");
            $.each(classPerformance, function(index, performance){
                var numQuiz = performance.numQuiz;
                var student = (data[ numQuiz]) ? data[numQuiz].student : undefined;
                data[numQuiz] = {
                    class:performance,
                    student: student
                }
            });
        }
        return data;
    },

    /**
     * Return chart options
     * @returns {} options
     */
    getChartOptions: function(overallPerformance){
        var component = this,
        //Fix the issue if there are less quizzes than values in Y axis
             _ticks = null,
            _startsAt = 0,
            _totalQuizzes = overallPerformance.get("totalQuizzes"),
            _maxValue = _totalQuizzes,
            _lineDashStyle = [2,2],
            _primaryColor = "#999";



        // null <= 8 evals to true so check null first
        if(_totalQuizzes != null && _totalQuizzes <= 8 )
        {
            // aka _totalQuizzes == 0

            if(component.get("noMasteryLevelItems")){
                _maxValue = 10;
                _ticks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            }
            else{
                _ticks = [];
                for(var i = 0;i <= _totalQuizzes; i++){
                    _ticks.push(i);
                }
            }
        }
        else if(_totalQuizzes == null)
        {
            if (overallPerformance){
                var classLength = overallPerformance.get('classPerformance').get('length');
                _lineDashStyle = null;
                _primaryColor = "#fc6e00";
                _maxValue = classLength;
                if(classLength <= 8){
                    _ticks = [];
                    for(var i = 0; i <= classLength; i++){
                        _ticks.push(i);
                    }
                }
            }
        }

        if(!overallPerformance.hasClassPerformance() && overallPerformance.hasStudentPerformance()){
            _lineDashStyle = null;
            _primaryColor = "#fc6e00";
        }


        return {
            tooltip: { isHtml: true },
            series: {
                0: {
                    color: _primaryColor,
                    lineDashStyle: _lineDashStyle
                },
                1: {
                    color: "#fc6e00"
                },

            },
            interpolateNulls: true,
            annotations: {
                style: "line",
                textStyle: {
                    color: "#333",
                    bold: false,
                    fontName: "Helvetica"
                },
                lineWidth: 2
            },
            curveType: "function",
            width: '100%', 
            height: 300, //TODO calculate dimensions
            chartArea: {
                top: "3%",
                width: "80%",
                height: '80%'
            },
            vAxis: {
                title: I18n.t('overallPerformance.ml'),
                titleTextStyle: {
                    color: "#454545",
                    bold: true,
                    italic: false,
                    fontName: "Open Sans",
                    fontSize: 12,
                },
                titlePosition: "in",
                textStyle: {
                    color: "#000",
                    fontSize: 14,
                    fontName: "Open Sans"
                },
                maxValue: 8, //TODO make it a property
               minValue: 0, //TODO make it a property
                ticks: [0,1,2,3,4,5,6,7,8], //TODO make it a property
                baselineColor: "#e5e5e5",
                gridlines: {
                    color: "#e5e5e5"
                },

            },
            hAxis: {
                viewWindowMode: 'explicit',
                viewWindow: {
                    max: _maxValue,
                    min: _startsAt
                },

                ticks: _ticks,
                title: I18n.t('overallPerformance.numQuizzesTaken'), //i18n
                titleTextStyle: {
                    color: "#454545",
                    bold: true,
                    italic: false,
                    fontName: "Open Sans",
                    fontSize: 12,
                },
                showTextEvery: 1,
                format: "##",
                gridlines: {
                    count: -1,
                    color: "#fff"
                },
                textStyle: {
                    color: "#000",
                    fontSize: 14,
                    fontName: "Open Sans"
                },
                baselineColor: "#fff"
            },
            legend: {
                position: "bottom",
                alignment: "end",
                textStyle: {
                    color: "#808080",
                    fontName: "Open Sans",
                    fontSize: 13,
                }
            },
            // pointSize: 5,
            lineWidth: 2

        }
    }




});
