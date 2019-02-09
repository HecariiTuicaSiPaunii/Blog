window.onscroll = function() {adjustNavbar()};
var navbar = document.getElementById("navbar");
var sticky = navbar.offsetTop;

function adjustNavbar() {
  if (window.pageYOffset >= sticky) {
    navbar.classList.add("sticky")
  } else {
    navbar.classList.remove("sticky");
  }
} 
