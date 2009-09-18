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
      
      jQuery(source).bind( evt, function( e, data){
        jQuery.event.trigger( e, null, target);
        
        // stop propagation
        e.stopPropagation();
      });
    }
  },
  
  // escape HTML code (convert special chars to HTML entities)
  escapeHTML: function( html) {
    var div =document.createElement( 'div');
    var text =document.createTextNode( html);
    div.appendChild( text);
    return div.innerHTML;
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
    
    if( !parent.parentNode)// element has no parent elements
      throw 'Invalid element selected for jQuery.getRelativeContainer.';
      
    if( !parent.parentNode.nodeName)// parent element has no node name
      throw 'Invalid element selected for jQuery.getRelativeContainer.';
    
    // BUG: IE sets parentNode for elements removed from DOM
    //  equal to their document. We workaround this by checking
    //  if parent node is document.
    if( parent.parentNode.getElementById)
      throw 'Invalid element selected for jQuery.getRelativeContainer.';

    while( parent.parentNode) {
      // reference parent node
      parent =parent.parentNode;
      
      // BODY is the topmost element, we don't go upper than BODY.
      if( parent.nodeName =='BODY' || jQuery(parent).css( 'position') !='static')
        return parent;
    }
    
    // invalid node passed in
    throw 'Invalid element selected for jQuery.getRelativeContainer.';
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
  },
  
  // hide element by moving ot outside the document canvas
  hideFromCanvas: function() {
    // obtain document width;
    var docWidth =$(document.body).outerWidth(true);
    
    // move all context elements outside the x axis.
    this
      .css( 'position', 'absolute')
      .each(function(){
        var jThis =jQuery(this);
        
        // why do we change only X axis, you may ask? This is needed
        //  to preserve the Y axis. For example, when you have moved
        //  checkbox outside the document canvas, and that checkbox
        //  has a <label> attached to it, when a label will be clicked,
        //  Opera and IE will scroll the screen to the Y axis of the
        //  checkbox. To avoid this, that's why we change only X axis.
        // Yes, if the document is wider than browser's window size,
        //  and checkbox is on the right side of the canvas, then
        //  screen will be scrolled to the left. But, it's rare situation
        //  when the scrolling will take place. I agree that this has
        //  to be fixed in the future.
        jThis.css( 'left', '-' +(docWidth +jThis.outerWidth(true)) +'px');
      });
  }
  
});