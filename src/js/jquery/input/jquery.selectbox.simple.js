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
if( typeof jQuery.selectboxVersion =='undefined')
  throw 'jQuery.selectbox library is required';
if( typeof jQuery.viewportVersion =='undefined')
  throw 'jQuery.viewport library is required';

jQuery.fn.extend({
  
  // create standard select box
  simpleSelectbox: function( options) {
    if( options ===undefined || typeof options !='object')
      options ={};
      
    // add presentation callbacks
    options.presentation ={
      // open callback
      open: jQuery.fn.openSimpleSelectbox,
      // close callback
      close: jQuery.fn.closeSimpleSelectbox
    };
    
    this.selectbox( options);
  },
  
  // open select box
  openSimpleSelectbox: function() {
    this.assertSingle();

    var jSbox =this;
    // get menu object
    var jMenu =jSbox._getSelectboxMenuObject();
    var isAbsolutePositioned =( jMenu.css( 'position') =='absolute');
    var options =jSbox.data( '__options');
    
    // stop all animations if such existed
    jMenu.stop( true, true);

    // generate contents
    jSbox._generateSimpleSelectboxMenu();

    if( isAbsolutePositioned) {
      // show element to obtain correct css values
      jMenu
        .show()
        // backup offsets
        .data( '__originalOffsets', {
          'top': jMenu.css( 'top'),
          'left': jMenu.css( 'left')
        });
      
      // align to viewport
      jMenu
        // align to viewport
        .alignToViewport({
          // hide after alignment
          hide: true,
          gap: 5 // 5 pixel viewport gap
        });
    }
    
    // show menu object with specified effect
    switch( options.effect) {
      case jQuery.SELECTBOX_EFFECT_SLIDE_OUT:
        jMenu.show( 'fast');
      break;
      case jQuery.SELECTBOX_EFFECT_SLIDE_DOWN:
        jMenu.slideDown( 'fast');
      break;
      case jQuery.SELECTBOX_EFFECT_FADE:
        jMenu.fadeIn( 'fast');
      break;
      case jQuery.SELECTBOX_EFFECT_NONE:
      default:
        jMenu.show();
      break;
    }
    
  },
  
  // close select box
  closeSimpleSelectbox: function() {
    this.assertSingle();
    
    var jSbox =this;
    var jMenu =jSbox._getSelectboxMenuObject();
    var isAbsolutePositioned =( jMenu.css( 'position') =='absolute');
    var options =jSbox.data( '__options');
    
    function postHide() {
      if( isAbsolutePositioned) {
        // restore positioning
        var originalOffsets =jMenu.data( '__originalOffsets');
        
        jMenu
          // restore offsets
          .css({
            'top': originalOffsets.top,
            'left': originalOffsets.left
          })
          // remove data
          .removeData( '__originalOffsets')
      }
      
      // clear menu's contents
      jMenu
        .html( '')
        // hide completely (this fixes bug when element's parent is being hidden before
        //  it's animation has completed. in that case element remains visible on the screen)
        .hide();
    }
    
    // stop all animations if such existed
    jMenu.stop( true, true);
    
    // hide menu according to specified effect
    switch( options.effect) {
      case jQuery.SELECTBOX_EFFECT_SLIDE_OUT:
        jMenu.hide( 'fast', postHide);
      break;
      case jQuery.SELECTBOX_EFFECT_SLIDE_DOWN:
        jMenu.slideUp( 'fast', postHide);
      break;
      case jQuery.SELECTBOX_EFFECT_FADE:
        jMenu.fadeOut( 'fast', postHide);
      break;
      case jQuery.SELECTBOX_EFFECT_NONE:
      default:
        postHide();
      break;
    }
  },
  
  // generate simple select box contents
  _generateSimpleSelectboxMenu: function() {
    this.assertSingle();

    var jSbox =this;
    var elem =jSbox.data( '__sbox');
    var multi =elem.multiple;
    
    var jMenu =jSbox._getSelectboxMenuObject();

    var html ='';
    var i;
	var opt;
    for( i =0; i < elem.options.length; ++i) {
		opt =elem.options[i];
      html += '<div' +((multi ? elem.options[i].selected : elem.selectedIndex ==i) ? ' class="selected"' :'') +'>' +
                (multi ? '<div class="checkbox"></div>' :'') +
                '<div class="label">' +(opt.label ? opt.label : opt.text) +'</div>' +
              '</div>';
    }
    
    // reset index
    i =0;
    
    // set menu object contents
    jMenu
      .html( html)
      .find( '> div')
      .each( function(){
        var jThis =jQuery(this);
        
        // store option
        jThis.data( '__option', elem.options[ i++]);
      })
      .click( function(e){
        var jThis =jQuery(this);
        var option =jThis.data( '__option');
        
        if( !option) {
          jThis.remove();// remove current element
          return;// this option was removed
        }
        
        // check option
        jSbox.toggleSelectboxOption( option);
        
        if( !multi) {
          // close menu
          jSbox.closeSelectbox();
          
        } else
          jSbox._generateSimpleSelectboxMenu();
          
        e.stopPropagation();
      });
  }
  
});