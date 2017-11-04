/**
 * Component for viewing performance stats.
 * It is possible to view all performance stats related to a chapter or term taxonomy,
 * or only the strengths and/or weaknesses related to it
 *
 * @extends Ember.Component
 * @param data-type {string} indicates the performance list type
 * @param data-stats {SakuraiWebapp.TermTaxonomyStat|SakuraiWebapp.ChapterStat} stats data
 * @param data-category {string} name of chapter or term taxonomy (optional)
 * @param data-category-i18n {string} i18n name of chapter or term taxonomy (e.g. common.nursingConcept) (optional)
 * @param data-filter-type {boolean} indicates if it should filter by type (optional)
 * @param data-toggle-link {boolean} show a link to be able to toggle between the views (see data-show-all) (optional)
 * @param data-item-click {function} action to execute when a performance item is clicked (optional)
 */

SakuraiWebapp.PerformanceListComponent = Ember.Component.extend({
    /*
     * === PROPERTIES
     */
    tagName: 'div',
    classNames: ['performance-list'],
    classNameBindings: ['data-component-class', 'data-show-all:show-all:show-filtered'],
    strengthsLimit: 3,  // Max number of strengths displayed in 'Strengths/Weaknesses' view
    weaknessesLimit: 3, // Max number of weaknesses displayed in 'Strengths/Weaknesses' view

    'anchor-id': 'list-top',
    'animation-speed': 400,

    /*
     * @property {string} Special component class
     */
    'data-component-class': '',
    'data-show-all': false,
    'data-toggle-link': false,

    /**
     * @property {string} category title
     */
    categoryTitle: Ember.computed("data-category", "data-category-i18n", function(){
        var i18n = this.get("data-category-i18n");
        var label = (this.get("data-category")) ? this.get("data-category") : I18n.t("common.chapter.other");
        if (i18n){
            label = I18n.t(i18n);
        }

        return label;
    }),

    categoryTitleSingular: Ember.computed('categoryTitle', function(){
        var singularize = Ember.String.singularize(this.get("categoryTitle").toLowerCase());
        return  singularize;
    }),

    toggleLinkEnabled: Ember.computed('performances.[]', 'data-toggle-link', function(){
        // Do not display the toggle link if the total list of elements is
        // equal or less to the number of elements in the strengths and
        // weaknesses lists combined
        var performances = this.get('performances')|| [],
            strengths = this.get('strengths') || [],
            weaknesses = this.get('weaknesses') || [],
            subsetListsLength = strengths.get('length') + weaknesses.get('length');
        return  this.get("data-toggle-link") &&
                (performances.get('length') > subsetListsLength);

    }),

    /**
     * Returns the strengths filter by type and sorted
     * @property {SakuraiWebapp.TermTaxonomyPerformance[]|SakuraiWebapp.ChapterPerformance[]}
     */
    strengths: Ember.computed("data-stats.strengths.[]", "data-type", function(){
        var component = this;
        var items = (this.get("data-filter-type")) ?
            this.get("data-stats").strengthsByType(this.get("data-type")) :
            this.get("data-stats").get("strengths");
        return DS.PromiseArray.create({
            promise: new Ember.RSVP.Promise(function (resolve, reject) {
                items.then(function(strengths){
                    var maxItems = component.get('strengthsLimit');
                    var sortedPerformances = SakuraiWebapp.Utils.sortObjects(strengths.toArray(), { 'classAverage': false, 'id': true });

                    if (maxItems) {
                        // only show a number of elements from the sorted list
                        sortedPerformances = sortedPerformances.slice(0, maxItems);
                    }

                    // Add special class to identify the strengths when combined with the rest of the performances
                    sortedPerformances.forEach( function(item) {
                        item.set('className', 'strength');
                    });

                    resolve(Ember.A(sortedPerformances));
                });
            })
        });
    }),

    /**
     * Returns the weaknesses filter by type and sorted
     * @property {SakuraiWebapp.TermTaxonomyPerformance[]|SakuraiWebapp.ChapterPerformance[]}
     */
    weaknesses: Ember.computed("data-stats.weaknesses.[]", "data-type", function(){
        var component = this;
        var items = (this.get("data-filter-type")) ?
            this.get("data-stats").weaknessesByType(this.get("data-type")) :
            this.get("data-stats").get("weaknesses");
        return DS.PromiseArray.create({
            promise: new Ember.RSVP.Promise(function (resolve, reject) {

                items.then( function(weaknesses) {
                    var maxItems = component.get('weaknessesLimit')
                    var sortedPerformances = SakuraiWebapp.Utils.sortObjects(weaknesses.toArray(), { 'classAverage': true, 'id': false });

                    if (maxItems) {
                        // only show a number of elements from the sorted list
                        sortedPerformances = sortedPerformances.slice(0, maxItems);
                    }

                    // Add special class to identify the weaknesses when combined with the rest of the performances
                    sortedPerformances.forEach( function(item) {
                         item.set('className', 'weakness');
                    });

                    resolve(Ember.A(sortedPerformances));
                });
            })
        });
    }),

    /**
     * Returns the performances filter by type and sorted
     * @property {SakuraiWebapp.TermTaxonomyPerformance[]|SakuraiWebapp.ChapterPerformance[]}
     */
    performances: Ember.computed('data-stats.performances.[]', function(){
        var component = this;
        var items = (this.get("data-filter-type")) ?
            this.get("data-stats").performancesByType(this.get("data-type")) :
            this.get("data-stats").get("performances");
        return DS.PromiseArray.create({
            promise: new Ember.RSVP.Promise(function (resolve, reject) {
                Ember.RSVP.hash({
                    performances: items,
                    strengths:  component.get('strengths'),
                    weaknesses: component.get('weaknesses')
                }).then( function(hash) {
                        var outputList,
                            sortedPerformances,
                            weaknessesDescending,
                            performances = hash.performances,
                            strengths = hash.strengths,
                            weaknesses = hash.weaknesses;

                        // Remove the weaknesses and the strengths. Those will be added back to the list once it has
                        // been sorted
                        performances.removeObjects(strengths.toArray());
                        performances.removeObjects(weaknesses.toArray());
                        sortedPerformances = SakuraiWebapp.Utils.sortObjects(performances.toArray(), { 'classAverage': false, 'id': true });
                        weaknessesDescending = SakuraiWebapp.Utils.sortObjects(weaknesses.toArray(), { 'classAverage': false });

                        // Create list again with sorted performances (minus the strengths and the weaknesses)
                        outputList = Ember.ArrayProxy.create({ content: Ember.A(sortedPerformances)});

                        // Add the sorted strengths and weaknesses back into the sorted list
                        outputList.unshiftObjects(strengths.toArray());
                        outputList.pushObjects(weaknessesDescending);
                        resolve(outputList);
                    });
            })
        });
    }),

    /**
     * @property {bool} indicates if has performances
     */
    hasPerformances: Ember.computed.alias("performances.length"),

    /**
     * @property {bool} indicates if has strengths
     */
    hasStrengths: Ember.computed.alias("strengths.length"),

    /**
     * @property {bool} indicates if has weaknesses
     */
    hasWeaknesses: Ember.computed.alias("weaknesses.length"),

    noStrengthsOrWeaknessesForClientNeeds: Ember.computed('categoryTitleSingular','performances.[]', function(){
        if (this.get('categoryTitleSingular').toLowerCase() === 'client need') {
            var strengths = this.get('strengths') || [],
                weaknesses = this.get('weaknesses') || [],
                subsetListsLength = strengths.get('length') + weaknesses.get('length');
            return (subsetListsLength == 0);
        }
        return false;
    }),

    didReceiveAttrs : function() {
        // Make id of the anchor at the top of the component unique
        var anchorId = this.get('anchor-id') + '-' + this.elementId;
        this.set('anchor-id', anchorId);
    },

    actions: {
        toggleView: function(anchorId) {
            var $root = $('html, body'),
                speed = this.get('animation-speed'),
                self = this;

            function animateToggleView(context, showAll) {
                var allStatsContainer = context.$('.all-stats'),
                    someStatsContainer = context.$('.filtered-stats');

                if (!showAll) {
                    someStatsContainer.animate({
                        opacity: 0
                    }, speed, function() {
                        // render the container, but keep its content invisible
                        allStatsContainer.css('opacity', 0);
                        // switch views
                        self.toggleProperty('data-show-all');
                        // show the hidden content
                        allStatsContainer.animate({
                            opacity: 1
                        }, speed);
                    });
                } else {
                    allStatsContainer.animate({
                        opacity: 0
                    }, speed, function() {
                        // render the container, but keep its content invisible
                        someStatsContainer.css('opacity', 0);
                        // switch views
                        self.toggleProperty('data-show-all');
                        // show the hidden content
                        someStatsContainer.animate({
                            opacity: 1
                        }, speed);
                    })
                }
            }

            if (!SakuraiWebapp.context.isEnvironment('test')) {
                $root.animate({
                    scrollTop: $('#' + anchorId).offset().top
                }, speed).promise().done( function() {
                        // using promise instead of animate callback:
                        // see http://stackoverflow.com/questions/8790752/callback-of-animate-gets-called-twice-jquery
                        //
                        // after the animation, toggle the property
                        animateToggleView(self, self.get('data-show-all'));
                    })
            } else {
                // in testing, the root element will probably be missing
                // (besides, the animations won't be necessary anyways)
                this.toggleProperty('data-show-all');
            }
        },

        /**
         * Handle click on a performance item
         * @param id
         */
        onPerformanceClick: function(id){
            this.sendAction('data-item-click', id);
        }
    }

});
