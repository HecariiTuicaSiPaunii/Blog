window.onscroll = function() {adjustNavbar()};
window.onresize = function() {loadsticky()};
window.onload = function() {loadsticky()};
var header = document.getElementById("header");
var navbar = document.getElementById("navbar");
var sticky = 0;
function loadsticky() {sticky = header.offsetHeight;}
function adjustNavbar() {
  if (window.pageYOffset >= sticky && window.innerWidth > 670)
    navbar.classList.add("sticky")
  else
    navbar.classList.remove("sticky");
}
