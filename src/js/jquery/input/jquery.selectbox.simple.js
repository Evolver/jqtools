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
  
if( typeof $.selectboxVersion =='undefined')
  throw 'jQuery.selectbox library is required';
if( typeof $.viewportVersion =='undefined')
  throw 'jQuery.viewport library is required';

$.fn.extend({
  
  // create standard select box
  simpleSelectbox: function( options) {
    if( options ===undefined || typeof options !='object')
      options ={};
      
    if( options.selectAllLabel ===undefined)
      options.selectAllLabel ='Check all';
    if( options.deselectAllLabel ===undefined)
      options.deselectAllLabel ='Uncheck all';
    if( options.closeLabel ===undefined)
      options.closeLabel ='Close';
      
    // add presentation callbacks
    options.presentation ={
      // open callback
      open: $.fn.openSimpleSelectbox,
      // close callback
      close: $.fn.closeSimpleSelectbox
    };
    
    this.selectbox( options);
  },
  
  // open select box
  openSimpleSelectbox: function() {
    this.assertSingle();

    var $sbox =this;
    // get menu object
    var $menu =$sbox._getSelectboxMenuObject();
    var isAbsolutePositioned =( $menu.css( 'position') =='absolute');
    var options =$sbox.data( '__options');
    var elem =$sbox.data( '__sbox');
    
    // stop all animations if such existed
    $menu.stop( true, true);

    // generate contents
    $sbox._generateSimpleSelectboxMenu();

    if( isAbsolutePositioned) {
      
      // show element to obtain correct css values
      $menu
        .show()
        // backup offsets
        .data( '__originalOffsets', {
          'top': $menu.css( 'top'),
          'left': $menu.css( 'left')
        });
        
      // BUG: annoying overflow bugfix for Opera 10 and IE7.
      //       The bug is demonstrated at http://www.stepanov.lv/pub/opera/bugs/absolute_min-width.html
      // ATTENTION: this bugfix is intended for the menu, the width of which is determined by the width
      //   of option elements in div.menu > div.items. All other layouts will appear incorrectly in IE7,
      //   because IE7 is so shit browser, that i found no possible way to correctly determine actual
      //   width of content inside div.menu to properly resize it.
      if(($.browser.msie && parseInt( $.browser.version) ==7) || $.browser.opera) {
        // the purpose of this bugfix is to determine actual width of
        //  div.menu content and assign that width explicitly, without
        //  relying on min-width, because both browsers fail to properly
        //  calculate div.menu width and properly draw scrollbars on content
        //  overflow in given situation. Actuall, overflowing with scrollbars
        //  involved is kinda fucked up in Opera and IE7.
        
        // remove absolute positioning
        $menu.css({
          'position': 'fixed'
        });
        
        var menuWidth;
        
        // opera fix
        if( $.browser.opera) {
          // opera properly calculates menu width when menu's position is
          //  fixed.
          menuWidth =$menu.width();
        }
        
        // IE fix
        if( $.browser.msie) {
          // IE 7 proves itself as complete shit, so we have to gather
          //   width from the most wide option in the menu.
          menuWidth =0;
          // find widest option item
          $menu.find( '> .items').each(function(){
            var w =$(this).outerWidth( true);
            if( w > menuWidth)
              menuWidth =w;
          });
        }
        
        // restore absolute positioning and assign
        //  actual width of an element
        $menu.css({
          'position': 'absolute',
          'width': menuWidth +'px'
        });
      }
      
      // align to viewport
      $menu
        // align to viewport
        .alignToViewport({
          // hide after alignment
          hide: true,
          // 5 pixel viewport gap
          gap: 5,
          // do not align vertically
          verticalAlign: (elem.getAttribute( 'data-no-vertical-align') ===null ? true : false)
        });
    }
    
    // show menu object with specified effect
    switch( options.effect) {
      case $.SELECTBOX_EFFECT_SLIDE_OUT:
        $menu.show( 'fast');
      break;
      case $.SELECTBOX_EFFECT_SLIDE_DOWN:
        $menu.slideDown( 'fast');
      break;
      case $.SELECTBOX_EFFECT_FADE:
        $menu.fadeIn( 'fast');
      break;
      case $.SELECTBOX_EFFECT_NONE:
      default:
        $menu.show();
      break;
    }
  },
  
  // close select box
  closeSimpleSelectbox: function() {
    this.assertSingle();
    
    var $sbox =this;
    var $menu =$sbox._getSelectboxMenuObject();
    var isAbsolutePositioned =( $menu.css( 'position') =='absolute');
    var options =$sbox.data( '__options');
    
    function postHide() {
      if( isAbsolutePositioned) {
        // restore positioning
        var originalOffsets =$menu.data( '__originalOffsets');
        if( originalOffsets !==undefined) {
          $menu
            // restore offsets
            .css({
              'top': originalOffsets.top,
              'left': originalOffsets.left
            })
            // remove data
            .removeData( '__originalOffsets');
        }
      }
      
      // clear menu's contents
      $menu
        .html( '')
        // hide completely (this fixes bug when element's parent is being hidden before
        //  it's animation has completed. in that case element remains visible on the screen)
        .hide();
    }
    
    // stop all animations if such existed
    $menu.stop( true, true);
    
    // hide menu according to specified effect
    switch( options.effect) {
      case $.SELECTBOX_EFFECT_SLIDE_OUT:
        $menu.hide( 'fast', postHide);
      break;
      case $.SELECTBOX_EFFECT_SLIDE_DOWN:
        $menu.slideUp( 'fast', postHide);
      break;
      case $.SELECTBOX_EFFECT_FADE:
        $menu.fadeOut( 'fast', postHide);
      break;
      case $.SELECTBOX_EFFECT_NONE:
      default:
        postHide();
      break;
    }
  },
  
  // generate simple select box contents
  _generateSimpleSelectboxMenu: function() {
    this.assertSingle();

    var $sbox =this;
    var elem =$sbox.data( '__sbox');
    var options =$sbox.data( '__options');
    var multi =elem.multiple;
    var hasToolbar =(multi && elem.options.length >4);
    
    var $menu =$sbox._getSelectboxMenuObject();

    var html ='';

    // see if select box is in 'multiple' mode and there are more than four
    //  options to select.
    if( hasToolbar) {
      // add toolbar with 'select all' and 'deselect all' buttons
      html += '<div class="tools">' +
                '<a href="javascript:;" class="select-all">' +$.escapeHTML( options.selectAllLabel) +'</a>' +
                '<a href="javascript:;" class="deselect-all">' +$.escapeHTML( options.deselectAllLabel) +'</a>' +
                '<a href="javascript:;" class="close">' +$.escapeHTML( options.closeLabel) +'</a>' +
              '</div>';
    }
    
    var i;
    var opt;
    // begin item container
    html +='<div class="items">';
    
    for( i =0; i < elem.options.length; ++i) {
      opt =elem.options[i];
      html += '<div' +((multi ? elem.options[i].selected : elem.selectedIndex ==i) ? ' class="selected"' :'') +'>' +
                (multi ? '<div class="checkbox"></div>' :'') +
                '<div class="label">' +(opt.label ? opt.label : opt.text) +'</div>' +
              '</div>';
    }
    
    // end item container
    html +='</div>';
    
    // reset index
    i =0;
    
    // set menu object contents
    $menu
      .html( html)
      .find( '> .items > div')
      .each( function(){
        var $this =$(this);
        
        // store option
        $this.data( '__option', elem.options[ i++]);
      })
      .click( function(e){
        var $this =$(this);
        var option =$this.data( '__option');
        
        if( !option) {
          $this.remove();// remove current element
          return;// this option was removed
        }
        
        // check option
        $sbox.toggleSelectboxOption( option);
        
        if( !multi) {
          // close menu
          $sbox.closeSelectbox();
          
        } else {
          // mark item as selected
          if( option.selected)
            $this.addClass( 'selected');
          else
            $this.removeClass( 'selected');
        }
          
        e.stopPropagation();
      });
      
    if( hasToolbar) {
      // toolbar has been added, bind tool handlers
      $menu.find( '> .tools > .select-all').click( function(){
        $sbox._checkAllSimpleSelectboxOptions();
        
        // regenerate menu
        $sbox._generateSimpleSelectboxMenu();
      });
      $menu.find( '> .tools > .deselect-all').click( function(){
        $sbox._uncheckAllSimpleSelectboxOptions();
        
        // regenerate menu
        $sbox._generateSimpleSelectboxMenu();
      });
      $menu.find( '> .tools > .close').click( function(){
        $sbox.closeSelectbox();
      });
    }
  },
  
  // check all options
  _checkAllSimpleSelectboxOptions: function() {
    this.assertSingle();

    var $sbox =this;
    var elem =$sbox.data( '__sbox');
    var options =$sbox.data( '__options');
    var option;
    
    for( var i =0; i < elem.options.length; ++i) {
      option =elem.options[ i];
      
      // see if option is already checked
      if( option.selected)
        continue;
        
      // toggle option
      $sbox.toggleSelectboxOption( option, false);
    }
    
    // update value
    $(elem).trigger( 'change');
  },
  
  // uncheck all options
  _uncheckAllSimpleSelectboxOptions: function() {
    this.assertSingle();

    var $sbox =this;
    var elem =$sbox.data( '__sbox');
    var options =$sbox.data( '__options');
    var option;
    
    for( var i =0; i < elem.options.length; ++i) {
      option =elem.options[ i];
      
      // see if option is already unchecked
      if( !option.selected)
        continue;
        
      // toggle option
      $sbox.toggleSelectboxOption( option, false);
    }
    
    // update value
    $(elem).trigger( 'change');
  }
  
});

})( jQuery);