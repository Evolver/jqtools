/**
  * Author: Dmitry Stepanov
  * E-Mail: dmitrij@stepanov.lv
  * URL: http://www.stepanov.lv
  *
  * Custom textarea
  */

if( typeof jQuery =='undefined')
  throw 'jQuery library is required';
if( typeof jQuery.utilVersion =='undefined')
  throw 'jQuery.util library is required';

jQuery.extend({
  
  textareaVersion: 1.0
  
});

jQuery.fn.extend({
  
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
        var jInput =jQuery(this);
        
        var customInputId =jQuery.uniqueId();
        var inputClass =input.className;
        var inputValue =input.getAttribute( 'value');
        var inputStyle =input.getAttribute( 'style');
        
        jInput
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
        var jCustomInput =jQuery(customInput);
        
        jCustomInput
          // reference original textarea element
          .data( '__input', input)
          // mark as textinput
          .data( '__textinput', true)
          // save options
          .data( '__options', options);
        
        // get input object of custom text input
        var jCustomInputObject =jCustomInput._getTextinputTextareaObject();
        var customInputObject =jCustomInputObject.get(0);
        
        // transfer these events to the original textarea element
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
        if( options.hint) {
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
          
          jCustomInputObject
            // show hint when blur
            .bind( 'blur', function(e){
              showHint();
              
              var e =jQuery.Event( 'blur');
              e.preventDefault();
              
              // transfer event
              jQuery.event.trigger( e, null, input);
            })
            // hide hint when focused
            .bind( 'focus', function() {
              // see if hint is being displayed
              if( jCustomInputObject.hasClass( 'hint')) {
                // hide hint and show no value
                jCustomInputObject.removeClass( 'hint');
                customInputObject.value ='';
              }
              
              var e =jQuery.Event( 'focus');
              e.preventDefault();
              
              // transfer event
              jQuery.event.trigger( e, null, input);
            });
            
        } else {
          // just copy the value
          customInputObject.value =input.value;
        }
          
        jCustomInputObject
          // trigger change on every keydown
          .bind( 'keydown', function(e){
            setTimeout( function(){
              // trigger change after some time
              jCustomInputObject.trigger( 'change');
            }, 0);
          })
          // reflect changes on a target element
          .bind( 'change', function(e){
            // copy new value to the original textarea
            input.value =customInputObject.value;
            
            // transfer event
            jQuery.event.trigger( 'change', null, input);
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