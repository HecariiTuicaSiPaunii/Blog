window.onscroll = function() {adjustNavbar()};
var navbar = document.getElementById("navbar");
var sticky = 0;

function loadsticky() {
  sticky = navbar.offsetTop;
}

function adjustNavbar() {
  if (window.pageYOffset >= sticky) {
    navbar.classList.add("sticky")
  } else {
    navbar.classList.remove("sticky");
  }
} 
