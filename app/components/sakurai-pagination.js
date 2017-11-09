/**
 * Component for displaying a pagination control.
 * Based on its parameters, it will determine whether it should be displayed or not
 * (the total number of results is less than or equal to the page length)
 *
 * @extends Ember.Component
 *
 * @param component-class {string} special class to add to the component's tag (optional)
 *
 * @param total-results {number} total number of results this component will be in charge of paginating
 * @param page-length {number} number of results displayed per page
 * @param current-page {number} page the component is currently on (optional -defaults to the first page i.e. 1)
 * @param page-tabs {number} total number of page tabs to display (optional -defaults to one page i.e. the current page)
 * @param previous-label {string} label to use in button to show previous pages
 *        (i18n property -defaults to common.previous)
 * @param next-label {string} label to use in button to show succeeding pages
 *        (i18n property -defaults to common.next)
 *
 */
import Ember from "ember"; 

export default Ember.Component.extend({

    tagName: 'div',

    classNames: ['sakurai-pagination'],
    classNameBindings: ['component-class'],

    'component-class': '',

    'next-label': I18n.t('common.next'),

    'previous-label': I18n.t('common.previous'),

    'current-page': 1,

    'page-length': 1,

    'page-tabs': 1,

    'total-results': 1,

    getPageIndex: function (pageIndex, totalPages) {
        if (pageIndex > 0) {
            // If the page index is greater than the total number of pages, then
            // set the current page to the last page
            return (pageIndex <= totalPages) ? pageIndex : totalPages;
        } else {
            return 1;
        }
    },

    /*
     * @property {boolean} should the pagination control be displayed or not
     */
    isVisible: Ember.computed('totalPages', function(){
        return this.get('totalPages') > 1;
    }),

    /*
     * @property {number} computed property that ensures the current page index stays within bounds all the time
     */
    pageIndex: Ember.computed('current-page', 'totalPages', function(){
        var totalPages = this.get('totalPages'),
            currentPage, value;

        if (arguments.length > 1) {
            // setter
            this.set('current-page', this.getPageIndex(value, totalPages));

        } else {
            // getter
            currentPage = this.get('current-page');
            // Make sure 'current-page' stays within bounds
            this.set('current-page', this.getPageIndex(currentPage, totalPages));
        }

        // getter
        return this.get('current-page');
    }),

    /*
     * @property {Array} computed property that returns an array of page objects
     * Each page object consists of:
     * { number: {number} -page number>,
     *   active: {bool} -current page }
     */
    pageTabs: Ember.computed('page-tabs', 'totalPages', 'pageIndex', function(){
        var pageTabs = this.get('page-tabs'),
            totalPages = this.get('totalPages'),
            pageIndex = this.get('pageIndex'),
            spacesToLeft = pageIndex - 1,
            spacesToRight = totalPages - pageIndex,
            pages = [],
            tabsToLeft, tabsToRight,
            i, limit;

        // Make sure there are no more page tabs than the total number of pages
        pageTabs = (pageTabs > totalPages) ? totalPages : pageTabs;

        // Subtract the current page from the number of page tabs
        pageTabs -= 1;

        // One operation is done with .ceil and the other one with .floor to
        // be able to work with odd numbers as well
        tabsToLeft = Math.ceil(pageTabs / 2);
        tabsToRight = Math.floor(pageTabs / 2);

        // If there are not enough spaces for the tabs on one side, the exceeding tabs  will be
        // moved to the other side to keep the number of tabs constant
        if (tabsToLeft > spacesToLeft) {
            tabsToRight += (tabsToLeft - spacesToLeft);
            tabsToLeft = spacesToLeft;
        } else if (tabsToRight > spacesToRight) {
            tabsToLeft += (tabsToRight - spacesToRight);
            tabsToRight = spacesToRight;
        }

        for (i = pageIndex - tabsToLeft, limit = pageIndex; i < limit ; i++) {
            if (i > 0) {
                pages.push({ "number": i });
            }
        }

        pages.push({ "number": i, "active": true });

        for (i = pageIndex + 1, limit = pageIndex + tabsToRight; i <= limit ; i++) {
            pages.push({ "number": i });
        }

        return pages;
    }),

    /*
     * @property {boolean} are there more previous pages?
     */
    morePreviousPages: Ember.computed('pageIndex', function(){
        return this.get('pageIndex') > 1;
    }),

    /*
     * @property {boolean} are there more succeeding pages?
     */
    moreSucceedingPages: Ember.computed('pageIndex', 'totalPages', function(){
        return this.get('pageIndex') < this.get('totalPages');
    }),

    /*
     * @property {Ember.ArrayProxy} array with page objects (where each object will be: { number: <pageNumber })
     */
    pages: Ember.ArrayProxy.create(),

    /*
     * @property {number} number of pages needed to show all the results
     */
    totalPages: Ember.computed('total-results', 'page-length', function(){
        var pageLen = this.get('page-length') || 1;

        return Math.ceil(this.get('total-results') / pageLen);
    }),


    willInsertElement: function() {
        this.get('pages').set('content', this.get('pageTabs'));
    },

    willDestroyElement: function() {
        this.get('pages').set('content', []);
    },

    updatePages: Ember.observer('totalPages', function() {
        this.get('pages').set('content', this.get('pageTabs'));
    }).on('change'),

    updateCurrentPage: function(currentPage) {
        this.set('pageIndex', currentPage);
        this.sendAction('updateGraph', currentPage);
    },

    actions: {
        showPreviousPage: function() {
            this.updateCurrentPage(this.get('pageIndex') - 1);
        },
        showNextPage: function () {
            this.updateCurrentPage(this.get('pageIndex') + 1);
        },
        showPage: function (pageNumber) {
            this.updateCurrentPage(pageNumber);
        }
    }

});
