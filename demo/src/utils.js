export function locateKey(layout, id){
  for(var i = 0; i < layout.length; i++){
      var items = layout[i].items;
      for(var j = 0; j < items.length; j++){
          if(items[j].id === id){
              return [i, j]
          }
      }
  }
}


function setCaretPosition(elem, caretPos) {
  // var elem = document.getElementById(elemId);

  if(elem != null) {
      if(elem.createTextRange) {
          var range = elem.createTextRange();
          range.move('character', caretPos);
          range.select();
      }
      else {
          if(elem.selectionStart) {
              elem.focus();
              elem.setSelectionRange(caretPos, caretPos);
          }
          else
              elem.focus();
      }
  }
}

export function uuid(){
  return Math.random().toString(36).slice(5, 10)
}


export const handleDrag = (e, anchor, nextRows, pos, i, j, rowId) => {

  if(anchor === 'top' || anchor === 'bottom') {
    if(!e.altKey && (nextRows[i].items.length == 1) &&
        ((anchor === 'top'  && i === +pos[1]) || 
        (anchor === 'bottom' && i === parseInt(pos[1])+1) ||
        (anchor === 'bottom' && i === +pos[1]) )
    ){
        // console.log('noop', anchor, thing, pos)
    } else {
        if(e.altKey){
            // don't remove the old one, just make a copy
            var oldThing = Object.assign({}, nextRows[i].items[j], { id: this.makeSliceID() })
        }else{
            var oldThing = nextRows[i].items.splice(j, 1)[0];   
        }
        
        var newRow = { rowId, items: [ oldThing ] }
        if(anchor === 'top'){
            nextRows.splice(+pos[1], 0, newRow)
        }else{
            nextRows.splice(1 + parseInt(pos[1]), 0, newRow)
        }   
    }
  } else if(anchor === 'left' || anchor === 'right'){
      if(e.altKey){
          // don't remove the old one, just make a copy
          var oldThing = Object.assign({}, nextRows[i].items[j], { id: this.makeSliceID() })
      }else{
          // swap it with null
          var oldThing = nextRows[i].items.splice(j, 1, null)[0]; 
      }
      if(anchor === 'left'){
          nextRows[+pos[1]].items.splice(+pos[2], 0, oldThing)
      }else{
          nextRows[+pos[1]].items.splice(1 +parseInt(pos[2]), 0, oldThing)
      }
      // actually remove the thing
      nextRows[i].items = nextRows[i].items.filter(k => k !== null)
  }

  return [nextRows, oldThing]
}