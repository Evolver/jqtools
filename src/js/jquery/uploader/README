
Theory:

  jQuery.uploader is the wrapper API for SWFUpload implementation of file uploading using Flash.
  
  Documentation for SWFUpload object (swfu) is located on SWFUpload official home -
    http://demo.swfupload.org/Documentation/
    
  The idea behind the scenes is to create a transparent overlay over the zone that is requested
    to be clickable for file uploading. This is accomplished by inserting absolute DIV element
    right after the target zone. That DIV contains another DIV, which is the container for the
    Flash object, that is an actual receiver of a click. Flash object is transparent and is not
    'visible' to user, and when user clicks the target zone, he actually clicks the Flash object
    (SWFUpload), which handles the file uploading.
    
  All SWFUpload events are translated to native jQuery events and are available for handling
    by binding to them. The following are the names for the SWFUpload native event names and
    their according names for uploader library:
    
      SWFUpload native events:      jQuery.uploader events:
     ---------------------------   ---------------------------
      file_dialog_start             upload_open
      file_queued                   upload_queue_add
      file_queue_error              upload_queue_refuse
      file_dialog_complete          upload_close
      upload_start                  upload_start
      upload_progress               upload_progress
      upload_error                  upload_error
      upload_success                upload_success
      upload_complete               upload_complete

  Before using the library, you have to globally configure it by calling once a $.configureUploader() method.
  
  Currently, this method receives only one parameter "swfUrl", which points (relatively or absolutely) to
    swfupload.swf file.
    
  See minimal markup to study how to handle uploader events.
      
minimal markup (example):

  <script type="text/javascript">
  $.configureUploader({
    // specify path to swfupload.swf file
    'swfUrl': '../src/js/swfupload/swfupload.swf'
  });
  </script>

  Click <span id="button">here</span> to select files.
  
  <script type="text/javascript">
  // make button clickable
  $( '#button')
    // initialize button
    .uploader({
      // url where to upload files
      'url': 'http://jquery.ui.local:8080/tests/uploadTest.php',
      // allow multiple file selection
      'multi': true,
      // list of file types to show in dialog
      'fileTypes': '*.jpg;*.gif',
      // descriptive message to show near file type list
      'fileTypeDescr': 'Images'
    })
    // handle events
  	.bind( 'upload_open', function( e, data){
  		// data.swfu - SWFUpload instance
  		
  		// opened upload dialog
  	})
  	.bind( 'upload_queue_add', function( e, data){
  		// data.swfu - SWFUpload instance
  		// data.file - SWFUpload file object
  		
  		// added file to queue
  	})
  	.bind( 'upload_queue_refuse', function( e, data){
  		// data.swfu - SWFUpload instance
  		// data.file - SWFUpload file object
  		// data.errno - error number
  		// data.error - error message
  		
  		// file refused to be accepted to queue
  	})
  	.bind( 'upload_close', function( e, data){
  		// data.swfu - SWFUpload instance
  		// data.selected - selected file count
  		// data.queued - queued file count
  		// data.queueSize - total files in queue
  		
  		// closed upload dialog
  		
  		// see if any files queued, and if they are, start uploading
  		with( data) {
  		  if( queueSize >0)
  		    swfu.startUpload();
  		}
  	})
  	.bind( 'upload_start', function( e, data){
  		// data.swfu - SWFUpload instance
  		// data.file - SWFUpload file object
  		
  		// file upload started
  	})
  	.bind( 'upload_progress', function( e, data){
  		// data.swfu - SWFUpload instance
  		// data.file - SWFUpload file object
  		// data.sent - amount of bytes sent
  		// data.size - total file size in bytes
  		
  		// file upload progress
  	})
  	.bind( 'upload_error', function( e, data){
  		// data.swfu - SWFUpload instance
  		// data.file - SWFUpload file object
  		// data.errno - error number
  		// data.error - error message
  		
  		// file upload failed
  	})
  	.bind( 'upload_success', function( e, data){
  		// data.swfu - SWFUpload instance
  		// data.file - SWFUpload file object
  		// data.response - server response in format specified during button instantiation
  		
  		// file upload succeeded and got valid response from server.
  	})
  	.bind( 'upload_complete', function( e, data){
  		// data.swfu - SWFUpload instance
  		// data.file - SWFUpload file object
  		
  		// upload completed
  		
  		// continue with next file (if such is available in queue)
  		with( data) {
  		  var stats =swfu.getStats();
  		  if( stats.files_queued >0)
  		    swfu.startUpload();
  		}
  
  	});
  </script>
  
API:

  var jUploader =$( '#button').uploader( '...');
  
  // get SWFUpload object instance associated with uploader
  [object SWFUpload] jUploader.getSwfUpload();

usage:

  $( '#button')
    .uploader({
    
      /**
       * URL where to POST the selected files. The files are being uploaded in linear fashion.
       *
       */
      url: 'http://example.com/handle-file-upload.php',
      
      /**
       * File POST name. Under this name you will be referencing uploaded file on server side.
       *
       */
      name: 'file',
      
      /**
       * Whether to allow multiple file selection or no.
       *
       */
      multi: true,
      
      /**
       * Object, containing optional data to POST along with file.
       *
       */
      requestData: {
        // for example, this could be a session id
        'sessionId': '01234567890123456789012345678912'
      },
      
      /**
       * In which format you expect to receive data from server. Default is JSON
       *  (jQuery.UPLOADER_RESPONSE_JSON).
       *
       * Possible values:
       *    jQuery.UPLOADER_RESPONSE_JSON (default)
       *    jQuery.UPLOADER_RESPONSE_RAW
       *
       */
      responseType: jQuery.UPLOADER_RESPONSE_JSON,
      
      /**
       * List of file types to show in file selection dialog. The format of string is '<name>.<ext>;...',
       *  where in place of <name> and <ext> wildcards (*) can be used.
       *
       */
      fileTypes: '*.gif;*.jpg',
      
      /**
       * String, describing the file types user will be able to select for upload.
       *
       */
      fileTypeDescr: 'Image files',
      
      /**
       * Maximum amount of files that can be held in queue simultaneously. 0 - unlimited amount.
       *
       */
      maxQueue: 0,
      
      /**
       * Maximum file to be uploaded size in bytes. 0 - accept file with any size.
       *
       */
      maxSize: 0,
      
      /**
       * Library uses timed 'alignment' for Flash overlay to be always the same size the target object is.
       *  This is the frequency of size checks in miliseconds. You will rarely (even maybe never) have to
       *  change this. Default is 500ms (every half a second).
       *
       */
      alignFreq: 500
      
    });