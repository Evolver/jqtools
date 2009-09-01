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
  OVERLAY_EFFECT_NONE: 'none'
  
});
  
jQuery.fn.extend({
  
  // ensure selected object is an overlay
  assertOverlay: function() {
    if( this.data( '__overlay') ===undefined)
      throw 'Selected element is not an overlay';
  },
  
  // initialize overlay object
  overlay: function( options) {
    debug( ':overlay()');
    
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
    
    // TODO: add callbacks for overlay opening and overlay closing
      
    // FIXME
    if( options.align ===undefined)
      options.align ='viewport';// align to viewport by default
    else if( options.align =='relative') {
      // align relatively to specified element
      if( options.element ===undefined)
        throw 'No element specified to which alignment should be done';
        
    } else if( options.align =='absolute') {
      // absolute alignment (absolute offsets)
      if( options.element ===undefined)
        throw 'No element specified to which alignment should be done';
        
    } else if( options.align =='viewport') {
      // align relative to current viewport
      if( options.element ===undefined)
        throw 'No element specified to which alignment should be done';
        
    } else if( options.align =='static') {
      // show statically on the screen
      if( options.element ===undefined)
        throw 'No element specified to which alignment should be done';
        
    } else
      throw 'Invalid alignment type "' +align +'"';
      
    if( options.position ===undefined)
      options.position ={
        x: 'center',// align to the center
        y: 'center'// align to the center
      };
      
    this.each( function(){
      
      var jThis =jQuery(this);
      
      // see if alignment type matches current css settings
      if( options.align =='relative' || options.align =='absolute' || options.align =='viewport') {
        if( jThis.css( 'position') !='absolute')
          throw 'Overlay element requires to be absolutely positioned for "' +options.align +'" alignment to work';
          
      } else if( options.align =='static') {
        if( jThis.css( 'position') !='static')
          throw 'Overlay element requires to be statically positioned for "' +options.align +'" alignment to work';
      }
      
      // mark this element as overlay
      jThis
        .data( '__overlay', true)
        // save options
        .data( '__options', options)
        // hide overlay initially
        .hide();

    });
  },
  
  // open overlay
  openOverlay: function() {
    debug( ':openOverlay()');

    this.assertSingle();
    this.assertOverlay();
    
    if( this.isOverlayOpened())
      return;// already opened
      
    var jOverlay =this;
    var options =jOverlay.data( '__options');
      
    // see if this overlay has any parent overlays,
    var parent =this.getParentOverlay();
    if( parent) {
      var jParent =jQuery(parent);
      
      if( !jParent.isOverlayOpened())
        throw 'Parent overlay is not opened, unable to open current overlay. This should not happen.';
        
      // assign child overlay for parent
      jParent.data( '__childOverlay', this.get(0));
    }
    
    // position overlay on the screen
    switch( options.overlay) {
      
    }
    
    // apply display effect for the overlay
    
    // show overlay
    this.show();
  },
  
  // close overlay
  closeOverlay: function() {
    debug( ':closeOverlay()');
    
    this.assertSingle();
    this.assertOverlay();
    
    if( !this.isOverlayOpened())
      return;// already closed
      
    // see if any child overlays opened
    if( this.hasChildOverlayOpened()) {
      // close child overlay
      jQuery(this.getChildOverlay()).closeOverlay();
    }
      
    // see if got parent overlay, and if got, see if it is opened.
    // if parent overlay is closed, do not close current overlay,
    // because it is should not be visible.
    var parent =this.getParentOverlay();
    if( parent) {
      var jParent =jQuery(parent);
      
      if( !jParent.isOverlayOpened())
        throw 'Parent overlay is not opened, but the current overlay is. This should not happen.';
        
      // remove child overlay from parent
      jParent.removeData( '__childOverlay');
    }
      
    // hide overlay
    this.hide();
  },
  
  // see if overlay is opened
  isOverlayOpened: function() {
    debug( ':isOverlayOpened()');
    
    this.assertSingle();
    this.assertOverlay();
    
    return this.is( ':visible');
  },
  
  // see if current overlay has child overlay opened
  hasChildOverlayOpened: function() {
    debug( ':hasChildOverlayOpened()');
    
    this.assertSingle();
    
    return this.data( '__childOverlay') !==undefined;
  },
  
  // get parent overlay element
  getParentOverlay: function() {
    debug( ':getParentOverlay()');
    
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
    debug( ':getChildOverlay()');
    
    this.assertSingle();
    
    if( this.data( '__childOverlay') ===undefined)
      return null;// no child overlay opened
      
    return this.data( '__childOverlay');
  },
  
  // see if element is an overlay
  isOverlay: function() {
    debug( ':isOverlay()');
    
    this.assertSingle();
    
    return this.data( '__overlay') !==undefined;
  }
  
});