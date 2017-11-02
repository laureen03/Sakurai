/**
 * Base Instructor Controller for all sub route in the instructor module
 * @type {*}
 */
SakuraiWebapp.InstructorController = Ember.Controller.extend(SakuraiWebapp.ControllerMixin, {

    /**
     * It contains the current user classes
     */
    classes : Ember.A(),

    /**
     * Active classes
     */
    activeClasses: Ember.computed('classes.[]', function(){
        var activeClasses = Ember.A();
        var classes = this.get("classes");
        for (var i=0; i < classes.get("length"); i++){
            var clazz = classes.nextObject(i);
            if (clazz.get("active")){
                activeClasses.pushObject(clazz);
            }
        }
        return activeClasses;
    }),

    /**
     * Inactive classes
     */
    inactiveClasses: Ember.computed('classes.[]', function(){
        var inactiveClasses = Ember.A();
        var classes = this.get("classes");
        for (var i=0; i < classes.get("length"); i++){
            var clazz = classes.nextObject(i);
            if (!clazz.get("active")){
                inactiveClasses.pushObject(clazz);
            }
        }
        return inactiveClasses;
    }),

    /**
     * Adds a new class to the header
     * @param newClass
     */
    addClass: function(newClass){
        var classes = this.get("classes");
        classes.addObject(newClass);
    },

    /**
     * Remove a class to the header
     * @param clazz
     */
    removeClass: function(clazz){
        var classes = this.get("classes");
        classes.removeAt(classes.indexOf(clazz), 1);
    },

    /**
     * Refreshes the class, i.e move it from active to inactive
     * @param clazz
     */
    updateClass: function(clazz){
        this.removeClass(clazz);
        this.addClass(clazz);
    },

    /**
     * Return the classes associated with the ids
     * @param ids
     * @return {SakuraiWebapp.Class[]} classes found
     */
    getClassesByIds: function(ids){
        var found = Ember.A();
        var classes = this.get("classes");
        classes.forEach(function(clazz, index){
            var id = clazz.get("id");
            if ($.inArray(id, ids) >= 0){
                found.addObject(clazz);
            }
        })
        return found;
    },

    /**
     *
     * Retrieve the active classes by product
     * @param {number} productId
     * @return {Promise} Full fills SakuraiWebapp.Class[]
     */
    getActiveClassesByProduct: function(productId) {
        var activeClasses = this.get('activeClasses');
        var promises = activeClasses.map(function (clazz) {
            return clazz.get("product")
        });

        return DS.PromiseArray.create({
            promise :
                Ember.RSVP.all(promises).then(function(){
                    return activeClasses.filter(function(clazz){
                        return clazz.get("product").get("id") == productId;
                    });
                })
        });
    }

});