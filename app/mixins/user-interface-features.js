import Ember from 'ember';

export default Ember.Mixin.create({
    
    fixMainMenu: function() {

        Ember.run.scheduleOnce('afterRender', this, function() {

            var $header = this.$('header'),
                headerHeight = $header.height(),
                $menuPlaceholder = $('<div id="menu-placeholder"></div>');

            // Give the menu placeholder the same height as that of the original menu. This way
            // the layout is not affected when the menu's position becomes 'fixed'
            $menuPlaceholder.height(headerHeight);
            $menuPlaceholder.insertAfter($header);

            this.$().addClass('main-menu-fixed');
        });
    },

    fixSecondaryMenu: function() {

        Ember.run.scheduleOnce('afterRender', this, function() {
            var $secondaryMenu = this.$('.options-menu'),
                menuWidth = $secondaryMenu.width(),
                menuHeight = $secondaryMenu.height(),
                menuTop = $secondaryMenu.offset().top,
                $menuPlaceholder = $('<div id="secondary-menu-placeholder"></div>');

            // Give the menu placeholder the same height and width as that of the original menu. This way
            // the layout is not affected when the menu's position becomes 'fixed'.
            $menuPlaceholder.width(menuWidth);
            $menuPlaceholder.height(menuHeight);
            $menuPlaceholder.addClass('col-md-3');  // Class used by secondary menu
            $menuPlaceholder.insertAfter($secondaryMenu);

            // Apart from setting position 'fixed', make sure the menu stays put in its original
            // top offset and that its width stays the same
            $secondaryMenu.css('top', menuTop);
            $secondaryMenu.css('width', menuWidth);

            this.$().addClass('secondary-menu-fixed');
        });
    },

    activeHeaderMenu: function (section) {
        $(".active").removeClass("active");
        $("." + section).addClass("active");
    },

    setupScrollToLinks: function() {

        Ember.run.scheduleOnce('afterRender', this, function() {
            var $root = $('html, body'),
                paddingTop = 20,
                offset = this.$().hasClass('main-menu-fixed') ? this.$('header').height() + paddingTop : paddingTop;

            // Add event listeners
            this.$('a[data-scroll-to]').on('click', function() {
                var $this = $(this),
                    scrollTo = $this.attr('data-scroll-to');
                var scrollTopTarget = $('#' + scrollTo);
                //If user clicks on link before scroll to target is loaded we get a type error
                //For that reason we test if the target exists before scrolling and changing
                //the color of the link
                //Now there will not be an error but the user will have the felling that the
                // link is un-responsive. Should we show a message that asks them to wait?
                if(scrollTopTarget.length) {
                    $root.animate({
                        scrollTop: scrollTopTarget.offset().top - offset
                    }, 300);

                    // Remove selection from current link
                    $this.closest('ul').find('li > a.selected').removeClass('selected');

                    // Mark the current link as selected
                    $this.addClass('selected');
                }
            });
        });
    },

    teardownScrollToLinks: function() {

        // Remove event listeners
        this.$('a[data-scroll-to]').off('click');
    },

    fixSecondaryMenuOnScroll: function () {
        var menuTop = $(".options-menu").offset().top,
            $window = $(window);

        // Add event listener to window scroll
        $window.scroll( function() {
            if ( $window.scrollTop() > menuTop) {
                $(".options-menu").addClass('fixed-menu');
                $(".hmcd-content").addClass('fixed-content');
            }
            else {
                $(".options-menu").removeClass('fixed-menu');
                $(".hmcd-content").removeClass('fixed-content');
            }
        });
    }
});
