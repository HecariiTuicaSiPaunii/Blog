---
layout: HTB
---

<div id="output">
<h1 style="text-align:center">The file you are trying to view is <div class="redtxt">🔒 Encrypted 🔒</div></h1>
<p style="font-size:18px; text-align:center; color: #aeaeae">
    This file reveals solutions for either active HackTheBox Machines or CTF Challenges.
    In order to view this encrypted content, you will need to use the flag of the challenge.
    For HackTheBox Machine Write-Ups, the flag is in <b>root.txt</b>
</p>
<!--Decryption brought by https://github.com/jbt/markdown-editor-->

<p style="font-size:24px; text-align:center">
    Decryption Key:
    <input type="text" id="decryptionKey" value="0123456789abcdef0123456789abcdef" style="display: inline; width:240px; background:#111; border:1px solid #eaeaea; color:#B5E853">
    <input style="display: inline;" type="submit" value="Decrypt" onclick="Decrypt()">
</p>

<p id="status" style="text-align:center">
	
</p>

</div>
<script>
	function Decrypt() {
		var keytxt = document.getElementById("decryptionKey").value;
		if (keytxt.length != 32) {
			alert("Key Length must be 32 Characters.");
			return;
		}
		
		var key = [];
		for (i = 0; i < keytxt.length; i++)
			key.push(keytxt.charCodeAt(i));
			
		var link = window.location.href;
		var indx = link.indexOf("?file=");
		if (indx == -1) {
			alert("Nothing to decrypt!");
			return;
		}
		var file = link.substring(indx + 6);
		
		var xhr = new XMLHttpRequest();
		xhr.open("GET", file, false);
		document.getElementById("status").innerHTML = "Downloading File...";
		xhr.send(null);
		if (xhr.status != 200) {
			alert("File not found!");
			document.getElementById("status").innerHTML = "";
			return;
		}
		var resp = xhr.responseText;
		
		document.getElementById("status").innerHTML = "Decrypting...";
		
		var txt = aesjs.utils.hex.toBytes(resp);
		var CryptText = DecryptCTR(txt, key);
		console.log (CryptText);
		
		if (CryptText.substring(0, 23) != "<!--Valid Decryption-->") {
			alert("Invalid Key.");
			document.getElementById("status").innerHTML = "";
		} else {
			document.getElementById("output").innerHTML = CryptText;
		}
	}
</script>
