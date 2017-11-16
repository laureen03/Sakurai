/**
 * Component for the mastery level distribution
 * This component is used by HMCD and ExamSummary
 *
 * @extends Ember.Component
 *
 * @param data-i18n-title {string} i18n for title
 * @param data-i18n-x-axis {string} i18n for x axis
 * @param data-i18n-y-axis {string} i18n for y axis
 * @param data-height {number} chart height (optional, default = 250)
 * @param data-studentUsage {StudentUsage} student usage data
 *
 * @type {MasteryLevelDistributionChartComponent}
 */
import Ember from "ember"; 
import context from "utils/context";

export default Ember.Component.extend({


    /**
     * @property {string} i18n key for title
     */
    'data-i18n-title': null,

    /**
     * @property {string} i18n key for x axis
     */
    'data-i18n-x-axis': null,

    /**
     * @property {string} i18n key for y axis
     */
    'data-i18n-y-axis': null,

    /**
     * @property {number} chart height
     */
    'data-height': 200,

    /**
     * @property {StudentUsage}
     */
    'data-studentUsage': [],

    /**
     * Returns the y axis title
     * @property {string}
     */
    yAxisTitle: Ember.computed("data-i18n-y-axis", function(){ 
        return I18n.t(this.get("data-i18n-y-axis"));
    }),

    /**
     * Returns the x axis title
     * @property {string}
     */
    xAxisTitle: Ember.computed("data-i18n-x-axis", function(){ 
        return I18n.t(this.get("data-i18n-x-axis"));
    }),

    /**
     * Observes the overall performance to refresh the chart
     */
    observer: Ember.observer('studentUsage', function () {
        this.drawChart();
    }),


    didInsertElement: function () {
        var component = this;
        component.drawChart();

        context.addWindowResizeListener(function(){
            if (!component.get("isDestroyed")) {
                component.drawChart();
            }
        });
    },

    /**
     * Draws the mastery level distribution chart
     */
    drawChart: function () {

        // Create and populate the data table.
        var dataTable = new google.visualization.DataTable();
        var studentUsage = (this.get("data-studentUsage") !== null) ? this.get("data-studentUsage") : [];
        
        this.addDataTableColumns(dataTable);
        var maxValue = this.addMasteryLevelRows(dataTable, studentUsage);
        var options = this.getChartOptions(maxValue);


        // Create and draw the visualization.
        try {
            var visualitation =  new  google.visualization.BarChart(document.getElementById('mastery_level_distribution_chart'));
            visualitation.draw(dataTable, options);
        } catch (e) {
            Ember.Logger.warn(e);
        }

    },

    /**
     * Defines the data table columns
     * @param dataTable
     */
    addDataTableColumns: function(dataTable){
        // questions answered
        dataTable.addColumn({type: 'number', label: this.get("xAxisTitle") });
        dataTable.addColumn({type: 'number', label: this.get("yAxisTitle") });
        dataTable.addColumn({type: 'string', role: "tooltip" });
    },

    /**
     * Adds the data items to the chart
     * @param dataTable
     * @param {StudentUsage[]}studentUsage
     * @return int highest value
     */
    addMasteryLevelRows:function(dataTable, studentUsage){
        var component = this;
        var items = this.getDataItems(studentUsage);
        var highest = 0;
        $.each(items, function(index, item){
            var tooltip = component.get("yAxisTitle") + ": " + item.numOfStudents;
            dataTable.addRow([item.masteryLevel, item.numOfStudents, tooltip ]);
            highest = (highest > item.numOfStudents) ? highest : item.numOfStudents;
        });
        return highest;
    },

    /**
     * Return the data items for the chart
     *
     * @param {StudentUsage[]}studentUsage
     * @return {} items { 1: {masteryLevel: 1, numOfStudents: 9}, ... 2: {} }
     */
    getDataItems: function(studentUsage){
        var items = {};
        for (var i = 0; i < 8; i++){
            items[i+1] = { masteryLevel: i+1, numOfStudents: 0 };
        }
        var studentUsageArray = studentUsage.toArray();
        $.each(studentUsageArray, function(index, usage){
            var ml = Math.round(usage.get("masteryLevel"));
            var item = items[parseInt(ml)];

            item.numOfStudents = item.numOfStudents + 1;
            items[ml] = item;
        });

        return items;
    },

    /**
     * Returns chart options
     * @returns {} options
     */
    getChartOptions: function (maxValue) {
        var component = this;
        var ticks = component.calculateTicks(maxValue);
        return {
            /*tooltip: {trigger:'none'},*/
            colors: ["#008398"],
            legend: { position: 'none' },
            fontSize: 15,
            hAxis: {
                title: component.get("xAxisTitle"),
                titleTextStyle: {
                    color: "#454545",
                    bold: true,
                    italic: false,
                    fontName: "Open Sans",
                    fontSize: 12
                },
                textStyle: {
                    color: "#000",
                    fontSize: 14,
                    fontName: "Open Sans"
                },
                minValue: 0,
                maxValue: 8,
                gridlines: {
                    color: "#ffffff"
                },
                ticks: [1, 2, 3, 4, 5, 6, 7, 8],
                baselineColor: "#ffffff"
            },
            vAxis: {
                title: component.get("yAxisTitle"),
                titleTextStyle: {
                    color: "#454545",
                    bold: true,
                    italic: false,
                    fontName: "Open Sans",
                    fontSize: 12,
                },
                textStyle: {
                    color: "#000",
                    fontSize: 14,
                    fontName: "Open Sans"
                },
                minValue: 0 ,
                maxValue: ticks[ticks.length - 1] ,
                gridlines: {
                    color: "#e5e5e5"
                },
                ticks: ticks,
                baselineColor: "#e5e5e5"
            },
            orientation: "horizontal",
            width: "90%",
            height: component.get("data-height"),
            bar: {
                groupWidth: "75%"
            }
        };
    },

    calculateTicks: function(max){
        max = (max <= 5) ? 5 : max;
        var every = 1;

        if (max > 5 && max <= 10){ every = 1; }
        if (max > 10 && max <= 20 ){ every = 2; }
        if (max > 20 && max <= 50 ){ every = 5; }
        if (max > 50 && max <= 100 ){ every = 10; }
        if (max > 100){ every = 20; }

        var ticks = [];
        for(var i = 0; i <= max; i = i + every){
            ticks.push(i);
        }
        return ticks;
    }
});