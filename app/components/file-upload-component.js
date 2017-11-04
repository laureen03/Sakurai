/**
 * Component for a file upload
 *
 * @extends Ember.Component
 */
SakuraiWebapp.FileUploadComponent = Ember.Component.extend({
    /*
     * === PROPERTIES
     */
    tagName: 'div',

    classNames: ['file-upload'],

    classNameBindings: ['component-class'],

    /*
     * @property {string} Special component class
     */
    'component-class': '',

    /*
     * @property {string} i18n key to use as text label for the file upload button
     */
    'btn-label': 'common.chooseFile',

    /*
     * @property {string} comma-separated string of file types allowed for uploading by the browser
     */
    'data-input-accepts': 'image/gif, image/jpeg, image/png, image/bmp',

    /*
     * @property {string} i18n key for a file upload error
     */
    'error-label' : 'error.formatNotAccepted',

    /*
     * @property {number} max file size to validate against
     */
    'max-file-size': 26214400,

    /*
     * @property {string} i18n key for the remove file link text
     */
    'remove-label': 'common.remove',

    /*
     * @property {Object} Object with the properties of the selected file:
     * - relativePath: file full path (includes the file name)
     * - fileName: file name
     * - content: file content
     * - mediaType: file type (e.g. 'image')
     */
    'file-information': null,


    actions: {

        /**
         * File change event run when the input file is changed
         * also sends event to onFileChange. Reads the file from the input and sets the base64 value as the content
         * string in the quesitonMedia hash passed to the controller method.
         */
        fileChange: function() {
            var self = this,
                input = this.$('input'),
                maxSize = this.get('max-file-size'),
                reader;

            Ember.Logger.debug('changing the uploaded image');

            file = input.prop('files')[0]; // file object of element

            if (file.size < maxSize) {

                Ember.Logger.debug('file format validation is ' + input.valid());

                if (file && input.valid()) {
                    reader = new FileReader();

                    reader.onload = function(e) {
                        Ember.Logger.debug('onload image: ' + file.name);

                        var fileDataContent = e.target.result;
                        var questionMedia = {
                            relativePath: file.name,
                            fileName: file.name,
                            content: fileDataContent,
                            mediaType: 'image'
                        };
                        self.set('file-information', questionMedia);
                    };
                    reader.readAsDataURL(file);
                }

            } else {
                // Reset the image and show error message for exceeding the size limit
                this.$('input').val(null);
                this.set('file-information', null);
                toastr.error(I18n.t('error.imageSizeExceedsLimit'));
            }
        },

        /**
         * RemovedFile event.
         * Sends action to the controller, and resets the input[file] field
         */
        removeFile: function() {
            this.$('input').val(null);
            this.set('file-information', null);
            this.sendAction("onFileRemove");
        },

        /**
         * Open File window
         **/
        openUpload: function() {
            this.$('input').click();
        }
    }
});
