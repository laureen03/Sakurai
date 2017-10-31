/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    // Add options here
    sassOptions: {
      extension: 'sass'
    }
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.
  //Import CSS

  app.import('bower_components/tablesorter/themes/blue/style.css');
  app.import('bower_components/select2/dist/css/select2.css');
  app.import('bower_components/bootstrap-datepicker/css/datepicker.css');
  app.import('bower_components/jquery-ui/themes/base/jquery.ui.slider.css');
  app.import('bower_components/jquery-ui/themes/base/jquery.ui.resizable.css');
  app.import('bower_components/jquery-ui-slider-pips/dist/jquery-ui-slider-pips.css');
  app.import('bower_components/toastr/toastr.css');
  app.import('bower_components/calculator/jquery.calculator.css');

  //Import Libraries
  app.import('bower_components/jquery/dist/jquery.js');
  app.import('bower_components/jquery.cookie/jquery.cookie.js');
  app.import('bower_components/i18n-js/vendor/assets/javascripts/i18n.js');
  app.import('bower_components/bootstrap/js/collapse.js');
  app.import('bower_components/bootstrap/js/dropdown.js');
  app.import('bower_components/bootstrap/js/modal.js');
  app.import('bower_components/jquery.validation/dist/jquery.validate.js');
  app.import('bower_components/jquery-ui/ui/minified/jquery-ui.min.js');
  app.import('bower_components/jquery-ui/ui/jquery.ui.slider.js');
  app.import('bower_components/jquery-ui-touch/index.js');
  app.import('bower_components/jquery-ui-slider-pips/dist/jquery-ui-slider-pips.min.js');
  app.import('bower_components/select2/dist/js/select2.min.js');
  app.import('bower_components/bootstrap-datepicker/js/bootstrap-datepicker.js');
  app.import({
    development: 'bower_components/moment/moment.js',
    production: 'bower_components/moment/min/moment.min.js'
  });
  app.import('bower_components/moment-timezone/builds/moment-timezone-with-data.min.js');
  app.import('bower_components/numeral-js/numeral.js');
  app.import('bower_components/tablesorter/jquery.tablesorter.min.js');
  app.import('bower_components/jquery-htmlclean/jquery.htmlClean.min.js');
  app.import('bower_components/toastr/toastr.js');
  app.import('bower_components/calculator/jquery.plugin.min.js');
  app.import('bower_components/calculator/jquery.calculator.min.js');
  app.import('bower_components/bootpag/lib/jquery.bootpag.min.js');
  app.import('bower_components/papaparse/papaparse.min.js');
  app.import('bower_components/ckeditor/ckeditor.js');

  return app.toTree();
};

