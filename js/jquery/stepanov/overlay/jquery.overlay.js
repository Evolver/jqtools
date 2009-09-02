/**
  * Author: Dmitry Stepanov
  * E-Mail: dmitrij@stepanov.lv
  * URL: http://www.stepanov.lv
  *
  * Overlay presentation
  */

if( typeof jQuery =='undefined')
  throw 'jQuery library is required';
if( typeof jQuery.utilVersion =='undefined')
  throw 'jQuery.util library is required';
if( typeof jQuery.viewportVersion =='undefined')
  throw 'jQuery.viewport library is required';
  
jQuery.extend({
  
  // overlay appearance effects
  OVERLAY_EFFECT_SLIDE_DOWN: 'slideDown',
  OVERLAY_EFFECT_SLIDE_OUT: 'slideOut',
  OVERLAY_EFFECT_FADE: 'fade',
  OVERLAY_EFFECT_NONE: 'none',
  
  // overlay content loading type
  OVERLAY_FROM_CONTAINER: 'container',
  OVERLAY_FROM_URL: 'url',
  
  // overlay alignment types
  OVERLAY_ALIGN_RELATIVE: 'relative',
  OVERLAY_ALIGN_ABSOLUTE: 'absolute',
  OVERLAY_ALIGN_VIEWPORT: 'viewport',
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
      break;
      default:
        throw 'Invalid effect "' +options.effect +'"';
      break;
    }
    
    if( options.effectSpeed ===undefined)
      options.effectSpeed ='fast';
    
    if( options.type ===undefined)
      options.type =jQuery.OVERLAY_FROM_CONTAINER;
    else switch( options.type) {
      case jQuery.OVERLAY_FROM_CONTAINER:
      case jQuery.OVERLAY_FROM_URL:
      break;
      default:
        throw 'Invalid overlay type "' +options.type +'"';
      break;
    }
    
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
      options.align =jQuery.OVERLAY_ALIGN_VIEWPORT;// align to viewport by default
      
    if( options.align ==jQuery.OVERLAY_ALIGN_RELATIVE) {
      // align relatively to specified element
      if( options.element ===undefined)
        throw 'No element specified to which alignment should be done';
        
    } else if( options.align ==jQuery.OVERLAY_ALIGN_ABSOLUTE) {
      // absolute alignment (absolute offsets)

    } else if( options.align ==jQuery.OVERLAY_ALIGN_VIEWPORT) {
      // align relative to current viewport

    } else if( options.align ==jQuery.OVERLAY_ALIGN_FIXED) {
      // show fixed overlay on the screen
        
    } else
      throw 'Invalid alignment type "' +align +'"';
      
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
      if( options.align ==jQuery.OVERLAY_ALIGN_RELATIVE || options.align ==jQuery.OVERLAY_ALIGN_ABSOLUTE || options.align ==jQuery.OVERLAY_ALIGN_VIEWPORT) {
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
          e.stopPropagation();
          
          // get parent overlay
          if( !jOverlay.isOverlayOpened())
            return;// overlay is not opened
          
          var childOverlay =jOverlay.getChildOverlay();
          if( !childOverlay)
            return;// no child overlay is opened
            
          // close child overlay
          jQuery(childOverlay).closeOverlay();
          
          // prevent default
          e.preventDefault();
        });

        // see if this overlay has any parent overlays, and if not, bind closing of current
        //  overlay to document
        if( jOverlay.getParentOverlay() ===null) {
          jQuery(document).click(function( e) {
            if( !jOverlay.isOverlayOpened())
              return;// overlay is not opened
              
            // close overlay
            jOverlay.closeOverlay();
          });
        }
        
      // track position if requested
      if( options.align ==jQuery.OVERLAY_ALIGN_FIXED) {
        // align overlay each time window resizes
        jQuery(window).resize(function(){
          // align overlay
          jOverlay.alignOverlay();
        });
      }
    });
  },
  
  // open overlay
  openOverlay: function() {
    this.assertSingle();
    this.assertOverlay();
    
    var overlay =this.get(0);
    var jOverlay =this;
    var options =jOverlay.data( '__options');
    
    // stop any animations on current overlay
    jOverlay.stop( true, true);
    
    if( jOverlay.isOverlayOpened())
      return true;// already opened
      
    // call callback before opening overlay
    if( !options.beforeOpen( overlay))
      return false;// do not open overlay
      
    // see if this overlay has any parent overlays,
    var parent =jOverlay.getParentOverlay();
    if( parent) {
      var jParent =jQuery(parent);
      
      if( !jParent.isOverlayOpened())
        throw 'Parent overlay is not opened, unable to open current overlay. This should not happen.';
        
      // assign child overlay for parent
      jParent.data( '__childOverlay', overlay);
    }
    
    // position overlay on the screen
    jOverlay.alignOverlay();

    // callback to call after overlay has been displayed
    function afterOpen() {
      options.open( overlay);
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
      default:
        this.show();
        afterOpen();
      break;
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
    
    // stop any animations on current overlay
    jOverlay.stop( true, true);
    
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
      default:
        jOverlay.hide();
        afterClose();
      break;
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
    
    while( node.parentNode) {
      node =node.parentNode;
      
      if( jQuery(node).isOverlay())
        return node;
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
  
  // see if element is an overlay
  isOverlay: function() {
    this.assertSingle();
    
    return this.data( '__overlay') !==undefined;
  },
  
  // align overlay as configured
  alignOverlay: function() {
    this.assertSingle();
    this.assertOverlay();
    
    var jOverlay =this;
    var options =jOverlay.data( '__options');
    
    // obtain valid coordinates for display
    var top =0;
    var left =0;
    
    // show overlay before positioning
    var isHidden =jOverlay.is(':hidden');
    
    if( isHidden)
      jOverlay.show();
    
    if( options.align ==jQuery.OVERLAY_ALIGN_RELATIVE) {
      left =options.position.left;
      top =options.position.center;
      
    } else if( options.align ==jQuery.OVERLAY_ALIGN_ABSOLUTE || options.align ==jQuery.OVERLAY_ALIGN_VIEWPORT || options.align ==jQuery.OVERLAY_ALIGN_FIXED) {
      
      var boundsWidth;
      var boundsHeight;
      var boundsOffsetLeft =0;
      var boundsOffsetTop =0;
      
      if( options.align ==jQuery.OVERLAY_ALIGN_ABSOLUTE) {
        // get relative container
        var relContainer =jOverlay._getRelativeContainer();
        
        if( relContainer) {
          // relative container exists
          var jRelContainer =jQuery(relContainer);
          var offs =jRelContainer.offset();
          
          boundsWidth =jRelContainer.outerWidth( true);
          boundsHeight =jRelContainer.outerHeight( true);
          
          boundsOffsetLeft =offs.left;
          boundsOffsetTop =offs.top;
          
        } else {
          // relative container does not exist, assume document as relative container
          boundsWidth =jQuery(document).width();
          boundsHeight =jQuery(document).height();
        }
        
      } else /* OVERLAY_ALIGN_VIEWPORT || OVERLAY_ALIGN_FIXED */ {
        // get viewport bounds
        var viewport =jQuery(document).viewport();
        
        boundsWidth =viewport.viewportWidth;
        boundsHeight =viewport.viewportHeight;
        
        if( options.align ==jQuery.OVERLAY_ALIGN_VIEWPORT) {
          boundsOffsetLeft =viewport.scrollLeft;
          boundsOffsetTop =viewport.scrollTop;
        }
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
      
    // hide overlay
    if( isHidden)
      jOverlay.hide();
  },
  
  // get relative container
  _getRelativeContainer: function() {
    this.assertSingle();
    
    var parent =this.get(0);
    
    while( parent.parentNode) {
      if( jQuery(parent).css( 'position') =='relative')
        return parent;
        
      parent =parent.parentNode;
    }
    
    // no relative element found
    return null;
  }
  
});