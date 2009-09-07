<script type="text/javacript">
// configure uploader globally
$.configureUploader({
	'swfUrl': 'http://post.files/swfupload.swf'
});
</script>

<div id="my_upload_button">...</div>

<script type="text/javascript">

//
$( '#my_upload_button')
	.uploader({
		'url': 'http://post.files/here.php',
		'name': 'my_file',
		'multi': true,
		'requestData': {
			'sessionId': '01234567890123456789012345678901'
		},
		'responseType': jQuery.UPLOADER_RESPONSE_JSON,
		'fileTypes': '*.jpg;*.gif',
		'fileTypeDescr': 'Images',
		'maxQueue': 10,
		'maxFileSize': 1048576 /* 1MB */
	})
	// handle events
	.bind( 'upload_open', function( e, data){
		// data.swfu - SWFUpload instance
		debug( 'open upload dialog');
	})
	.bind( 'upload_queue_add', function( e, data){
		// data.swfu - SWFUpload instance
		// data.file - SWFUpload file object
		debug( 'add file to queue');
	})
	.bind( 'upload_queue_refuse', function( e, data){
		// data.swfu - SWFUpload instance
		// data.file - SWFUpload file object
		// data.errno - error number
		// data.error - error message
		debug( 'file refused to be accepted to queue');
	})
	.bind( 'upload_close', function( e, data){
		// data.swfu - SWFUpload instance
		// data.selected - selected file count
		// data.queued - queued file count
		// data.queueSize - total files in queue
		debug( 'close upload dialog');
		
		with( data) {
		  var stats =swfu.getStats();
		  if( stats.files_queued >0)
		    swfu.startUpload();
		}
	})
	.bind( 'upload_start', function( e, data){
		// data.swfu - SWFUpload instance
		// data.file - SWFUpload file object
		debug( 'upload started');
	})
	.bind( 'upload_progress', function( e, data){
		// data.swfu - SWFUpload instance
		// data.file - SWFUpload file object
		// data.sent - amount of bytes sent
		// data.size - total file size in bytes
		debug( 'upload progress');
	})
	.bind( 'upload_error', function( e, data){
		// data.swfu - SWFUpload instance
		// data.file - SWFUpload file object
		// data.errno - error number
		// data.error - error message
		debug( 'upload failed');
	})
	.bind( 'upload_success', function( e, data){
		// data.swfu - SWFUpload instance
		// data.file - SWFUpload file object
		// data.response - server response in specified format during instantiation
		debug( 'upload succeeded. response string - "' +data.response.responseString +'"');
	})
	.bind( 'upload_complete', function( e, data){
		// data.swfu - SWFUpload instance
		// data.file - SWFUpload file object
		debug( 'upload completed');
		
		with( data) {
		  var stats =swfu.getStats();
		  if( stats.files_queued >0)
		    swfu.startUpload();
		}

	});
      
</script>