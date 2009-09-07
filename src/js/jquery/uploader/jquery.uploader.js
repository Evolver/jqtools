/**
  * Author: Dmitry Stepanov
  * E-Mail: dmitrij@stepanov.lv
  * URL: http://www.stepanov.lv
  */

if( typeof jQuery =='undefined')
  throw 'jQuery library is required';
if( typeof SWFUpload =='undefined')
  throw 'SWFUpload library is required';
if( typeof jQuery.utilVersion =='undefined')
  throw 'jQuery.util library is required';
  
jQuery.extend({
  
  // supported formats for server responses
  UPLOADER_RESPONSE_RAW: 'raw',
  UPLOADER_RESPONSE_JSON: 'json',
  
  // uploader global configuration
  uploaderConfig: null,
  
  // configure uploader
  configureUploader: function( options) {
    if( options ===undefined)
      options ={};
      
    if( options.swfUrl ===undefined)
      throw 'No swf url specified';
      
    // assign config
    jQuery.uploaderConfig =options;
  }
  
});
  
jQuery.fn.extend({
  
  // setup an upload overlay over specified elements
  uploader: function( options) {
    
    if( jQuery.uploaderConfig ===null)
      throw 'Uploader is not configured. Please call jQuery.configureUploader before using uploader.';
    
    if( options ===undefined)
      options ={};

    // file post url
    if( options.url ===undefined)
      throw 'No upload url specified';
      
    // request data to send to server as post fields
    if( options.requestData ===undefined)
      options.requestData ={};
      
    // server response format
    if( options.responseType ===undefined)
      options.responseType =jQuery.UPLOADER_RESPONSE_RAW;
      
    // file types to be accepted for upload in format *.<extension>;*.<extension>;...
    if( options.fileTypes ===undefined)
      options.fileTypes ='*.*';
      
    // file type description
    if( options.fileTypeDescr ===undefined)
      options.fileTypeDescr ='All files';
      
    // do allow selection of multiple files?
    if( options.multi ===undefined)
      options.multi =false;
      
    // max. amount of files in queue. 0 = unlimited.
    if( options.maxQueue ===undefined)
      options.maxQueue =0;
      
    // max. file size. 0 = any size.
    if( options.maxSize ===undefined)
      options.maxSize =0;
      
    // file post field name
    if( options.name ===undefined)
      options.name ='file';
      
    // alignment frequency
    if( options.alignFreq ===undefined)
      options.alignFreq =500;// every half a second
      
    // iterate all items
    this.each(function(){
      var uploader =this;
      var jUploader =jQuery(this);
      
      // create container for flash element
      var containerId =jQuery.uniqueId();
      var html ='<div id="' +containerId +'" style="position:relative;" class="__swfupload">' +
                  '<div id="' +containerId +'_swfu" style="position:absolute;display:block;overflow:hidden;">' +
                    '<div id="' +containerId +'_placeholder"></div>' +
                  '</div>' +
                '</div>';
                
      // insert element
      jUploader.before( html);
      
      // instantiate SWFUpload object
      var swfu =new SWFUpload({
        'upload_url': options.url,
        'flash_url': jQuery.uploaderConfig.swfUrl,
        'file_post_name': options.name,
        'post_params': options.requestData,
        'file_queue_limit': options.maxQueue,
        'http_success': [200, 201, 202],
        'file_types': options.fileTypes,
        'file_types_description': options.fileTypeDescr,
        'file_size_limit': options.maxSize,
        
        'button_placeholder_id': containerId +'_placeholder',
        'button_width': '1000px',// overflow will be hidden
        'button_height': '1000px',// overflow will be hidden
        'button_window_mode': SWFUpload.WINDOW_MODE.TRANSPARENT,
        'button_cursor': SWFUpload.CURSOR.HAND,
        'button_action': options.multi ? SWFUpload.BUTTON_ACTION.SELECT_FILES : SWFUpload.BUTTON_ACTION.SELECT_FILE,
        
        // this is disabled to avoid extra requests to be sent to server on each swfu embed.
        'prevent_swf_caching': false,
        
        // proxy swfu events as native jQuery events.
        
        // open dialog
        'file_dialog_start_handler': function(){
          var e =jQuery.Event( 'upload_open');
          e.data ={
            'swfu': this
          };
          
          jUploader.triggerHandler( e);
        },
        
        // file added to queue
        'file_queued_handler': function( file){
          var e =jQuery.Event( 'upload_queue_add');
          e.data ={
            'swfu': this,
            'file': file
          };
          
          jUploader.triggerHandler( e);
        },
        
        // file refused from queue
        'file_queue_error_handler': function( file, errno, error){
          var e =jQuery.Event( 'upload_queue_refuse');
          e.data ={
            'swfu': this,
            'file': file,
            'errno': errno,
            'error': error
          };
          
          jUploader.triggerHandler( e);
        },
        
        // close dialog
        'file_dialog_complete_handler': function( numSelected, numQueued, queueSize){
          var e =jQuery.Event( 'upload_close');
          e.data ={
            'swfu': this,
            'selected': numSelected,
            'queued': numQueued,
            'queueSize': queueSize
          };
          
          jUploader.triggerHandler( e);
        },
        
        // file upload started
        'upload_start_handler': function( file){
          var e =jQuery.Event( 'upload_start');
          e.data ={
            'swfu': this,
            'file': file
          };
          
          jUploader.triggerHandler( e);
        },
        
        // file upload in progress
        'upload_progress_handler': function( file, sent, size){
          var e =jQuery.Event( 'upload_progress');
          e.data ={
            'swfu': this,
            'file': file,
            'sent': sent,
            'size': size
          };
          
          jUploader.triggerHandler( e);
        },
        
        // file upload has failed
        'upload_error_handler': function( file, errno, error){
          var e =jQuery.Event( 'upload_error');
          e.data ={
            'swfu': this,
            'file': file,
            'errno': errno,
            'error': error
          };
          
          jUploader.triggerHandler( e);
        },
        
        // file upload has succeeded
        'upload_success_handler': function( file, serverData, responseWasReceived){
          // TODO: deal with responseWasReceived. According to SWFUpload docs this has
          //        something to do with excessive request timeouts.
          var e =jQuery.Event( 'upload_success');
          e.data ={
            'swfu': this,
            'file': file
          };
          
          // convert server data if needed
          if( options.responseType ==jQuery.UPLOADER_RESPONSE_RAW)
            e.data.data =serverData;
          else if( options.responseType ==jQuery.UPLOADER_RESPONSE_JSON)
            e.data.data =eval( '(' +serverData +')');
          
          jUploader.triggerHandler( e);
        },
        
        // file upload has been completed
        'upload_complete_handler': function( file){
          var e =jQuery.Event( 'upload_complete');
          e.data ={
            'swfu': this,
            'file': file
          };
          
          jUploader.triggerHandler( e);
        }

      });
      
      // attach SWFUpload object to currently selected element
      jUploader.data( '__swfu', swfu);
      jUploader.data( '__swfuContainer', document.getElementById( containerId));
      jUploader.data( '__alignInterval', setInterval( function(){
        jQuery( '#' +containerId +'_swfu')
          .css({
            'width': jUploader.outerWidth(),
            'height': jUploader.outerHeight()
          });
      }, options.alignFreq));
      
      // listen to 'remove' event to gracefully cleanup
      jUploader.bind( 'remove', function( e){
        var jThis =jQuery(this);
        
        // cancel alignment timer
        clearInterval( jThis.data( '__alignInterval'));
        
        // grafully destroy swfu data
        jThis.data( '__swfu').destroy();
        
        // remove swfu container
        jQuery( jThis.data( '__swfuContainer')).remove();
        
        // dereference SWFU object and remove data
        jThis
          .removeData( '__swfu')
          .removeData( '__swfuContainer')
          .removeData( '__alignInterval');
      });
      
    });
    
    return this;
  }
  
});