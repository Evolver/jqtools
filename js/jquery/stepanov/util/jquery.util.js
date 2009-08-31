/**
  * Author: Dmitry Stepanov
  * E-Mail: dmitrij@stepanov.lv
  * URL: http://www.stepanov.lv
  */

if( typeof jQuery =='undefined')
  throw 'jQuery library is required';
  
jQuery.extend({
  
  // library version
  utilVersion: 1.0,
  
  // unique id counter
  _uniqueId: 0,
  
  // get unique id
  uniqueId: function() {
    return 'jqUnidentified_' +(++jQuery._uniqueId);
  },
  
  // debug output stub
  debug: function( msg) {
  },
  
  // transfer events from object to object
  transferEvents: function( /* array */ whichEvents, /* DOMElement */ source, /* DOMElement */ target) {
      
    for( var i =0; i < whichEvents.length; ++i) {
      var evt =whichEvents[i];
      
      jQuery(source).bind( evt, function( e){
        jQuery(target).trigger( jQuery.Event( e.type));
        
        e.stopPropagation();
      });
    }
  }
  
});

jQuery.fn.extend({
  
  // get unique id for selected object
  uniqueId: function() {
    if( this.size() ==0)
      throw 'No objects selected';
    
    var elem =this.get( 0);
    var ret =elem.getAttribute( 'id');
    if( ret ===null) {
      ret =jQuery.uniqueId();
      elem.setAttribute( 'id', ret);
    }
    
    // return element id
    return ret;
  },
  
  // check if jQuery object contains only one element
  assertSingle: function() {
    if( this.length ==0)
      throw 'Single object must be selected. Currently - none.';
    if( this.length >1)
      throw 'Single object must be selected. Currently - ' +this.length +'.';
  }
  
});