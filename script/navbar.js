window.onscroll = function() {adjustNavbar()};
var navbar = document.getElementById("navbar");

function adjustNavbar() {
  if (window.pageYOffset >= 177) { //Hardcoded Variables FTW!
    navbar.classList.add("sticky")
  } else {
    navbar.classList.remove("sticky");
  }
} 
