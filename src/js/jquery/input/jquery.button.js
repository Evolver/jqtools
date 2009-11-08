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
  
  buttonVersion: 1.0
  
});

$.fn.extend({
  
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
        var $input =$(this);
        
        if( $input.data( '__button') !==undefined)
          // already initialized
          return;
        
        var customInputId =$.uniqueId();
        var inputClass =input.className;
        var inputStyle =input.getAttribute( 'style');
        
        if( this.nodeName =='BUTTON')
          // get inner html to copy as the button's label
          var html =$(this).html();
        else
          // copy the "value" property as the label
          var html =this.getAttribute( 'value');
        
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
        var $customInput =$(customInput);
        
        $customInput
          // reference original input element
          .data( '__input', input)
          // mark as button
          .data( '__button', true)
          // save options
          .data( '__options', options);
        
        // transfer these events to the original input element
        $.transferEvents(
          [
            'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'dblclick',
            'mousedown', 'mouseup', 'mousemove', 'keydown', 'keypress', 'keyup', 'click'
          ],
          customInput,
          input);
          
        // listen to events
        $input
          // cleanup when removed
          .bind( 'remove', function(e){
            // remove custom input
            $customInput.remove();
          });
          
        // control pressed/released states
        $customInput
          .bind( 'mousedown', function(e){
            $customInput
              .attr( 'pressed', 'yes')
              .data( '__holding', true);
          })
          .bind( 'mouseup', function(e){
            $customInput
              .removeAttr( 'pressed')
              .removeData( '__holding');
          })
          .bind( 'mouseenter', function(e){
            if( $customInput.data( '__holding'))
              $customInput.attr( 'pressed', 'yes');
          })
          .bind( 'mouseleave', function(e){
            $customInput.removeAttr( 'pressed');
          });

      });
    
    return this;
  }
  
});

})( jQuery);