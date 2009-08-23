/**
  * Author: Dmitry Stepanov
  * E-Mail: dmitrij@stepanov.lv
  * URL: http://www.stepanov.lv
  */

jQuery.fn.extend({
  
  // calculate viewport information for specified element
  viewport: function() {
    if( this.size() ==0)
      throw new 'No elements selected';
    
    // get first element in the index
    var elem =this.get(0);
    var isDocument =elem.nodeName =='#document';
    
    var viewportWidth =isDocument ? jQuery(window).width() : jQuery(elem).outerWidth( false);
    var viewportHeight =isDocument ? jQuery(window).height() : jQuery(elem).outerHeight( false);
    var documentWidth =isDocument ? jQuery(elem).width() : elem.scrollWidth;
    var documentHeight =isDocument ? jQuery(elem).height() : elem.scrollHeight;
    var scrollLeft =jQuery(elem).scrollLeft();
    var scrollTop =jQuery(elem).scrollTop();
    
    if( $.browser.safari && !isDocument) {
      // webkit has bugs with right margin calculation from getComputedStyle(), so temporarily
      //  set elements display to 'inline-block', calculate dimensions, and restore display prop
      var disp =jQuery( elem).css( 'display');
      jQuery( elem).css( 'display', 'inline-block');
      
      var width =jQuery(elem).outerWidth( true);
      var height =jQuery(elem).outerHeight( true);
      
      jQuery( elem).css( 'display', disp);
      
    } else {
      // use overall formula
      var width =isDocument ? jQuery(elem).width() : jQuery(elem).outerWidth( true);
      var height =isDocument ? jQuery(elem).height() : jQuery(elem).outerHeight( true);
      
    }
    
    return {
      'width': width,
      'height': height,
      'viewportWidth': viewportWidth,
      'viewportHeight': viewportHeight,
      'documentWidth': documentWidth,
      'documentHeight': documentHeight,
      'scrollLeft': scrollLeft,
      'scrollTop': scrollTop,
      'visibleLeft': scrollLeft,
      'visibleRight': scrollLeft +viewportWidth,
      'visibleTop': scrollTop,
      'visibleBottom': scrollTop +viewportHeight
    };
  },
  
  // align element to viewport
  alignToViewport: function( options) {
    // alignment gap in pixels
    if( typeof options.gap =='undefined')
      options.gap =0;
    
    // get document viewport
    var viewport =jQuery(document).viewport();
    
    // iterate each element
    this.each( function(){
      
      jQuery(this)
        .data( 'viewportHorizAlign', null)
        .data( 'viewportVertAlign', null);
      
      // get dimensions
      var offs =jQuery(this).offset();
      var pos =jQuery(this).position();
      var width =jQuery(this).outerWidth( true);
      var height =jQuery(this).outerHeight( true);
      
      viewport.visibleLeft +=options.gap;
      viewport.visibleRight -=options.gap;
      viewport.visibleTop +=options.gap;
      viewport.visibleBottom -=options.gap;
      
      // reposition by x
      if( viewport.visibleLeft >offs.left) {
        jQuery(this)
          .css( 'left', pos.left +( viewport.visibleLeft -offs.left))
          .data( 'viewportHorizAlign', 'left');
        
      } else if( viewport.visibleRight <(offs.left +width)) {
        jQuery(this)
          .css( 'left', pos.left -( offs.left +width -viewport.visibleRight))
          .data( 'viewportHorizAlign', 'right');
      }
      
      // reposition by y
      if( viewport.visibleTop >offs.top) {
        jQuery(this)
          .css( 'top', pos.top +( viewport.visibleTop -offs.top))
          .data( 'viewportVertAlign', 'top');
        
      } else if( viewport.visibleBottom <(offs.top +height)) {
        jQuery(this)
          .css( 'top', pos.top -( offs.top +height -viewport.visibleBottom))
          .data( 'viewportVertAlign', 'bottom');
      }
    });
    
    return this;
  }
  
});