/**
  * Author: Dmitry Stepanov
  * E-Mail: dmitrij@stepanov.lv
  * URL: http://www.stepanov.lv
  *
  * Custom button (input type submit, reset, button, element - button)
  */

if( typeof jQuery =='undefined')
  throw 'jQuery library is required';
if( typeof jQuery.utilVersion =='undefined')
  throw 'jQuery.util library is required';

jQuery.extend({
  
  buttonVersion: 1.0
  
});

jQuery.fn.extend({
  
  button: function( options) {
    
    if( options ===undefined)
      options ={};
      
    // iterate each item
    this
      .filter( function(){
        // keep only text inputs
        if( this.nodeName =='INPUT') {
          var type =this.getAttribute( 'type');
          
          // accept only these inputs
          return (type =='submit' || type =='reset' || type =='button');
          
        } else if( this.nodeName =='BUTTON') {
          return true;
          
        } else {
          // reject all other elements
          return false
        }

      })
      .each(function(){
        
        var input =this;
        var jInput =jQuery(this);
        
        var customInputId =jQuery.uniqueId();
        var inputClass =input.className;
        
        if( this.nodeName =='BUTTON')
          // get inner html to copy as the button's label
          var html =$(this).html();
        else
          // copy the "value" property as the label
          var html =this.getAttribute( 'value');
        
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
                html +
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
          // mark as button
          .data( '__button', true)
          // save options
          .data( '__options', options);
        
        // transfer these events to the original input element
        jQuery.transferEvents(
          [
            'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'dblclick',
            'mousedown', 'mouseup', 'mousemove', 'keydown', 'keypress', 'keyup', 'click'
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
          
        // control pressed/released states
        jCustomInput
          .bind( 'mousedown', function(e){
            jCustomInput
              .attr( 'pressed', 'yes')
              .data( '__holding', true);
          })
          .bind( 'mouseup', function(e){
            jCustomInput
              .removeAttr( 'pressed')
              .removeData( '__holding');
          })
          .bind( 'mouseenter', function(e){
            if( jCustomInput.data( '__holding'))
              jCustomInput.attr( 'pressed', 'yes');
          })
          .bind( 'mouseleave', function(e){
            jCustomInput.removeAttr( 'pressed');
          });

      });
    
    return this;
  }
  
});