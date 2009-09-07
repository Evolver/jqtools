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
			'sessionId': ...
		},
		'responseType': jQuery.UPLOADER_RESPONSE_JSON,
		'fileTypes': '*.jpg;*.gif',
		'fileTypeDescr': 'Images',
		'maxQueue': 10,
		'maxFileSize': 1048576 /* 1MB */
	})
	// handle events
	.bind( 'upload_open', function( e){
		// e.data.swfu - SWFUpload instance
	})
	.bind( 'upload_queue_add', function( e){
		// e.data.swfu - SWFUpload instance
		// e.data.file - SWFUpload file object
	})
	.bind( 'upload_queue_refuse', function( e){
		// e.data.swfu - SWFUpload instance
		// e.data.file - SWFUpload file object
		// e.data.errno - error number
		// e.data.error - error message
	})
	.bind( 'upload_close', function( e){
		// e.data.swfu - SWFUpload instance
		// e.data.selected - selected file count
		// e.data.queued - queued file count
		// e.data.queueSize - total files in queue
	})
	.bind( 'upload_start', function( e){
		// e.data.swfu - SWFUpload instance
		// e.data.file - SWFUpload file object
	})
	.bind( 'upload_progress', function( e){
		// e.data.swfu - SWFUpload instance
		// e.data.file - SWFUpload file object
		// e.data.sent - amount of bytes sent
		// e.data.size - total file size in bytes
	})
	.bind( 'upload_error', function( e){
		// e.data.swfu - SWFUpload instance
		// e.data.file - SWFUpload file object
		// e.data.errno - error number
		// e.data.error - error message
	})
	.bind( 'upload_success', function( e){
		// e.data.swfu - SWFUpload instance
		// e.data.file - SWFUpload file object
		// e.data.data - server response in specified format during instantiation
	})
	.bind( 'upload_complete', function( e){
		// e.data.swfu - SWFUpload instance
		// e.data.file - SWFUpload file object
	});

</script>