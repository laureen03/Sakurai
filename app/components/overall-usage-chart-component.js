import Ember from "ember"; 
import context from "utils/context-utils";
import DateUtil from "utils/Date-util";

export default Ember.Component.extend({
    /**
     * Observes the overall performance to refresh the chart
     */
    observer: Ember.observer('overallUsage', function(){
        this.drawChart();
    }),

    didInsertElement: function(){
        var component = this;
        component.drawChart();

        context.addWindowResizeListener(function(){
            if (!component.get("isDestroyed")){
                component.drawChart();
            }
        });
    },

    /**
     * Draws the overall performance chart
     */
    drawChart: function () {
        // Create and populate the data table.
        var dataTable = new google.visualization.DataTable();

        var overallUsage = this.get("overallUsage");
        this.addDataTableColumns(dataTable);
        
        var maxValue = this.addQuestionAnsweredRows(dataTable, overallUsage);

        var options = this.getChartOptions(overallUsage, maxValue);

        // Create and draw the visualization.
        try {


            var visualitation = new google.visualization.LineChart(document.getElementById('chart_usage'));
            visualitation.draw(dataTable, options);


        } catch (e) {
            Ember.Logger.warn(e);
        }
    },

    /**
     * Setups the data table columns for the chart
     * @param dataTable
     */
    addDataTableColumns: function(dataTable){
        dataTable.addColumn({type: 'date', role: 'domain', label: "I18n.t('hmcd.overallUsage.date')" });
        dataTable.addColumn({type: 'number', label: I18n.t('hmcd.overallUsage.questionAnswered') });
    },

    /**
     * Adds the data items to the chart
     * @param dataTable
     * @param {overallUsage[]}Class Usage
     * @return int highest value
     */
    addQuestionAnsweredRows:function(dataTable, overallUsage){
        var highest = 0;
        var overallUsageArray = overallUsage.toArray();
        var dateUtil = new DateUtil();

        $.each(overallUsageArray, function(index, item){
            var date = dateUtil.format(item.get("date"), dateUtil.graphFormat);
            dataTable.addRow([{v:item.get("date"), f:date}, item.get("questionsAnswered")]);
            highest = (highest > item.get("questionsAnswered")) ? highest : item.get("questionsAnswered");
        });
        return highest;
    },

    /**
     * Return chart options
     * @returns {} options
     */
    getChartOptions: function(overallUsage){
        var component = this,
        //Fix the issue if there are less quizzes than values in Y axis
            _hTicks = component.calculateHTicks(overallUsage);


        return {
            tooltip: { isHtml: true },
            pointSize: 6,
            pointShape: 'circle',
            series: {
                0: {
                    color: "#28839a"
                }
            },
            interpolateNulls: true,
            annotations: {
                style: "line",
                textStyle: {
                    color: "#333",
                    bold: false,
                    fontName: "Open Sans"
                },
                lineWidth: 2
            },
            width: '100%', 
            height: 250, //TODO calculate dimensions
            chartArea: {
                top: "2%",
                width: "80%",
                height: '75%'
            },
            vAxis: {
                title: I18n.t('hmcd.overallUsage.questionAnswered'),
                titleTextStyle: {
                    color: "#333",
                    bold: true,
                    italic: false,
                    fontName: "Open Sans"
                },
                titlePosition: "in",
                textStyle: {
                    color: "#000",
                    fontName: "Open Sans"
                },
                baselineColor: "#e5e5e5",
                gridlines: {
                    color: "#e5e5e5"
                },

            },
            hAxis: {
                ticks: _hTicks,
                title: I18n.t('hmcd.overallUsage.date'), //i18n
                titleTextStyle: {
                    color: "#333",
                    bold: true,
                    italic: false,
                    fontName: "Open Sans"
                },
                showTextEvery: 1,
                format: "##",
                gridlines: {
                    count: -1,
                    color: "#fff"
                },
                textStyle: {
                    color: "#000",
                    fontName: "Open Sans"
                },
                baselineColor: "#fff"
            },
            legend: {
                position: "bottom",
                alignment: "end",
                shape: 'circle',
                textStyle: {
                    color: "#808080",
                    fontName: "Open Sans",
                    fontSize: 13,
                }
            },
            lineWidth: 2

        };
    },

    calculateHTicks: function(overallUsage){

        var ticks = [];
        var dateUtil = new DateUtil();
        var overallUsageArray = overallUsage.toArray();
        var date;

        var mod = Math.ceil( overallUsageArray.length / 10 );
            mod = (mod < 2) ? 2 : mod; //Min value

        $.each(overallUsageArray, function(index, overall){
            date = dateUtil.format(overall.get("date"), dateUtil.graphFormat);
            if (index % mod === 0){
                ticks.push({v:overall.get("date"), f:date});
            }
        });
        return ticks;
    }

});
