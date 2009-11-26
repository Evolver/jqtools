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
  
  // library version
  selectboxVersion: 1.0,
  
  // select box opening effects
  SELECTBOX_EFFECT_NONE: 'none',
  SELECTBOX_EFFECT_FADE: 'fade',
  SELECTBOX_EFFECT_SLIDE_OUT: 'slideOut',
  SELECTBOX_EFFECT_SLIDE_DOWN: 'slideDown'
  
});

$.fn.extend({
  
  // initialize custom select box
  selectbox: function( options) {
    if( options ===undefined || typeof options !='object')
      options ={};
      
    if( options.effect ===undefined)
      options.effect =$.SELECTBOX_EFFECT_NONE;
      
    else switch( options.effect) {
      // see if valid effect passed
      case $.SELECTBOX_EFFECT_NONE:
      case $.SELECTBOX_EFFECT_FADE:
      case $.SELECTBOX_EFFECT_SLIDE_OUT:
      case $.SELECTBOX_EFFECT_SLIDE_DOWN:
      break;
      // invalid effect
      default:
        throw 'Invalid effect type "' +options.effect +'"';
      break;
    }

    if( options.presentation ===undefined || typeof options.presentation !='object')
      throw 'No presentation callbacks have been specified';
    if( options.presentation.open ===undefined)
      throw 'No presentation.open() callback was specified';
    if( options.presentation.close ===undefined)
      throw 'No presentation.close() callback was specified';
      
    // callback to call when custom select box is initialized
    if( options.presentation.init ===undefined)
      options.presentation.init =function(){};
      
    // callback to call when custom select box is about to be unloaded to
    //  gracefully shutdown pending UI effects.
    if( options.presentation.cleanup ===undefined)
      options.presentation.cleanup =function(){};
    
    if( options.makeValue ===undefined) {
      // internal value builder
      options.makeValue =function() {

        if( this.multiple) {
          // multiple option selection allowed
          var values =new Array();
          var opt;
        
          for( var i =0; i < this.options.length; ++i) {
            opt =this.options[ i];
            if( opt.selected)
              // store label or text
              values.push( opt.label ? opt.label : opt.text);
          }
          
          if( values.length ==0)
            // show dash if no values selected
            return '-';
          
          // return comma-joined list of selected values
          return values.join( ', ');
          
        } else {
          var opt =this.options[ this.selectedIndex];

          // return label or text
          return opt.label ? opt.label : opt.text;
        }

      };
    }
      
    // iterate each select box
    this
      .filter( function(){
        // keep only select boxes
        return this.nodeName =='SELECT';
      })
      .each( function(){
        
        var sbox =this;
        var $sbox =$(this);
        
        if( $sbox.data( '__customSbox') !==undefined)
          // already initialized
          return;
        
        // get select box input name
        var customSboxId =$.uniqueId();
        var sboxClass =sbox.className;
        var sboxStyle =sbox.getAttribute( 'style');

        $sbox
          // hide select box
          .hide()
          // insert table right after select box object
          .after(
            '<table id="' +customSboxId +'" class="' +sboxClass +'" style="' +(sboxStyle ===null ? '' : sboxStyle) +'">' +
            '<tr class="top">' +
              '<td class="left"></td>' +
              '<td class="mid"></td>' +
              '<td class="right"></td>' +
            '</tr>' +
            '<tr class="mid">' +
              '<td class="left"></td>' +
              '<td class="canvas">' +
                '<div class="value"></div>' +
                '<div class="menu"></div>' +
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
          

        var customSbox =document.getElementById( customSboxId);
        var $customSbox =$( customSbox);
        
        // see if multiple value selection is supported
        if( sbox.multiple) {
          // add 'multiple' class to TBODY element
          $customSbox.find( '> tbody').addClass( 'multi');
        }
        
        // store custom select box object reference on an original select object.
        //  this reference can be used by custom views to reference custom sbox object.
        $sbox.data( '__customSbox', customSbox);

        $customSbox
          // reference select box
          .data( '__sbox', sbox)
          // get menu object
          ._getSelectboxMenuObject()
          // avoid trigger of select box close when
          //  clicked on menu
          .click(function(e){
            // do not propagate click
            e.stopPropagation();
          })
          // initially hide menu object
          .hide();
        
        // bind click
        $customSbox.click(function(e){
          
          var wasOpened =$customSbox.isSelectboxOpened();
          
          // trigger on select box
          $sbox.trigger( $.Event( 'click'));
          
          // toggle select box
          if( !wasOpened)
            $customSbox.openSelectbox();
          
          // stop event propagation
          e.stopPropagation();
        });

        // pass these event handling to the original SELECT element.
        // Google Chrome has a bug with handling this. Chrome does
        // not register (at least i tested mouseover and mouseout)
        // events and does not pass them to sbox object. This is
        // not Webkit-specific bug, Safari handles this well.
        $.transferEvents(
          [
            'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'dblclick',
            'mousedown', 'mouseup', 'mousemove', 'keydown', 'keypress', 'keyup', 'blur',
            'focus'
          ],
          $customSbox._getSelectboxValueObject().get(0),
          sbox);
        
        $customSbox
          // store config
          .data( '__options', options)
          // show initial value of select box
          ._updateSelectboxValue();
          
        // document click handler
        var clickFn =function(e){
          if( $customSbox.isSelectboxOpened())
            $customSbox.closeSelectbox();
        };
          
        // close select box when user clicks document
        $(document).click( clickFn);
        
        // cleanup after custom select box is removed
        $customSbox
          .bind( 'remove', function( e){
            // unbind click handler from document
            $(document).unbind( 'click', clickFn);
            // deinitialize presentation layer
            options.presentation.cleanup.call( customSbox);
          });
          
        $sbox
          // reflect changes
          .bind( 'change', function( e) {
            // update selectbox value
            $customSbox._updateSelectboxValue( false);
          })
          // cleanup after select box object is removed
          .bind( 'remove', function( e){
            // remove custom select box
            $customSbox.remove();
          });
          
        // initialize presentation layer
        options.presentation.init.call( customSbox);
      });
      
    return this;
  },
  
  // toggle select box
  toggleSelectbox: function() {
    this.assertSingle();
    
    var $sbox =this;
    
    if( !$sbox.isSelectboxOpened())
      $sbox.openSelectbox();
    else
      $sbox.closeSelectbox();
  },
  
  // open select box
  openSelectbox: function() {
    this.assertSingle();
 
    var $sbox =this;
    var options =$sbox.data( '__options');
    
    // open overlay for selection of options
    options.presentation.open.call( this);
    
    // mark select box as opened
    $sbox.data( '__opened', true);
    
    // add opened class
    $sbox.find( '> tbody').addClass( 'opened');
  },
  
  // see if select box is opened
  isSelectboxOpened: function() {
    this.assertSingle();
    
    return this.data( '__opened') !==undefined;
  },
  
  // close select box
  closeSelectbox: function() {
    this.assertSingle();
    
    var $sbox =this;
    var options =$sbox.data( '__options');
    
    // open overlay for selection of options
    options.presentation.close.call( this);
    
    // remove opened flag
    $sbox.removeData( '__opened');
    
    // remove opened class
    $sbox.find( '> tbody').removeClass( 'opened');
  },
  
  // check select box value
  toggleSelectboxOption: function( option, updateValue) {
    this.assertSingle();
    
    if( updateValue ===undefined)
      updateValue =true;

    var $sbox =this;
    var elem =$sbox.data( '__sbox');
    var multi =elem.multiple;
      
    if( !multi) {
      // search for an option and save it's index
      for( var i =0; i < elem.options.length; ++i) {
        if( elem.options[ i] ==option) {
          elem.selectedIndex =i;
          break;
        }
      }

    } else
      // mark option as one of selected options
      option.selected =!option.selected;
      
    if( updateValue)
      $(elem).trigger( 'change');
  },
  
  // check select box option by value
  toggleSelectboxOptionByValue: function( value, updateValue) {
    this.assertSingle();
    
    if( updateValue ===undefined)
      updateValue =true;

    var $sbox =this;
    var elem =$sbox.data( '__sbox');
      
    // search for an option with specified value
    for( var i =0; i < elem.options.length; ++i) {
      if( elem.options[ i].value ==value) {
        // toggle option
        $sbox.toggleSelectboxOption( elem.options[ i], false);
        break;
      }
    }
    
    // update value if necessary
    if( updateValue)
      $(elem).trigger( 'change');
  },
  
  // get select box menu object
  _getSelectboxMenuObject: function() {
    this.assertSingle();
    
    return this.find( '> tbody > tr.mid > td.canvas > div.menu');
  },
  
  // get select box canvas object
  _getSelectboxValueObject: function() {
    this.assertSingle();
    
    return this.find( '> tbody > tr.mid > td.canvas > div.value');
  },
  
  // update select box value
  _updateSelectboxValue: function( triggerChange) {
    this.assertSingle();
    
    if( triggerChange ===undefined)
      triggerChange =false;
    
    var $sbox =this;
    var elem =$sbox.data( '__sbox');
    var multi =elem.multiple;
    var options =$sbox.data( '__options');
    
    // get select box new value
    var value =options.makeValue.call( elem);
    
    // collect selected options
    $sbox
      ._getSelectboxValueObject()
      .html( value)
      .attr( 'title', value);
      
    // trigger change event only if requested
    if( triggerChange)
      $(elem).trigger( 'change');
  }
  
});

})( jQuery);