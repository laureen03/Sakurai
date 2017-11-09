/*
 * @param page-length {number} number of results displayed per page
 * @param current-page {number} page the component is currently on
 */

import Ember from "ember"; 

export default Ember.Component.extend({ 

    /**
     * @property {ExamStat}
     */
    examStat: null,

    /**
     * @property {number}
     */
    passThreshold: 0,

    /**
     * @property {Exam} the selected exam
     */
    selectedExam: null,

    /**
     * @property {string} selected exam label
     */
    selectedExamLabel: null,

    _dataTable: null,

    _columnChart: null,
    /**
     * @property {int} Maximum threshold value
     */
    maxValue: 8,


    didInsertElement: function() {
        var component = this;
        var examStat = this.get('examStat');

        examStat.get('exams').then( function() {  //First load all exam, and after that create the graph
            if (!component.get("isDestroyed")){
                component.drawChart();
            }
        });
    },

    willDestroyElement: function () {
        var _columnChart = this.get('_columnChart');

        google.visualization.events.removeAllListeners(_columnChart);

        // Release all allocated resources for the chart
        _columnChart.clearChart();

        this.set('_dataTable', null);
        this.set('_columnChart', null);
    },

    getTicksNumber: function (threshold) {
        var maxValue = this.get("maxValue");
        return (threshold ===  maxValue) ? maxValue+1 : maxValue;
    },

    drawChart: Ember.observer('examStat', 'page-length', 'current-page', function() {
        var _dataTable,
            _columnChart,
            examStat = this.get('examStat'),
            passThreshold = this.get("passThreshold") || 4,
            pageLen = this.get('page-length'),
            currentPage = this.get('current-page'),
            chartHeight = 350,
            ticksNumber = this.getTicksNumber(passThreshold),
            options = this.getChartOptions(ticksNumber, chartHeight, pageLen, currentPage),
            context = context;


        _dataTable = new google.visualization.DataTable(),   // Create the data table
        _columnChart = new google.visualization.ColumnChart(this.$('#student_exam_performance_chart').get(0));

        this.set('_dataTable', _dataTable);
        this.set('_columnChart', _columnChart);
        
        if (!context.isTesting()) {
            google.visualization.events.addListener(_columnChart, 'select', this.showColumnTooltip.bind(this));
        }
        
        // Only add the table columns once
        this.addDataTableColumns(_dataTable);

        if (_dataTable.getNumberOfRows()) {
            // Remove existing rows before adding new/updated rows back in
            _dataTable.removeRows(0, pageLen);
        }

        //this.displayPassingThreshold(4);
        if (!context.isTesting()){
            google.visualization.events.addListener(_columnChart, 'ready', this.placeMarker.bind(_columnChart, _dataTable, passThreshold, examStat, this.getTicksNumber(passThreshold)));
        }

        this.addExamRows(_dataTable, examStat, pageLen, currentPage);
        
        try {
            _columnChart.draw(_dataTable, options);
        } catch (e) {
            Ember.Logger.warn(e);
        }
    }),

    showColumnTooltip: function() {
        var _columnChart = this.get('_columnChart'),
            pageLen = this.get('page-length'),
            currentPage = this.get('current-page'),
            selection = _columnChart.getSelection(),
            coord = selection && selection.length > 0 && selection[0];

        if (typeof coord === 'object' && coord.column === 1) {
            this.selectExam(coord.row + ((currentPage - 1) * pageLen));
        }
    },

    /**
     * Mone Legend to the line position
     * @param dataTable
     * @param threshold
     */
    placeMarker: function(dataTable, threshold, examStat, maxThreshold) {
        if (!examStat.get("hideThresholdLabel")) {
            var percentageTop, percentageBottom;
            var chartArea = $('#student_exam_performance_chart svg rect:eq(0)');
            var top = chartArea.attr("y");
            $(".passing-threshold").height(chartArea.attr("height"));
            $(".passing-threshold").width(chartArea.attr("width"));
            $(".passing-threshold").css("top", top + "px");
            $(".passing-threshold").css("left", chartArea.attr("x") + "px");

            percentageBottom = ((100 * threshold) / maxThreshold) - 5; //5% half of yellow line
            percentageTop = 100 - percentageBottom - 10; //10% is the Yellow Line
            $(".passing-threshold .green-gradient").css("height", percentageTop + "%");
            $(".passing-threshold .red-gradient").css("height", percentageBottom + "%");

            //Position of label - 93 is the half of label width
            var cli = this.getChartLayoutInterface();
            $('.marker-threshold').css("top", (Math.floor(cli.getYLocation(threshold)) - 93 - (top / 2)) + "px");
            //The ajaustement expression is a linear function where f(8)=64 and f(2)=-20
            $('.label-threshold').css("top", (Math.floor(cli.getYLocation(threshold)) - 93 - (top / 2) + (17*threshold-56)) + "px");
        } else {
            $("#examStatMinimumNCLEXProficiency").css("display", "none");
            $("#examStatMinimumNCLEXProficiencyMarker").css("display", "none");
        }
    },

    /**
     * Gets the exam label at index
     * @param index
     * @returns {string}
     */
    getExamLabel: function(index){
        return I18n.t("common.exam.one") + " " + (index + 1);
    },

    /**
     * @param {number} index of the data row
     * @returns {Exam} exam corresponding to the selected data row
     */
    selectExam: function(index) {
        var self = this;

        this.get('examStat').get('exams').then( function(exams) {
            self.set("selectedExam", exams.objectAt(index));
            self.set("selectedExamLabel", self.getExamLabel(index));
        });
    },

    /**
     * Setups the data table columns for the chart
     * @param dataTable
     */
    addDataTableColumns: function(dataTable){
        dataTable.addColumn({type: 'string', label: I18n.t('common.exam.other') });
        dataTable.addColumn({type: 'number', label: I18n.t('common.examMasteryLevel') });
    },

    /**
     * Adds the data items to the chart
     * @param dataTable
     * @param {ExamStat} examStat
     * @param {number} pageLen number of results per results page
     * @param {number} currentPage index of the current page
     */
    addExamRows: function(dataTable, examStat, pageLen, currentPage){
        var self = this,
            lowerLimit = (currentPage - 1) * pageLen,
            upperLimit = currentPage * pageLen,
            examLabel,
            exams = examStat.get('exams');

        var examRows = exams.filter( function(exam, index) {
                    return index >= lowerLimit && index < upperLimit;
                }).map( function(exam, index) {
                    examLabel = self.getExamLabel(index + lowerLimit);
                    return [
                        examLabel,
                        exam.get('masteryLevel')
                    ];
                });

        // Add additional filler rows
        examRows = self.addFillerRows(examRows, pageLen);

        dataTable.addRows(examRows);
    },

    addFillerRows: function(rowsArray, requiredRows) {
        var totalRows = rowsArray.length,
            numRowsToFill,
            emptyRow = [
                null,
                null
            ];

        if (totalRows < requiredRows) {
            numRowsToFill = requiredRows - totalRows;

            for (; numRowsToFill > 0; --numRowsToFill) {
                // Add filler rows
                rowsArray.push(emptyRow);
            }
        }

        // Simply as a formality, since the rowsArray is being passed by reference
        return rowsArray;
    },

    /**
     * Return chart options
     * @returns {Object} options
     */
    getChartOptions: function(ticksNumber, height, pageLen){

        var ticks = [];
        for(var i=1; i<=ticksNumber; i++) {
            ticks.push(i===9 ? '_' : i);
        }
        return {
            tooltip : { trigger: 'none' },
            backgroundColor: 'transparent',
            chartArea: {
                top: "3%",
                width: "90%",
                height: '90%'
            },
            orientation: "horizontal",
            //calculates the with based on the number of rows/data
            width: "100%",
            height: height,
            bar: {
                groupWidth: "37"
            },
            colors: ["#008398"],
            legend: { position: 'none' },
            hAxis: {
                viewWindow: {
                    min: 0,
                    max: pageLen
                },
                titleTextStyle: {
                    color: "#333",
                    bold: true,
                    italic: false,
                    fontName: "Helvetica"
                },
                textStyle: {
                    color: "#888",
                    fontName: "Helvetica",
                    fontSize: 11
                },
                gridlines: {
                    color: "#ffffff"
                },
                baselineColor: "#ffffff"
            },
            vAxis: {
                title: I18n.t('common.examMasteryLevel'),
                titleTextStyle: {
                    color: "#333",
                    bold: true,
                    italic: false,
                    fontName: "Helvetica"
                },
                textStyle: {
                    color: "#888",
                    fontName: "Helvetica"
                },
                minValue: 0 ,
                maxValue: ticksNumber,
                gridlines: {
                    color: "#e5e5e5"
                },
                ticks: ticks,
                baselineColor: "#e5e5e5"
            }
        };
    },

    actions:{
        hideTooltip: function(){
            this.get("_columnChart").setSelection([]);
            this.set("selectedExam", null);
            this.set("selectedExamLabel", null);
        }
    }
});