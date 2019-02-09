window.onload = function() {Init();}

function Init() {
  var txt = document.body.innerHTML;
  var ind = txt.indexOf("<!--");
  
  while (ind != -1) { //Parse
    var directive = txt.substring(ind + 4, txt.indexOf("-->"));
    
    if (directive.substring(0, 7).toLowerCase() == "authors") {
      directive = directive.substring(9).split(',');
      console.log(directive);
    }
    txt = txt.substring(ind + 4);
    var ind = txt.indexOf("<!--");
  }
}
