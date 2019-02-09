window.onscroll = function() {adjustNavbar()};
var navbar = document.getElementById("navbar");
var navbarsticky = navbar.offsetTop;

function adjustNavbar() {
  if (window.pageYOffset >= navbarsticky) {
    navbar.classList.add("sticky")
  } else {
    navbar.classList.remove("sticky");
  }
} 
