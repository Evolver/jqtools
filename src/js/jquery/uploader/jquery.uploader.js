/**
  * Author: Dmitry Stepanov
  * E-Mail: dmitrij@stepanov.lv
  * URL: http://www.stepanov.lv
  
  jQuery UI tools - JavaScript library.
  Copyright (C) 2009  Dmitry Stepanov <dmitrij@stepanov.lv>
  
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
  
  You should have received a copy of the GNU General Public License
  along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

if( typeof jQuery =='undefined')
  throw 'jQuery library is required';
if( typeof SWFUpload =='undefined')
  throw 'SWFUpload library is required';
if( typeof jQuery.utilVersion =='undefined')
  throw 'jQuery.util library is required';
  
jQuery.extend({
  
  // uploader library version
  uploaderVersion: 1.0,
  
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
  
  // ensure selected object is an uploader instance
  assertUploader: function() {
    if( this.data( '__uploader') ===undefined)
      throw 'Not an uploader instance';
  },
  
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
      options.responseType =jQuery.UPLOADER_RESPONSE_JSON;
      
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
      
      try {
        jUploader.assertUploader();
        return;// skip already initialized uploader instances
      } catch( e) {}
      
      // set uploader marker
      jUploader.data( '__uploader', true);
      
      // see what is display for target element
      var disp =jUploader.css( 'display');

      // create container for flash element
      var containerId =jQuery.uniqueId();
      var html ='<div id="' +containerId +'" style="display:block;position:absolute;left:0px;top:0px;overflow:hidden;">' +
                  '<div id="' +containerId +'_placeholder"></div>' +
                '</div>';
                
      // insert element
      jUploader.after( html);
      
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
        'preserve_relative_urls': true,
        
        'button_placeholder_id': containerId +'_placeholder',
        'button_window_mode': SWFUpload.WINDOW_MODE.TRANSPARENT,
        'button_cursor': SWFUpload.CURSOR.HAND,
        'button_action': options.multi ? SWFUpload.BUTTON_ACTION.SELECT_FILES : SWFUpload.BUTTON_ACTION.SELECT_FILE,
        
        // this is disabled to avoid extra requests to be sent to server on each swfu embed.
        'prevent_swf_caching': false,
        
        // proxy swfu events as native jQuery events.
        
        // open dialog
        'file_dialog_start_handler': function(){
          var e =jQuery.Event( 'upload_open');

          jUploader.triggerHandler( e, {
            'swfu': this
          });
        },
        
        // file added to queue
        'file_queued_handler': function( file){
          var e =jQuery.Event( 'upload_queue_add');

          jUploader.triggerHandler( e, {
            'swfu': this,
            'file': file
          });
        },
        
        // file refused from queue
        'file_queue_error_handler': function( file, errno, error){
          var e =jQuery.Event( 'upload_queue_refuse');

          jUploader.triggerHandler( e, {
            'swfu': this,
            'file': file,
            'errno': errno,
            'error': error
          });
        },
        
        // close dialog
        'file_dialog_complete_handler': function( numSelected, numQueued, queueSize){
          var e =jQuery.Event( 'upload_close');
          
          jUploader.triggerHandler( e, {
            'swfu': this,
            'selected': numSelected,
            'queued': numQueued,
            'queueSize': queueSize
          });
        },
        
        // file upload started
        'upload_start_handler': function( file){
          var e =jQuery.Event( 'upload_start');

          jUploader.triggerHandler( e, {
            'swfu': this,
            'file': file
          });
        },
        
        // file upload in progress
        'upload_progress_handler': function( file, sent, size){
          var e =jQuery.Event( 'upload_progress');

          jUploader.triggerHandler( e, {
            'swfu': this,
            'file': file,
            'sent': sent,
            'size': size
          });
        },
        
        // file upload has failed
        'upload_error_handler': function( file, errno, error){
          var e =jQuery.Event( 'upload_error');

          jUploader.triggerHandler( e, {
            'swfu': this,
            'file': file,
            'errno': errno,
            'error': error
          });
        },
        
        // file upload has succeeded
        'upload_success_handler': function( file, serverData, responseWasReceived){
          // TODO: deal with responseWasReceived. 
          if( !responseWasReceived) {
            // server has timed out (According to SWFUpload docs this has something
            //  to do with large responses). I choose to treat this situation as 'error'.
            var e =jQuery.Event( 'upload_error');
            
            // trigger a 'timeout' error
            jUploader.triggerHandler( e, {
              'swfu': this,
              'file': file,
              'errno': SWFUpload.UPLOAD_ERROR.RESPONSE_TIMEOUT,
              'error': 'Timeout'
            });
            
          } else {
            // response was received. This is the 'true' successful upload.
            var e =jQuery.Event( 'upload_success');
            var data ={
              'swfu': this,
              'file': file
            };
            
            // convert server data if needed
            if( options.responseType ==jQuery.UPLOADER_RESPONSE_RAW) {
              data.response =serverData;
              
            } else if( options.responseType ==jQuery.UPLOADER_RESPONSE_JSON) {
              try {
                data.response =eval( '(' +serverData +')');
              } catch( e) {
                // failed to evaluate data from server
                throw 'Failed to parse JSON data from server. Server sends data in invalid format (' +e +').';
              }
            }
            
            jUploader.triggerHandler( e, data);
          }
        },
        
        // file upload has been completed
        'upload_complete_handler': function( file){
          var e =jQuery.Event( 'upload_complete');

          jUploader.triggerHandler( e, {
            'swfu': this,
            'file': file
          });
        }

      });
      
      // uploader alignment function
      var alignUploader =function() {
        var jSwfu =jQuery( '#' +containerId);
        var dim =jSwfu.data( '__dimensions');
        
        var offs =jUploader.offset();
        var outerWidth =jUploader.outerWidth();
        var outerHeight =jUploader.outerHeight();
        
        if( dim ===undefined ||
            dim.left !=offs.left ||
            dim.top !=offs.top ||
            dim.width !=outerWidth ||
            dim.height !=outerHeight ||
            dim.callflashFailed) {
          // get relative container
          var relContainer =jUploader.getRelativeContainer();
          if( relContainer !==null) {
            // relative container is available
            // get relative container offset
            var jRelContainer =jQuery(relContainer);
            var relOffs =jRelContainer.offset();
            // calculate true position of element
            var pos ={
              'left': offs.left -relOffs.left,
              'top': offs.top -relOffs.top
            };
          } else {
            var pos =jUploader.position();
          }
            
          // resize flash container and flash object
          jSwfu
            // resize OBJECT or any underlying element in flash container
            .add( jSwfu.find( '> *').get(0)/* expecting an OBJECT element here */)
            .css({
              'width': outerWidth,
              'height': outerHeight
            })
            
          // update flash
          var callflashFailed =false;
          
          try {
            swfu.callFlash( 'SetButtonDimensions', [outerWidth, outerHeight]);
            
          } catch( e) {
            // failed to call flash... Adobe, adobe...
            callflashFailed =true;
          }
          
          // position flash container
          jSwfu
            .css({
              'left': pos.left,
              'top': pos.top
            })
            .data( '__dimensions', {
              'width': outerWidth,
              'height': outerHeight,
              'left': offs.left,
              'top': offs.top,
              'callflashFailed': callflashFailed
            });
        }
      };
      
      // perform alignment instantly
      alignUploader();
      
      // remove function
      var removeFn =function(){
        var jThis =jQuery(this);
        
        // detach uploader
        jThis.detachUploader();
      };
      
      // attach SWFUpload object to currently selected element
      jUploader
        // store SWFUpload object reference
        .data( '__swfu', swfu)
        // store SWFUpload flash object container
        .data( '__swfuContainer', document.getElementById( containerId))
        // setup alignment interval
        .data( '__alignInterval', setInterval( alignUploader, options.alignFreq))
        // remove function reference
        .data( '__removeFn', removeFn);
      
      // listen to 'remove' event to gracefully cleanup when element is
      //  removed from DOM
      jUploader
        .bind( 'remove', removeFn);
      
    });
    
    return this;
  },
  
  // detach uploader
  detachUploader: function() {
    this.assertSingle();

    try {
      this.assertUploader();
    } catch( e) { return; }
    
    var jThis =this;
    
    // cancel alignment timer
    clearInterval( jThis.data( '__alignInterval'));
    
    // gracefully destroy swfu data
    jThis.data( '__swfu').destroy();
    
    // remove swfu container
    jQuery( jThis.data( '__swfuContainer')).remove();
    
    // unbind remove event handler
    jThis.unbind( 'remove', jThis.data( '__removeFn'));
    
    // dereference SWFU object and remove data
    jThis
      .removeData( '__swfu')
      .removeData( '__swfuContainer')
      .removeData( '__alignInterval')
      .removeData( '__removeFn')
      .removeData( '__uploader');
  },
  
  // get SWFUpload object instance
  getSwfUpload: function() {
    this.assertSingle();
    this.assertUploader();
    
    return this.data( '__swfu');
  }
  
});