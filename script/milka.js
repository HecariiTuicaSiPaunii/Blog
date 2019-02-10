window.onload = function() {Init();}

function Init() {
  console.log ("Milka Templating Engine is at work!");
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
        newtxt += "<img class='avatar' src='/assets/images/profiles/" + author + ".png' title='" + author.charAt(0).toUpperCase() + author.slice(1) + "'/>";
      }
      newtxt += "</div>";
    }
    txt = txt.substring(fin);
    ind = txt.indexOf("<!--");
    if (ind != -1) {
      newtxt += txt.substring(fin, ind);
    } else {
      newtxt += txt;
      console.log(fin);
      console.log(txt);
    }
  }
  
  document.body.innerHTML = newtxt;
}
