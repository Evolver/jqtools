/**
  * Author: Dmitry Stepanov
  * E-Mail: dmitrij@stepanov.lv
  * URL: http://www.stepanov.lv
  *
  * Custom text input
  */

if( typeof jQuery =='undefined')
  throw 'jQuery library is required';
if( typeof jQuery.utilVersion =='undefined')
  throw 'jQuery.util library is required';

jQuery.extend({
  
  textinputVersion: 1.0
  
});

jQuery.fn.extend({
  
  textinput: function( options) {
    
    if( options ===undefined)
      options ={};
      
    // use hints?
    //  NOTE: hints can be used only on non-password inputs
    if( options.hint ===undefined)
      options.hint =true;
      
    // iterate each item
    this
      .filter( function(){
        // keep only text inputs
        if( this.nodeName !='INPUT')
          return false;
          
        var type =this.getAttribute( 'type');
        
        return ( type =='text' || type =='password')
      })
      .each(function(){
        
        var input =this;
        var jInput =jQuery(this);
        
        var customInputId =jQuery.uniqueId();
        var inputClass =input.className;
        var inputType =input.getAttribute( 'type');
        var inputValue =input.getAttribute( 'value');
        
        jInput
          // hide input
          .hide()
          // insert table right after select box object
          .after(
            '<table id="' +customInputId +'" class="' +inputClass +'">' +
            '<tr class="top">' +
              '<td class="left"></td>' +
              '<td class="mid"></td>' +
              '<td class="right"></td>' +
            '</tr>' +
            '<tr class="mid">' +
              '<td class="left"></td>' +
              '<td class="canvas">' +
                '<input type="' +inputType +'" />' +
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
        var jCustomInput =jQuery(customInput);
        
        jCustomInput
          // reference original input element
          .data( '__input', input)
          // mark as textinput
          .data( '__textinput', true)
          // save options
          .data( '__options', options);
        
        // get input object of custom text input
        var jCustomInputObject =jCustomInput._getTextinputInputObject();
        var customInputObject =jCustomInputObject.get(0);
        
        // transfer these events to the original input element
        jQuery.transferEvents(
          [
            'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'dblclick',
            'mousedown', 'mouseup', 'mousemove', 'keydown', 'keypress', 'keyup', 'click'
          ],
          customInputObject,
          input);
          
        // listen to events
        jInput
          // cleanup when removed
          .bind( 'remove', function(e){
            // remove custom input
            jCustomInput.remove();
          });

        // use hints?
        if( inputType !='password' && options.hint) {
          // function to check if hint needs to be displayed,
          //  and if it does, hint is being displayed
          function showHint() {
            // no value holding
            if( customInputObject.value =='') {
              // see if hint value is specified
              if( inputValue !='') {
                // display hint
                jCustomInputObject.addClass( 'hint');
                customInputObject.value =inputValue;
              }
            }
          };
        
          // see if current input's value matches input's value attribute
          if( inputValue ==input.value || input.value =='') {
            // if we don't get here, it means, that user has pressed 'back'
            //  button, and user agent has filled in form for him, so we
            //  must not show hint, util current input's value is empty
            showHint();
            
            if( input.value !='')
              input.value ='';// reset input's value
            
          } else {
            // just copy the value
            customInputObject.value =input.value;
          }
          
          jCustomInputObject
            // show hint when blur
            .bind( 'blur', showHint)
            // hide hint when focused
            .bind( 'focus', function() {
              // see if hint is being displayed
              if( jCustomInputObject.hasClass( 'hint')) {
                // hide hint and show no value
                jCustomInputObject.removeClass( 'hint');
                customInputObject.value ='';
              }
            });
            
        } else {
          // just copy the value
          customInputObject.value =input.value;
        }
          
        jCustomInputObject
          // reflect changes on a target element
          .bind( 'change', function(e){
            // copy new value to the original input
            input.value =customInputObject.value;
            
            debug( 'change, new value "' +input.value +'"');
          });
      });
    
  },
  
  // get input element of custom text input
  _getTextinputInputObject: function() {
    this.assertSingle();
    
    return this.find( '> tbody > tr.mid > td.canvas > input');
  }
  
});