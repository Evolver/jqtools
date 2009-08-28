/**
  * Author: Dmitry Stepanov
  * E-Mail: dmitrij@stepanov.lv
  * URL: http://www.stepanov.lv
  */

if( typeof jQuery.utilVersion =='undefined')
  throw 'jQuery.util library is required';

jQuery.extend({
  
  // library version
  viewportVersion: 1.0
  
});

jQuery.fn.extend({
  
  // calculate viewport information for specified element
  viewport: function() {
    if( this.size() ==0)
      throw new 'No elements selected';
    
    // get first element in the index
    var elem =this.get(0);
    var jElem =jQuery(elem);
    var isDocument =elem.nodeName =='#document';
    
    var viewportWidth =isDocument ? jQuery(window).width() : jElem.outerWidth( false);
    var viewportHeight =isDocument ? jQuery(window).height() : jElem.outerHeight( false);
    var documentWidth =isDocument ? jElem.width() : elem.scrollWidth;
    var documentHeight =isDocument ? jElem.height() : elem.scrollHeight;
    var scrollLeft =jElem.scrollLeft();
    var scrollTop =jElem.scrollTop();
    
    if( $.browser.safari && !isDocument) {
      // webkit has bugs with right margin calculation from getComputedStyle(), so temporarily
      //  set elements display to 'inline-block', calculate dimensions, and restore display prop
      var disp =jElem.css( 'display');
      jElem.css( 'display', 'inline-block');
      
      var width =jElem.outerWidth( true);
      var height =jElem.outerHeight( true);
      
      jElem.css( 'display', disp);
      
    } else {
      // use overall formula
      var width =isDocument ? jElem.width() : jElem.outerWidth( true);
      var height =isDocument ? jElem.height() : jElem.outerHeight( true);
      
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

    if( options ===undefined)
      options ={};
      
    // alignment gap in pixels
    if( options.gap ===undefined)
      options.gap =0;
    // hide elements after alignment?
    if( options.hide ===undefined)
      options.hide =false;
      
    // first of all, hide all elements, because if elements are shown at this point,
    //  and if there is need to reposition them, after repositioning there may be gaps
    //  left because of the disappeared scrollbars
    this.hide();
      
    // get document viewport
    var viewport =jQuery(document).viewport();
    
    // show elements
    this.show();
    
    // iterate each element
    this.each( function(){
      var jThis =jQuery(this);
      
      jThis
        .data( 'viewportHorizAlign', null)
        .data( 'viewportVertAlign', null);
      
      // get dimensions
      var offs =jThis.offset();
      var pos =jThis.position();
      var width =jThis.outerWidth( true);
      var height =jThis.outerHeight( true);
      
      viewport.visibleLeft +=options.gap;
      viewport.visibleRight -=options.gap;
      viewport.visibleTop +=options.gap;
      viewport.visibleBottom -=options.gap;
      
      // reposition by x
      if( viewport.visibleLeft >offs.left) {
        jThis
          .css( 'left', pos.left +( viewport.visibleLeft -offs.left))
          .data( 'viewportHorizAlign', 'left');
        
      } else if( viewport.visibleRight <(offs.left +width)) {
        jThis
          .css( 'left', pos.left -( offs.left +width -viewport.visibleRight))
          .data( 'viewportHorizAlign', 'right');
      }
      
      // reposition by y
      if( viewport.visibleTop >offs.top) {
        jThis
          .css( 'top', pos.top +( viewport.visibleTop -offs.top))
          .data( 'viewportVertAlign', 'top');
        
      } else if( viewport.visibleBottom <(offs.top +height)) {
        jThis
          .css( 'top', pos.top -( offs.top +height -viewport.visibleBottom))
          .data( 'viewportVertAlign', 'bottom');
      }
    });
    
    if( options.hide)
      this.hide();
    
    return this;
  }
  
});