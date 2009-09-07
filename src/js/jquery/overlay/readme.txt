
Theory:

  jQuery.overlay manages overlay showing/hiding, overlay appearance effects and overlay nesting with proper
  overlay closing when clicking background.
  
  Before using the API, you need to initialize overlay by calling $( overlaySelector).overlay({...}).
  
  To open overlay, call openOverlay(), to close, call closeOverlay().

minimal markup:

  <div id="overlay"></div>
  
API:

  var jOverlay =$( '#overlay');
  
  // init overlay
  jOverlay.overlay({...});
  
  // methods
  bool jOverlay.openOverlay();
  bool jOverlay.closeOverlay();
  bool jOverlay.isOverlayOpened();
  bool jOverlay.hasChildOverlayOpened();
  DOMElement/null jOverlay.getParentOverlay();
  DOMElement/null jOverlay.getChildOverlay();
  void jOverlay.alignOverlay();

usage:

  $( '#overlay')
    .overlay({
    
      /**
       * What effect to use to show opening and closing overlay.
       *  Possible values:
       *      jQuery.OVERLAY_EFFECT_NONE
       *      jQuery.OVERLAY_EFFECT_SLIDE_OUT
       *      jQuery.OVERLAY_EFFECT_SLIDE_DOWN
       *      jQuery.OVERLAY_EFFECT_FADE
       *      jQuery.OVERLAY_EFFECT_FOCUS
       *
       */
      effect: jQuery.OVERLAY_EFFECT_SLIDE_DOWN,
      
      /**
       * At what speed (value in miliseconds, string 'fast' or string 'slow') to display the effects.
       *  Default is 'fast'.
       *
       */
      effectSpeed: 'fast',
      
      /**
       * Color to use in effect. Currently effect color makes sense only for jQuery.OVERLAY_EFFECT_FOCUS.
       *
       */
      effectColor: 'black',
      
      /**
       * Callback to call before opening overlay. Callback should return either true or false, indicating
       *  if overlay should be continued loading.
       *
       * @param DOMElement overlay
       * @return boolean
       */
      beforeOpen: function( overlay) {
        return true;
      },
      
      /**
       * Callback to call after overlay has finished loading and is visible.
       *
       * @param DOMElement overlay
       */
      open: function( overlay) {
      },
      
      /**
       * Callback to call before closing overlay. Callback should return either true or false, indicating
       *  if overlay should be continued closing.
       *
       * @param DOMElement overlay
       * @return boolean
       */
      beforeClose: function( overlay) {
        return true;
      },
      
      /**
       * Callback to call after overlay closing has been finished.
       *
       * @param DOMElement overlay
       * @return boolean
       */
      close: function( overlay) {
        return true;
      },
      
      /**
       * Overlay alignment type.
       *  Possible values:
       *      jQuery.OVERLAY_ALIGN_RELATIVE - align relative to current position
       *      jQuery.OVERLAY_ALIGN_ABSOLUTE - align absolutely, relative to the closest parent with CSS "position: relative";
       *      jQuery.OVERLAY_ALIGN_FIXED - align relative to browser's window.
       *
       */
      align: jQuery.OVERLAY_ALIGN_FIXED,
      
      /**
       * Positioning offsets. Only top and left are accepted. You may use jQuery.OVERLAY_POSITION_CENTER to specify
       *  that the overlay should be positioned at the center. jQuery.OVERLAY_POSITION_CENTER makes any sense only
       *  for jQuery.OVERLAY_ALIGN_ABSOLUTE or jQuery.OVERLAY_ALIGN_FIXED.
       *
       * @param DOMElement overlay
       * @return boolean
       */
      position: {
        top: 10,
        left: jQuery.OVERLAY_POSITION_CENTER
      }
      
    });