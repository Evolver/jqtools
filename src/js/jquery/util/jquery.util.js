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
  
  // transfer events from object to object
  transferEvents: function( /* array */ whichEvents, /* DOMElement */ source, /* DOMElement */ target) {
      
    for( var i =0; i < whichEvents.length; ++i) {
      var evt =whichEvents[i];
      
      jQuery(source).bind( evt, function( e){
        jQuery(target).trigger( jQuery.Event( e.type));
        
        e.stopPropagation();
      });
    }
  },

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
  },
  
  // bubble event to parent elements
  bubbleEvent: function( e) {
    // trigger event on all parent elements
    this.each(function(){
      if( !this.parentNode)
        return;
       
      // instantiate new event
      var event =jQuery.Event( e.type);
      event.target =e.target;
      event.data =e.data;
      event.relatedTarget =e.relatedTarget;
      event.currentTarget =e.currentTarget;
      event.pageX =e.pageX;
      event.pageY =e.pageY;
      event.result =e.result;
      event.timeStamp =e.timeStamp;
        
      // trigger event
      jQuery(this.parentNode).trigger( event);
    });
    
    // stop event propagation
    e.stopPropagation();
  },
  
  // get relative container
  getRelativeContainer: function() {
    this.assertSingle();
    
    var parent =this.get(0);

    while( parent.parentNode) {
      parent =parent.parentNode;
      
      try {
        if( parent.nodeName =='BODY' || jQuery(parent).css( 'position') !='static')
          return parent;
          
      } catch( e) {
        return null;
      }
    }
    
    // no relative element found
    return null;
  },
  
  // see if element is descendant of specified element
  isDescendantOf: function( element, allowEquality) {
    this.assertSingle();
    
    if( allowEquality ===undefined)
      allowEquality =false;
    
    var node =this.get(0);
    
    if( allowEquality && node ==element)
      return true;
    
    try {
      while( node.parentNode) {
        node =node.parentNode;
        
        if( node ==element)
          return true;// is descendant
      }
    } catch( e) {
      // assume failure
      return false;
    }
    
    // did not found
    return false;
  }
  
});