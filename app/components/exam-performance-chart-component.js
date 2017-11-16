/*
 * @param total-answers {number} total number of answers this component will be in charge of paginating
 * @param page-length {number} number of results displayed per page
 * @param current-page {number} page the component is currently on
 */

import Ember from "ember"; 
import context from "utils/context";

export default Ember.Component.extend({

    dataTable: null,
    lineChart: null,
    scroll_action: "goToAnswerKey",
    positionSelected: null,
    previousSelection: null,
    paginationExecuted: null,

    /**
     * @property {int} Maximum threshold value
     */
    maxValue: 8,

    didInsertElement: function(){

        var dataTable = new google.visualization.DataTable(), // Create the data table
            lineChart = new google.visualization.LineChart(document.getElementById('chart_performance')),
            threshold = this.get("threshold") || 4,
            assignment = this.get("assignment"),
            self = this;

        this.set('dataTable', dataTable);
        this.set('lineChart', lineChart);

        if (!context.isTesting()){
            google.visualization.events.addListener(lineChart, 'ready', this.placeMarker.bind(lineChart, dataTable, threshold, assignment, this.getVerticalTicksNumber(threshold)));
        }
        google.visualization.events.addListener(lineChart, 'select', function(){self.selectHandler(lineChart, dataTable);});
        // Only add the table columns once
        this.addDataTableColumns(dataTable);
        this.drawChart();
    },


    selectHandler: function selectHandler(lineChart) {
        var component = this,
            pageLen = this.get('page-length'),
            currentPage = this.get('current-page'),
            paginationExecuted = this.get('paginationExecuted'),
            isQuestionSelected = lineChart.getSelection().length !== 0,
            additionalIndex = (paginationExecuted) ? 0 : 1;

        if (isQuestionSelected) {
            component.set("previousSelection", lineChart.getSelection());
            component.set("positionSelected", lineChart.getSelection()[0].row);
        } else if (component.get("previousSelection")){
            lineChart.setSelection(component.get("previousSelection"));
        }

        if (currentPage > 1 && !paginationExecuted) {
            component.set("paginationExecuted", true);
        }

        component.sendAction("scroll_action", (((currentPage - 1) * pageLen) + (component.get("positionSelected") + additionalIndex)));
    },


    willDestroyElement: function () {
        var lineChart = this.get('lineChart');

        google.visualization.events.removeAllListeners(lineChart);

        // Release all allocated resources for the chart
        lineChart.clearChart();

        this.set('dataTable', null);
        this.set('lineChart', null);
    },

    /**
     *
     * @param threshold
     * @returns int
     */
    getVerticalTicksNumber: function (threshold) {
        var maxValue = this.get("maxValue");
        return (threshold ===  maxValue) ? maxValue+1 : maxValue;
    },


    /**
     * Draws the overall performance chart
     */
    drawChart: Ember.observer('answerKeys', 'total-answers', 'page-length', 'current-page', function () {

        var dataTable = this.get('dataTable'),
            lineChart = this.get('lineChart'),
            answerKeys = this.get('answerKeys'),
            totalAnswers = this.get('total-answers'),
            pageLen = this.get('page-length'),
            currentPage = this.get('current-page'),
            threshold = this.get("threshold") || 4,
            options = this.getChartOptions(totalAnswers, pageLen, currentPage, threshold);

        if (currentPage > 1) {
            this.set('paginationExecuted', true);
        }
        if (dataTable && dataTable.getNumberOfRows()) {
            // Remove existing rows before adding new/updated rows back in
            dataTable.removeRows(1, pageLen);
        }
        this.addQuestionAnsweredRows(dataTable, answerKeys, pageLen, currentPage);

        // Create and draw the visualization.
        try {
            lineChart.draw(dataTable, options);
        } catch (e) {
            Ember.Logger.warn(e);
        }
    }),

    /**
     * Mone Legend to the line position
     * @param dataTable
     * @param threshold
     */
    placeMarker: function(dataTable, threshold, assignment, maxThreshold) {
        if(!assignment || !assignment.get('hideThresholdLabels')){
            var percentageTop, percentageBottom;
            var chartArea = $('#chart_performance svg rect:eq(0)');
            var top = chartArea.attr("y");
            var marginTop = (chartArea.attr("height") / maxThreshold) / 2;
            $(".passing-threshold").height(chartArea.attr("height"));
            $(".passing-threshold").width(chartArea.attr("width"));
            $(".passing-threshold").css("top", (parseInt(chartArea.attr("y")) + marginTop) + "px");
            $(".passing-threshold").css("left", (parseInt(chartArea.attr("x")) + 5) + "px");

            percentageBottom = ((100 * threshold) / maxThreshold) - 5; //5% half of yellow line
            percentageTop = 100 - percentageBottom - 10; //10% is the Yellow Line
            $(".passing-threshold .green-gradient").css("height", percentageTop + "%");
            $(".passing-threshold .red-gradient").css("height", percentageBottom + "%");

            //Position of label
            var cli = this.getChartLayoutInterface();
            $('.marker-threshold').css("top", (Math.floor(cli.getYLocation(threshold)) - 93) + parseInt(chartArea.attr("y")) + "px");
            //The ajustement expression is a linear function where f(8)=64 and f(2)=-20
            $('.label-threshold').css("top", (Math.floor(cli.getYLocation(threshold)) - 93 - (top / 2) + (17*threshold-56)) + "px");
        } else {
            $("#minimumNCLEXProficiency").css("display", "none");
            $("#minimumNCLEXProficiencyMarker").css("display", "none");
        }
    },

    /**
     * Setups the data table columns for the chart
     * @param dataTable
     */
    addDataTableColumns: function(dataTable){
        dataTable.addColumn({type: 'number', label: I18n.t('exam.masteryLevel')});
        dataTable.addColumn({type: 'number', label: I18n.t('exam.correctAnswer')});
        dataTable.addColumn({type: 'string', role: 'tooltip', p: {'html':true}});
        dataTable.addColumn({type: 'number', label: I18n.t('exam.incorrectAnswer')});
        dataTable.addColumn({type: 'string', role: 'tooltip', p: {'html':true}});
    },


    /**
     * Generates the tooltip content for quiz details
     * @param question
     * @param ml
     * @returns {string}
     */
    getMasteryLevelTooltip: function (question, ml) {
        return  '<div class="exam-tooltip">' +
            '<div>' + I18n.t('exam.question') + ':&nbsp;<b>'+ question +'</b>'+
            '<div>' + I18n.t('exam.masteryLevel') + ':&nbsp;<b>'+ml+'</b>'+
            '</div>';
    },


    /**
     * Adds the data items to the chart
     * @param dataTable
     * @param answerKeys {AnswerKey[]} Class Usage
     * @param pageLen {number} number of answers per page
     * @param currentPage {number} page currently displaying in the chart
     * @return int highest value
     */
    addQuestionAnsweredRows:function(dataTable, answerKeys, pageLen, currentPage){
        var component = this,
            answerKeyArray = (answerKeys && answerKeys.toArray()) || [],
            lowerLimit = (currentPage - 1) * pageLen,
            upperLimit = currentPage * pageLen;

        $.each(answerKeyArray, function(index, item) {
            var tooltip;

            if (index < lowerLimit) {
                // continue to the next iteration
                return true;
            } else if (index >= upperLimit) {
                // no more answers to show, break the loop
                return false;
            } else {
                item.get("result").then( function(result) {
                    var masteryLevel = result.get("masteryLevel"),
                        rowIndex = index + 1;

                    tooltip = component.getMasteryLevelTooltip(rowIndex, masteryLevel);

                    if (result.get("correct")){
                        dataTable.addRow([rowIndex,
                            masteryLevel,
                            tooltip,
                            null,
                            null
                        ]);
                    }
                    else{
                        dataTable.addRow([rowIndex,
                            null,
                            null,
                            masteryLevel,
                            tooltip
                        ]);
                    }
                });
            }
        });
    },

    /**
     * Return chart options
     * @returns {Object} options
     */
    getChartOptions: function(totalAnswers, pageLen, currentPage, threshold) {
        var hAxisStart = (currentPage - 1) * pageLen,
            hAxisEnd = currentPage * pageLen,
            _hTicks = this.calculateTicks(hAxisStart, hAxisEnd),
            _vTicks = [],
            maxValue = this.get("maxValue"),
            verticalTicksNumber = this.getVerticalTicksNumber(threshold);
        for(var i=0; i<=verticalTicksNumber; i++) {
            _vTicks.push(i>maxValue ? '_' : i);
        }

        return{
            tooltip: { isHtml: true },
            backgroundColor: 'transparent',
            width: '100%',
            height: 450, //TODO calculate dimensions
            chartArea: {
                top: "3%",
                width: "90%",
                height: '80%'
            },
            series: {
                0: {
                    color: "#44ae44",
                    pointSize: 4,
                    lineWidth: 0
                },
                1: {
                    color: "#cd1111",
                    pointSize: 4,
                    lineWidth: 0
                }
            },
            hAxis: {
                ticks: _hTicks,
                title: I18n.t('exam.numberOfAnswers'),
                viewWindow: {
                    min: hAxisStart,
                    max: hAxisEnd
                },
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
                gridlines: {
                    color: "transparent"
                },
                baselineColor: "#ffffff"
            },
            vAxis: {
                ticks: _vTicks,
                minValue: 0 ,
                maxValue: verticalTicksNumber,
                title: I18n.t('exam.masteryLevel'),
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
                gridlines: {
                    color: "#e5e5e5"
                },
                baselineColor: "#e5e5e5"
            },
            legend: 'none'
        };
    },

    calculateTicks: function(startNum, endNum) {
        var inc = 5,
            i = startNum,
            ticks = [];

        for(; i <= endNum; i += inc) {
            ticks.push(i);
        }
        return ticks;
    }

});
