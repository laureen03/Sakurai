SakuraiWebapp.StudentExamReportsView = Ember.Component.extend(SakuraiWebapp.UserInterfaceFeaturesMixin, {

    layoutName: 'layout/forStudentComplete',

    /*
     * Index for controlling the number of performances being shown/hidden
     */
    hideIndex: 3,

    /*
     * Animation speed for interactions
     */
    animationSpeed: 300,

    didRender: function() {
        Ember.run.scheduleOnce('afterRender', this, 'initMenu');
    },

    initMenu : function() {
        this.activeHeaderMenu("menu-exam-reports");
    },

    didReceiveAttrs : function(){
        this.fixMainMenu();
        this.fixSecondaryMenu();

        this.setupScrollToLinks();

        Ember.run.scheduleOnce('afterRender', this, this.setSubscriptions);
        Ember.run.scheduleOnce('afterRender', this, this.initCategories);
    },

    setSubscriptions: function () {
        var self = this,
            speed = this.get('animationSpeed'),
            hideIndex = this.get('hideIndex');

        // subscriptions on DOM elements
        $('.performances .show-all > a').on('click', function() {
            var $this = $(this),
                $container = $this.closest('.category');

            if (!SakuraiWebapp.context.isEnvironment('test')) {
                // Hide the view more link, then show the rest of the performances
                $this.animate({
                    opacity: 0
                }, speed, function() {
                    $this.addClass('invisible');
                    self.showExceedingPerformances($container, hideIndex);
                });
            } else {
                // Test environment does not require animation
                $this.addClass('invisible');
                self.showExceedingPerformances($container, hideIndex);
            }
        });
    },

    initCategories: function () {
        var self = this,
            hideIndex = this.get('hideIndex');

        $('.performances .content > .category').each( function(index, containerEl) {
            var $container = $(containerEl);

            if ($container.find('.unit').length > hideIndex) {
                // If there are more than 3 performances for the category
                // then hide the exceeding performances and enable the
                // expand link
                self.hideExceedingPerformances($container, hideIndex);
                $container.find('.show-all').removeClass('hidden');
            }
        });
    },

    hidePerformance: function($performance) {
        var height,
            speed = this.get('animationSpeed');

        if (!SakuraiWebapp.context.isEnvironment('test')) {

            // Save the height for restoring it later when it is shown
            height = $performance.css('height');
            $performance.data('unit-height', height);

            // When hiding a performance, first the opacity is reduced to 0, then
            // the widget is shrunk till its height is 0 and finally it's removed
            // from the render tree
            $performance.animate({
                opacity: 0
            }, speed, function() {
                $performance.animate({
                    height: 0
                }, speed, function() {
                    $performance.toggleClass('hidden');
                });
            });
        } else {
            // animations won't be necessary in the testing environment
            $performance.toggleClass('hidden');
        }
    },

    showPerformance: function($performance) {
        var height,
            speed = this.get('animationSpeed');

        // When showing a performance, first it's added to the render tree
        $performance.toggleClass('hidden');

        if (!SakuraiWebapp.context.isEnvironment('test')) {

            height = $performance.data('unit-height');

            // The performances widget is expanded and finally it's content is revealed
            $performance.animate({
                height: height
            }, speed, function() {
                $performance.animate({
                    opacity: 1
                }, speed);
            });
        }
    },

    hideExceedingPerformances: function ($container, hideIndex) {
        var self = this;

        $container.find('.unit').each( function(index, unit) {
            if (index >= hideIndex) {
                self.hidePerformance($(unit));
            }
        });
    },

    showExceedingPerformances: function ($container, hideIndex) {
        var self = this;

        $container.find('.unit').each( function(index, unit) {
            if (index >= hideIndex) {
                self.showPerformance($(unit));
            }
        });
    },

    willDestroyElement: function() {
        $('.performances .show-all > a').off('click');

        this.teardownScrollToLinks();
    }
});
