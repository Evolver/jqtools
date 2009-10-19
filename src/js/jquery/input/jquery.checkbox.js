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

// extend core
$.extend({
  // library version
  checkboxVersion: 1.0
});

// custom functions
  
// reflect radiobox changes
function formReflectRadioboxChanges( input) {
  // see if radio box has any name set
  var name =input.getAttribute( 'name');
  if( name ===null)
    return;// name attribute not specified
    
  // see if input is within a form
  if( input.form) {
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
        
      var customInput =$(elem).data( '__customInput');
        
      if( customInput ===undefined)
        continue;// skip non-initialized inputs
        
      if( !elem.checked && $(customInput).attr( 'checked') ===undefined)
        continue;// skip synced radio boxes
        
      // sync radio boxes
      elem.checked =false;
      
      // trigger change
      updateStatus( elem);
    }
  }
}

// reflect single box change
function updateStatus( input) {
  // assign checked class if input is checked
  var jCustomInput =$($(input).data( '__customInput'));
  
  if( input.checked)
    jCustomInput.attr( 'checked', 'yes');
  else
    jCustomInput.removeAttr( 'checked');
    
  if( $.browser.msie)
    // BUG: IE8 fails to draw background change until
    //  mouse is out of the element.
    jCustomInput.hide().show();
}

// extend fn
$.fn.extend({
  
  // checkbox initializer
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
        var jInput =$(this);
        
        var customInputId =$.uniqueId();
        var inputClass =input.className;
        var inputType =input.getAttribute( 'type');
        var inputStyle =input.getAttribute( 'style');
        
        jInput
          // hide input
          .hide()
          // insert table right after checkbox object
          .after( '<div id="' +customInputId +'" class="' +inputClass +'" style="' +(inputStyle ===null ? '' : inputStyle) +'"></div>');
          
        var customInput =document.getElementById( customInputId);
        var jCustomInput =$(customInput);
        
        jCustomInput
          // reference original input element
          .data( '__input', input)
          // mark as textinput
          .data( '__checkbox', true)
          // save options
          .data( '__options', options);
          
        jInput
          // reference custom input element
          .data( '__customInput', customInput);
        
        // transfer these events to the original input element
        $.transferEvents(
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
        
        // update status when document is ready
        $(document).ready(function(){
          updateStatus( input);
        });

        // listen to events on original input
        jInput
          // handle clicks
          .bind( 'click', function(e){
            if( inputType =='radio') {
              // trigger change on all other elements to reflect internal
              //  changes.
              formReflectRadioboxChanges( input);
            }
            
            if( $.browser.opera) {
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
            
            if( $.browser.msie) {
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
            updateStatus( input);
            
            // if input type is radio
            if( inputType =='radio')
              // reflect changes on all other radio boxes
              formReflectRadioboxChanges( input);
          });

        // listen to events on custom input
        jCustomInput
          .bind( 'click', function(e){
            // trigger click. Since this does not trigger 'change',
            //  trigger 'change' event also.
            jInput.trigger( 'click');

            // trigger change
            if( !$.browser.msie)
              // this event is being triggered during 'click'
              //  on original element.
              jInput.trigger( 'change');
              
            e.stopPropagation();
          });
          
        // BUG: internet explorer does not trigger click event
        //  for hidden checkboxes or radio buttons if
        //  their label is clicked. Find any labels referring
        //  to current input and make them fire click event.
        if( $.browser.msie) {
          var id =input.getAttribute( 'id');
          
          if( id !==null) {
            // labels can be attached only to inputs with explicit
            //  "id" attribute.
            $( 'label[for="' +id +'"]')
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

})( jQuery);