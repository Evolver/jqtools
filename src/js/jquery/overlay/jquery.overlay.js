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
if( typeof jQuery.viewportVersion =='undefined')
  throw 'jQuery.viewport library is required';
  
jQuery.extend({
  
  // overlay appearance effects
  OVERLAY_EFFECT_NONE: 'none',
  OVERLAY_EFFECT_SLIDE_DOWN: 'slideDown',
  OVERLAY_EFFECT_SLIDE_OUT: 'slideOut',
  OVERLAY_EFFECT_FADE: 'fade',
  OVERLAY_EFFECT_FOCUS: 'focus',
  
  // overlay alignment types
  OVERLAY_ALIGN_RELATIVE: 'relative',
  OVERLAY_ALIGN_ABSOLUTE: 'absolute',
  OVERLAY_ALIGN_FIXED: 'fixed',
  
  // positioning
  OVERLAY_POSITION_CENTER: 'center'
  
});
  
jQuery.fn.extend({
  
  // ensure selected object is an overlay
  assertOverlay: function() {
    if( this.data( '__overlay') ===undefined)
      throw 'Selected element is not an overlay';
  },
  
  // initialize overlay object
  overlay: function( options) {
    if( options ===undefined)
      options ={};
      
    if( options.effect ===undefined)
      options.effect =jQuery.OVERLAY_EFFECT_NONE;
    else switch( options.effect) {
      case jQuery.OVERLAY_EFFECT_NONE:
      case jQuery.OVERLAY_EFFECT_FADE:
      case jQuery.OVERLAY_EFFECT_SLIDE_DOWN:
      case jQuery.OVERLAY_EFFECT_SLIDE_OUT:
      case jQuery.OVERLAY_EFFECT_FOCUS:
      break;
      default:
        throw 'Invalid effect "' +options.effect +'"';
      break;
    }
    
    // effect speed
    if( options.effectSpeed ===undefined)
      options.effectSpeed ='fast';
      
    // effect color
    if( options.effectColor ===undefined)
      options.effectColor ='black';
    
    // callback to call before displaying overlay
    if( options.beforeOpen ===undefined)
      options.beforeOpen =/* bool */ function( /* DOMElement */ object){ return true; };
      
    // callback to call after displaying overlay
    if( options.open ===undefined)
      options.open =/* void */ function( /* DOMElement */ object){};
    
    // callback to call before closing overlay
    if( options.beforeClose ===undefined)
      options.beforeClose =/* bool */ function( /* DOMElement */ object){ return true; };
      
    // callback to call after closing overlay
    if( options.close ===undefined)
      options.close =/* void */ function( /* DOMElement */ object){};

    // alignment type
    if( options.align ===undefined)
      options.align =jQuery.OVERLAY_ALIGN_FIXED;// align to viewport by default
      
    // focus effect opacity
    if( options.focusOpacity ===undefined)
      options.focusOpacity =0.3;
      
    if( options.align ==jQuery.OVERLAY_ALIGN_RELATIVE) {
      // align relatively to specified element
        
    } else if( options.align ==jQuery.OVERLAY_ALIGN_ABSOLUTE) {
      // absolute alignment (absolute offsets)

    } else if( options.align ==jQuery.OVERLAY_ALIGN_FIXED) {
      // show fixed overlay on the screen
        
    } else
      throw 'Invalid alignment type "' +options.align +'"';
      
    // overlay positioning
    if( options.position ===undefined) {
      options.position ={
        left: 0,
        top: 0
      };
    } else {
      if( options.position.top ===undefined)
        options.position.top =0;
      if( options.position.left ===undefined)
        options.position.left =0;
    }
      
    this.each( function(){
      
      var overlay =this;
      var jOverlay =jQuery(overlay);
      
      // see if alignment type matches current css settings
      if( options.align ==jQuery.OVERLAY_ALIGN_RELATIVE || options.align ==jQuery.OVERLAY_ALIGN_ABSOLUTE) {
        jOverlay.css( 'position', 'absolute');

      } else if( options.align ==jQuery.OVERLAY_ALIGN_FIXED) {
        jOverlay.css( 'position', 'fixed');
      }
      
      // mark this element as overlay
      jOverlay
        .data( '__overlay', true)
        // save options
        .data( '__options', options)
        // hide overlay initially
        .hide()
        // bind click event
        .click( function( e){
          // stop propagation
          //e.stopPropagation();
          
          // get parent overlay
          if( !jOverlay.isOverlayOpened())
            return;// overlay is not opened
            
          // see if parent element has been clicked
          if( jQuery(e.target).isDescendantOf( overlay, true))
            return;// expecting clicks to close overlay on parent elements only
          
          var childOverlay =jOverlay.getChildOverlay();
          if( !childOverlay)
            return;// no child overlay is opened
            
          // close child overlay
          jQuery(childOverlay).closeOverlay();
          
          // prevent default
          e.preventDefault();
        })
        // bind remove event
        .bind( 'remove', function( e){
          // close overlay
          jOverlay.closeOverlay();
          
          // cancel all pending actions
          jOverlay._overlayCancelAll();
        });

      // see if this overlay has any parent overlays, and if not, bind closing of current
      //  overlay to document
      if( jOverlay.getParentOverlay() ===null) {
        var clickFn =function( e) {
          
          if( jQuery(e.target).isDescendantOf( overlay, true))
            return;// expecting clicks on parent elements only
            
          if( !jOverlay.isOverlayOpened())
            return;// overlay is not opened
            
          // close overlay
          jOverlay.closeOverlay();
        };
        
        // bind click function
        jQuery(document).click( clickFn);
        // unbind click event when element is removed from DOM
        jOverlay
          .bind( 'remove', function( e){
            jQuery(document).unbind( 'click', clickFn);
          });
      }
        
      // track position if requested
      if( options.align ==jQuery.OVERLAY_ALIGN_FIXED) {
        var resizeFn =function(){
          // align overlay
          jOverlay.alignOverlay();
        };
        
        // align overlay each time window resizes
        jQuery(window).resize( resizeFn);
        // unbind resize event when element is removed from DOM
        jOverlay
          .bind( 'remove', function( e){
            jQuery(window).unbind( 'resize', resizeFn);
          });
      }
    });
  },
  
  // open overlay
  openOverlay: function( data) {
    this.assertSingle();
    this.assertOverlay();
    
    var overlay =this.get(0);
    var jOverlay =this;
    var options =jOverlay.data( '__options');
    
    // stop any animations on current overlay
    jOverlay._overlayCancelAll();
    
    if( jOverlay.isOverlayOpened())
      return true;// already opened
      
    // call callback before opening overlay
    var openResult =options.beforeOpen( overlay, data !==undefined ? data : undefined);
    if( openResult !==undefined && !openResult)
      return false;// do not open overlay
      
    // see if this overlay has any parent overlays,
    var parent =jOverlay.getParentOverlay();
    if( parent) {
      var jParent =jQuery(parent);
      
      if( !jParent.isOverlayOpened())
        throw 'Parent overlay is not opened, unable to open current overlay. This should not happen.';
        
      // assign child overlay for parent
      jParent.data( '__childOverlay', overlay);
      
      // if fading effect is being used, track z-indexes
      if( options.effect ==jQuery.OVERLAY_EFFECT_FOCUS) {
        // increment my z-index
        var zIndex =parseInt( jParent.data( '__zIndex'));
        
        // reserve for fade effect
        zIndex +=2;
        
        // assign z-index
        jOverlay
          .css( 'zIndex', zIndex)
          .data( '__zIndex', zIndex);
      }
      
    } else {
      if( options.effect ==jQuery.OVERLAY_EFFECT_FOCUS) {
        // store z-index for root overlay
        jOverlay.data( '__zIndex', jOverlay.css( 'zIndex'));
      }
    }
    
    // position overlay on the screen
    jOverlay.alignOverlay( true);

    // callback to call after overlay has been displayed
    function afterOpen() {
      options.open( overlay, data !==undefined ? data : undefined);
    }
    
    // apply display effect for the overlay
    switch( options.effect) {
      // fade
      case jQuery.OVERLAY_EFFECT_FADE:
        this.fadeIn( options.effectSpeed, afterOpen);
      break;
      // slide down
      case jQuery.OVERLAY_EFFECT_SLIDE_DOWN:
        this.slideDown( options.effectSpeed, afterOpen);
      break;
      // slide out
      case jQuery.OVERLAY_EFFECT_SLIDE_OUT:
        this.show( options.effectSpeed, afterOpen);
      break;
      // no or invalid effect
      case jQuery.OVERLAY_EFFECT_NONE:
      case jQuery.OVERLAY_EFFECT_FOCUS:
      default:
        this.show();
        afterOpen();
      break;
    }
    
    if( options.effect ==jQuery.OVERLAY_EFFECT_FOCUS) {
      // focusing effect is used, create background fixed overlay, that will fade

      // alloc new id
      var bgId =jQuery.uniqueId();
      
      // get z-index of fading background for current overlay
      var zIndex =parseInt( jOverlay.css( 'zIndex')) -1;
      
      // create element
      var jPrepend =parent ? jQuery(parent) : jQuery( 'body');
      
      // prepend
      jPrepend.prepend( '<div id="' +bgId +'" style="position:fixed;left:0px;top:0px;background-color:' +options.effectColor +';width:100%;height:100%;z-index:' +zIndex +';"></div>');
      
      // get element
      var bg =document.getElementById( bgId);
      var jBg =jQuery(bg);
      
      // fade to
      jBg
        .fadeTo( 0, 0)
        .fadeTo( options.effectSpeed, options.focusOpacity)
        .click(function(){
          // close overlay when clicked
          jOverlay.closeOverlay();
        });
      
      // reference element
      jOverlay.data( '__focusObject', bg);
    }
    
    // opened
    return true;
  },
  
  // close overlay
  closeOverlay: function() {
    this.assertSingle();
    this.assertOverlay();
    
    var overlay =this.get(0);
    var jOverlay =this;
    var options =jOverlay.data( '__options');
    
    // stop any pending actions for current overlay
    jOverlay._overlayCancelAll();
    
    if( !jOverlay.isOverlayOpened())
      return true;// already closed
      
    if( !options.beforeClose( overlay))
      return false;// user denies closing of overlay
 
    // see if any child overlays opened
    if( jOverlay.hasChildOverlayOpened()) {
      // close child overlay
      if( !jQuery( jOverlay.getChildOverlay()).closeOverlay())
        return false;// failed to close one of the child overlays
    }

    // see if got parent overlay, and if got, see if it is opened.
    // if parent overlay is closed, do not close current overlay,
    // because it is should not be visible.
    var parent =jOverlay.getParentOverlay();
    if( parent) {
      var jParent =jQuery(parent);
      
      if( !jParent.isOverlayOpened())
        throw 'Parent overlay is not opened, but the current overlay is. This should not happen.';
        
      // remove child overlay from parent
      jParent.removeData( '__childOverlay');
    }
    
    // function to call when animation ends
    function afterClose() {
      options.close( overlay);
    }
    
    // apply visual effect
    switch( options.effect) {
      case jQuery.OVERLAY_EFFECT_FADE:
        jOverlay.fadeOut( options.effectSpeed, afterClose);
      break;
      case jQuery.OVERLAY_EFFECT_SLIDE_OUT:
        jOverlay.hide( options.effectSpeed, afterClose);
      break;
      case jQuery.OVERLAY_EFFECT_SLIDE_DOWN:
        jOverlay.slideUp( options.effectSpeed, afterClose);
      break;
      case jQuery.OVERLAY_EFFECT_NONE:
      case jQuery.OVERLAY_EFFECT_FOCUS:
      default:
        jOverlay.hide();
        afterClose();
      break;
    }
    
    if( options.effect ==jQuery.OVERLAY_EFFECT_FOCUS) {
      // focusing effect is in use, remove background object
      var bg =jOverlay.data( '__focusObject');
      var jBg =jQuery(bg);
      
      // stop all animations on it
      jBg.stop( true, true);
      
      // fade out and remove
      jBg.fadeOut( options.effectSpeed, function(){
        // delete element
        jBg.remove();
      });
      
      jOverlay.removeData( '__focusObject');
    }
    
    // closed
    return true;
  },
  
  // see if overlay is opened
  isOverlayOpened: function() {
    this.assertSingle();
    this.assertOverlay();
    
    return this.is( ':visible');
  },
  
  // see if current overlay has child overlay opened
  hasChildOverlayOpened: function() {
    this.assertSingle();
    
    return this.data( '__childOverlay') !==undefined;
  },
  
  // get parent overlay element
  getParentOverlay: function() {
    this.assertSingle();
    
    var node =this.get(0);
    
    try {
      while( node.parentNode) {
        node =node.parentNode;
        
        if( jQuery(node)._isOverlay())
          return node;
      }
    } catch( e){
      // exception thrown, assume not found
      return null;
    }
    
    // not found
    return null;
  },
  
  // get child overlay element
  getChildOverlay: function() {
    this.assertSingle();
    
    if( this.data( '__childOverlay') ===undefined)
      return null;// no child overlay opened
      
    return this.data( '__childOverlay');
  },

  // align overlay as configured
  alignOverlay: function( forceAlign) {
    this.assertSingle();
    this.assertOverlay();
    
    if( forceAlign ===undefined)
      forceAlign =false;
    
    var jOverlay =this;
    var options =jOverlay.data( '__options');
    
    // obtain valid coordinates for display
    var top =0;
    var left =0;
    
    // see if overlay is hidden
    var isHidden =jOverlay.is(':hidden');
    
    // do not align hidden overlays
    if( isHidden && !forceAlign)
      return;
    else if( isHidden)
      jOverlay.show();
    
    if( options.align ==jQuery.OVERLAY_ALIGN_RELATIVE) {
      left =options.position.left;
      top =options.position.top;
      
    } else if( options.align ==jQuery.OVERLAY_ALIGN_ABSOLUTE || options.align ==jQuery.OVERLAY_ALIGN_FIXED) {
      
      var boundsWidth;
      var boundsHeight;
      var boundsOffsetLeft =0;
      var boundsOffsetTop =0;
      
      if( options.align ==jQuery.OVERLAY_ALIGN_ABSOLUTE) {
        // get relative container
        var relContainer =jOverlay.getRelativeContainer();
        
        if( relContainer) {
          // relative container exists
          var jRelContainer =jQuery(relContainer);
          var offs =jRelContainer.offset();
          
          boundsWidth =jRelContainer.outerWidth( true);
          boundsHeight =jRelContainer.outerHeight( true);
          
        } else {
          // relative container does not exist, assume document as relative container
          boundsWidth =jQuery(document).width();
          boundsHeight =jQuery(document).height();
        }
        
      } else /* OVERLAY_ALIGN_FIXED */ {
        // get viewport bounds
        var viewport =jQuery(document).viewport();
        
        boundsWidth =viewport.viewportWidth;
        boundsHeight =viewport.viewportHeight;
      }
      
      // calculate positioning
      if( options.position.left ==jQuery.OVERLAY_POSITION_CENTER)
        left =jQuery.getCenteringOffset( boundsWidth, jOverlay.outerWidth(true));
      else
        left =options.position.left;
        
      if( options.position.top ==jQuery.OVERLAY_POSITION_CENTER)
        top =jQuery.getCenteringOffset( boundsHeight, jOverlay.outerHeight(true));
      else
        top =options.position.top;

    } else
      throw 'Invalid alignment type "' +options.align +'"';
      
    // assign coordinates
    jOverlay
      .css({
        'left': boundsOffsetLeft +left,
        'top': boundsOffsetTop +top
      });
      
    if( isHidden)
      jOverlay.hide();
  },
  
  // close current overlay
  closeCurrentOverlay: function() {
    this.assertSingle();
    
    // find overlay element
    if( this._isOverlay()) {
      // close current element
      this.closeOverlay();
      
    } else {
      var overlay =this.getParentOverlay();
      if( overlay ===null)
        throw 'No current overlay has been found. This should not happen.';
        
      // close found overlay
      jQuery(overlay).closeOverlay();
    }
  },
  
  // see if element is an overlay
  _isOverlay: function() {
    this.assertSingle();
    
    return this.data( '__overlay') !==undefined;
  },
  
  // cancel all pending operations on overlay
  _overlayCancelAll: function() {
    this.assertSingle();
    this.assertOverlay();
    
    var jOverlay =this;
    
    // stop any animations on current overlay
    jOverlay.stop( true, true);
  }
  
});