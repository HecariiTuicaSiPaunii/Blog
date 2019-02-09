window.onload = function() {Init();}

function Init() {
  var txt = document.body.innerHTML;
  var ind = txt.indexOf("<!--");
  
  if (ind != -1)
    var newtxt = txt.substring(0, ind);
  else
    return;
  
  while (ind != -1) { //Parse
    var fin = txt.indexOf("-->") + 3;
    var directive = txt.substring(ind + 4, fin - 3);
    
    if (directive.substring(0, 7).toLowerCase() == "authors" || directive.substring(0, 6).toLowerCase() == "author") { //support multi-grammar
      if (directive.substring(0, 7).toLowerCase() == "authors")
        directive = directive.substring(9).split(',');
      else
        directive = directive.substring(8).split(',');
      
      newtxt += "<div style='align-items: center; display: flex; margin-bottom:15px;'>";
      newtxt += "Authors:";
      for (i = 0; i < directive.length; i++) {
        var author = directive[i].trim().toLowerCase();
        console.log (author);
        newtxt += "<img class='avatar' src='/assets/images/profiles/" + author + ".png' title='" + author.charAt(0).toUpperCase() + author.slice(1) + "'/>";
      }
      newtxt += "</div>";
    }
    ind = txt.indexOf("<!--");
    if (ind != -1) {
      console.log("Continuining " + fin + " " + ind);
      newtxt += txt.substring(fin, ind);
    } else {
      console.log("Continuining " + fin);
      newtxt += txt.substring(fin);
      console.log (txt.substring(fin));
    }
    txt = txt.substring(fin);
  }
  
  document.body.innerHTML = newtxt;
}
