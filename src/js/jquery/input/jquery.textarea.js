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

(function($){
  
if( typeof $.utilVersion =='undefined')
  throw 'jQuery.util library is required';

$.extend({
  textareaVersion: 1.0
});

$.fn.extend({
  
  textarea: function( options) {
    
    if( options ===undefined)
      options ={};
      
    // use hints?
    if( options.hint ===undefined)
      options.hint =true;
      
    // iterate each item
    this
      .filter( function(){
        // keep only text areas
        return this.nodeName =='TEXTAREA';
      })
      .each(function(){
        
        var input =this;
        var $input =$(this);
        
        if( $input.data( '__textarea') !==undefined)
          // already initialized
          return;
        
        var customInputId =$.uniqueId();
        var inputClass =input.className;
        var inputValue =input.getAttribute( 'value');
        var inputStyle =input.getAttribute( 'style');
        
        if( inputValue ===null)
          inputValue ='';
        
        $input
          // hide input
          .hide()
          // insert table right after select box object
          .after(
            '<table id="' +customInputId +'" class="' +inputClass +'" style="' +(inputStyle ===null ? '' : inputStyle) +'">' +
            '<tr class="top">' +
              '<td class="left"></td>' +
              '<td class="mid"></td>' +
              '<td class="right"></td>' +
            '</tr>' +
            '<tr class="mid">' +
              '<td class="left"></td>' +
              '<td class="canvas">' +
                '<textarea></textarea>' +
              '</td>' +
              '<td class="right"></td>' +
            '</tr>' +
            '<tr class="bot">' +
              '<td class="left"></td>' +
              '<td class="mid"></td>' +
              '<td class="right"></td>' +
            '</tr>' +
            '</table>'
          );
          
        var customInput =document.getElementById( customInputId);
        var $customInput =$(customInput);
        
        $customInput
          // reference original textarea element
          .data( '__input', input)
          // mark as textarea
          .data( '__textarea', true)
          // save options
          .data( '__options', options);
        
        // get input object of custom text input
        var $customInputObject =$customInput._getTextinputTextareaObject();
        var customInputObject =$customInputObject.get(0);
        
        // transfer these events to the original textarea element
        $.transferEvents(
          [
            'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'dblclick',
            'mousedown', 'mouseup', 'mousemove', 'keydown', 'keypress', 'keyup', 'click'
          ],
          customInputObject,
          input);
          
        // listen to events
        $input
          // listen to change events
          .bind( 'change', function( e, data){
            if( data ===undefined) {
              // copy value to custom object
              customInputObject.value =input.value;
              
              // reflect changes on a custom input object
              $customInputObject.trigger( 'change', [{'internal':true}]);
            }
          })
          // cleanup when removed
          .bind( 'remove', function(e){
            // remove custom input
            $customInput.remove();
          });

        // use hints?
        if( options.hint) {
          // function to check if hint needs to be displayed,
          //  and if it does, hint is being displayed
          function showHint() {
            // no value holding
            if( customInputObject.value =='') {
              // see if hint value is specified
              if( inputValue !='') {
                // display hint
                $customInputObject.addClass( 'hint');
                customInputObject.value =inputValue;
              }
            }
          };
        
          // see if current textarea's value matches textarea's value attribute
          if( inputValue ==input.value || input.value =='') {
            // if we don't get here, it means, that user has pressed 'back'
            //  button, and user agent has filled in form for him, so we
            //  must not show hint, util current textarea's value is empty
            showHint();
            
            if( input.value !='')
              input.value ='';// reset input's value
            
          } else {
            // just copy the value
            customInputObject.value =input.value;
          }
          
          $customInputObject
            // show hint when blur
            .bind( 'blur', function(e){
              showHint();
              
              var e =$.Event( 'blur');
              e.preventDefault();
              
              // transfer event
              $.event.trigger( e, null, input);
            })
            // hide hint when focused
            .bind( 'focus', function() {
              // see if hint is being displayed
              if( $customInputObject.hasClass( 'hint')) {
                // hide hint and show no value
                $customInputObject.removeClass( 'hint');
                customInputObject.value ='';
              }
              
              var e =$.Event( 'focus');
              e.preventDefault();
              
              // transfer event
              $.event.trigger( e, null, input);
            });
            
        } else {
          // just copy the value
          customInputObject.value =input.value;
        }
          
        $customInputObject
          // trigger change on every keydown
          .bind( 'keydown', function(e){
            
            // delayed update
            setTimeout( function(){
              // trigger change after some time.
              //  This handles the situation when last pressed key is not being
              //  included into the changes.
              $customInputObject.trigger( 'change');
            }, 0);
            
            // instant update without the last key pressed
            $customInputObject.trigger( 'change');
            
          })
          // reflect changes on a target element
          .bind( 'change', function(e, data){
            if( data ===undefined) {
              // copy value to original object
              input.value =customInputObject.value;
              
              // reflect changes on an original input object
              $input.trigger( 'change', [{'internal':true}]);
              
            }
          });
      });
    
    return this;
  },
  
  // get input element of custom text input
  _getTextinputTextareaObject: function() {
    this.assertSingle();
    
    return this.find( '> tbody > tr.mid > td.canvas > textarea');
  }
  
});

})( jQuery);