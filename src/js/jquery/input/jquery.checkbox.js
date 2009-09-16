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
if( typeof jQuery.utilVersion =='undefined')
  throw 'jQuery.util library is required';

jQuery.extend({
  
  checkboxVersion: 1.0
  
});

jQuery.fn.extend({
  
  checkbox: function( options) {
    
    if( options ===undefined)
      options ={};
      
    // iterate each item
    this
      .filter( function(){
        // keep only text inputs
        if( this.nodeName !='INPUT')
          return false;
          
        var type =this.getAttribute( 'type');
        
        return ( type =='checkbox' || type =='radio');
      })
      .each(function(){
        
        var input =this;
        var jInput =jQuery(this);
        
        var customInputId =jQuery.uniqueId();
        var inputClass =input.className;
        var inputType =input.getAttribute( 'type');
        var inputStyle =input.getAttribute( 'style');

        /*
        if( jQuery.browser.msie || jQuery.browser.opera) {
          
          jInput.hideFromCanvas();
          
        } else {
          // other browsers manage event triggering well, so we can
          //  safely hide the checkboxes or radioboxes.
          jInput.hide();
        }
        */
        
        jInput
          // hide input
          .hide()
          // insert table right after checkbox object
          .after( '<div id="' +customInputId +'" class="' +inputClass +'" style="' +(inputStyle ===null ? '' : inputStyle) +'"></div>');
          
        var customInput =document.getElementById( customInputId);
        var jCustomInput =jQuery(customInput);
        
        jCustomInput
          // reference original input element
          .data( '__input', input)
          // mark as textinput
          .data( '__checkbox', true)
          // save options
          .data( '__options', options);
        
        // transfer these events to the original input element
        jQuery.transferEvents(
          [
            'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'dblclick',
            'mousedown', 'mouseup', 'mousemove', 'keydown', 'keypress', 'keyup'
          ],
          customInput,
          input);
          
        // listen to events
        jInput
          // cleanup when removed
          .bind( 'remove', function(e){
            // remove custom input
            jCustomInput.remove();
          });
          
        function updateStatus() {
          // assign checked class if input is checked
          if( input.checked)
            jCustomInput.attr( 'checked', 'yes');
          else
            jCustomInput.removeAttr( 'checked');
            
          if( jQuery.browser.msie)
            // BUG: IE8 fails to draw background change until
            //  mouse is out of the element.
            jCustomInput.hide().show();
        };
        
        // update status when document is ready
        jQuery(document).ready(function(){
          updateStatus();
        });

        // listen to events on original input
        jInput
          // handle clicks
          .bind( 'click', function(e){
            if( inputType =='radio') {
              // see if radio box has any name set
              var name =input.getAttribute( 'name');
              if( name ===null)
                return;// name attribute not specified
                
              // trigger change on all other radioboxes with same name
              for( var i =0; i < input.form.elements.length; ++i) {
                var elem =input.form.elements[i];
                
                if( elem.nodeName !='INPUT')
                  continue;// skip non-input elements
                if( elem.getAttribute( 'type') !='radio')
                  continue;// skip non-radio inputs
                if( elem.getAttribute( 'name') !=name)
                  continue;// skip radioboxes with another name
                if( elem ==input)
                  continue;// skip current input
                if( !elem.checked)
                  continue;// skip unchecked radio boxes
                  
                // uncheck radio box
                elem.checked =false;
                
                // trigger change
                jQuery(elem).trigger( 'change');
              }
            }
            
            if( jQuery.browser.opera) {
              // BUG: Opera has trouble changing checked state for hidden
              //  checkboxes. To workaround this, we explicitly will negate
              //  current checkbox state.
              input.checked =!input.checked;
              
              // prevent default browser action
              e.preventDefault();
              
              // fire additional change event because opera does not
              //  fire change event when clicking checkboxes' label.
              jInput.trigger( 'change');
            }
            
            if( jQuery.browser.msie) {
              // BUG: IE does not trigger change event
              //  when clicking checkbox directly, but fires when
              //  either clicking somewhere else or when clicking
              //  checkboxes label (BUG). We fire additional change
              //  event here to workaround this.
              function triggerChange() {
                jInput.trigger( 'change');
              };
              
              // this makes change event to be triggered after click
              //  event handler is being executed.
              setTimeout( triggerChange, 0);
            }
              
          })
          // handle state changes
          .bind( 'change', function(e){
            // reflect changes
            updateStatus();
          });

        // listen to events on custom input
        jCustomInput
          .bind( 'click', function(e){
            // trigger click. Since this does not trigger 'change',
            //  trigger 'change' event also.
            jInput.trigger( 'click');

            // trigger change
            if( !jQuery.browser.msie)
              // this event is being triggered during 'click'
              //  on original element.
              jInput.trigger( 'change');
              
            e.stopPropagation();
          });
          
        // BUG: internet explorer does not trigger click event
        //  for hidden checkboxes or radio buttons if
        //  their label is clicked. Find any labels referring
        //  to current input and make them fire click event.
        if( jQuery.browser.msie) {
          var id =input.getAttribute( 'id');
          
          if( id !==null) {
            // labels can be attached only to inputs with explicit
            //  "id" attribute.
            jQuery( 'label[for="' +id +'"]')
              .click( function(e){
                // stop propagation
                e.stopPropagation();
                // prevent default action
                e.preventDefault();
                
                // trigger click event on a related input
                jInput.trigger( 'click');
              });
          }
        }
      });
    
    return this;
  }
  
});