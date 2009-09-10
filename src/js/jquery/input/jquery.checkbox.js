/**
  * Author: Dmitry Stepanov
  * E-Mail: dmitrij@stepanov.lv
  * URL: http://www.stepanov.lv
  *
  * Custom checkbox/radiobox input
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
        
        return ( type =='checkbox' || type =='radio')
      })
      .each(function(){
        
        var input =this;
        var jInput =jQuery(this);
        
        var customInputId =jQuery.uniqueId();
        var inputClass =input.className;
        var inputType =this.getAttribute( 'type');
        
        jInput
          // hide input
          .hide()
          // insert table right after checkbox object
          .after( '<div id="' +customInputId +'" class="' +inputClass +'"></div>');
          
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
            // IE8 fails to draw background change until mouse is out
            //  of the element.
            jCustomInput.hide().show();
        };
        
        // update status when document is ready
        jQuery(document).ready(function(){
          updateStatus();
        });

        // listen to change event
        jInput
          .bind( 'change', function(e){
            // reflect changes
            updateStatus();
          });
        
        // listen to click event
        jCustomInput
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
                jQuery.event.trigger( 'change', null, elem);
              }
            }

            // trigger click and change
            jInput.trigger( 'click');
            jInput.trigger( 'change');
            
            // stop propagation
            e.stopPropagation();
          });
      });
    
    return this;
  }
  
});