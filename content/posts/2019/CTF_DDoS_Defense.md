# How we defended our CTF Competition against a DDoS Attack.

<!--Authors: Milkdrop-->

Hello, as you may know our team organized a CTF Competition last year ([X-MAS CTF 2018](https://ctftime.org/event/724)). Plenty of preparation time went into it: We had to design the problems and we had to set up the right infrastructure (Choosing a good [VPS](https://www.vultr.com/) and a good CTF [Platform](https://ctfd.io/)).

Then, we had to make sure that the servers would resist under the heavy load that would unfold once the CTF starts (~1000 teams were registered before the competition started).

Therefore, extensive testing started. We took our low-duty python flooding scripts, and we started flooding the website with ~5.000 requests per second. The server went down, and this is where the first round of improvements begun:

- First up, if you want to support a heavier load on a smaller server (ours had only 4GB of RAM + a dual-core CPU), you should use the **nginx** web server. It is ages ahead Apache when it comes to [memory consumption](https://1.bp.blogspot.com/-UI_f8DFaXFw/VrmtmDhN_0I/AAAAAAAAALE/qF3-PeeFET0/s1600/ram%2Bnginx.png), and it supports [@32.000 requests per second](/assets/images/posts/nginxRPS.jpg), for each CPU core. In short, Nginx is pretty darn good.
- Secondly, in our case our biggest bottleneck was the CTFd platform itself. We might have missed something, but on our install (and we have seen this problem appear in other CTFs too), the **/socket.io** endpoint was hanging all our gunicorn workers. We saw that /socket.io was generating a lot of traffic, and it wasn't vital for the site to function well, so we decided to **404** any request to /socket.io from nginx directly (We know it's a pretty extreme approach, but it was the only silver bullet we knew for our site's speed).

Once we blocked **/socket.io**, the site was functioning properly, but there was still room for improvement:
- We then followed the general advice and we used nginx's **Load Balancing** feature. We set up _2 * Core_Count + 1_ internal gunicorn servers on different ports (For a dual-core system, that comes up as 5 different internal mini-servers), and we instructed nginx to load balance on them.
- Then, we swapped the original gunicorn worker type with **gevent**, which gave us the best results speed-wise. 
- Another small yet critical improvement is **limiting the request per IP limit to 5/second**. This essentially stops all the single-PC DoSers right in their tracks!

After all these tweaks and fixes, our server was supporting our small python floods without breaking a sweat. It had a theoretical limit of ~60.000 Requests Per Second, and thus we knew that it would be able to host all the participants on the D-Day, and so it was.

The server didn't lag or slow down for a moment, everything was snappy, and ~ **1500** flags (both right and wrong) were submitted in the first **15 minutes** of the competition. The challenges were working fine, and it seemed that it'd be smooth sailing from then on.

## The DDoS

After a good saturday of hacking and doing admin work, everything seemed alright. The competition was alive and well and people were having fun.

However, this all took an unexpected turn when we received multiple messages from people asking if the site is down. We checked the site, and indeed, it was down. SSH wasn't responding, and we didn't have any response from the server whatsoever. This is when we realized we were being DDoSed (or DoSed, in this case).

The good thing is that after about 2 hours, the attacker got bored, and the site came back online. Judging by the amount of new accounts/teams created, we realized that they spammed the site with registration requests. This is a pretty costly operation (updating the database, etc), and thus the site went down.

Here's when we added another vital improvement, that anyone should take into consideration when designing a site:

- We added a captcha for costly database operations (Registration, in our case). Luckily there was a [readily available plugin](https://github.com/tamuctf/ctfd-recaptcha-plugin/tree/e21857f31c4dcb6c6ea5d9ef75eaaf5d582dc84b) for CTFd, and this made the implementation really quick.

We then unpaused the competition and everything seemed to be normal. There shouldn't be any more interruptions, and the competition would be smooth sailing from then on, right? Well, not really.

You see, on the Internet there will always be someone wanting to take you down. This is why you should prepare your site for the fiercest attacks, if you want to see it up for the foreseeable future. [Here is a pretty neat talk from Cloudflare](https://www.youtube.com/watch?v=kjs3KZtFeTM) talking about DDoS attack defense.

Taking that into account, the next day we were heavily DDoSed. This time, a real distributed attack, from a [12K device botnet](/assets/images/posts/AttackerIMG.png) (Luckily the attackers were kind enough to provide us a screenshot of their C&C program. How considerate!).

Each device was sending ~42K requests per second, totalling to about **500K requests per second**, a much higher RPS than our theoretical limit. We saw that afterwards another similar botnet joined in, pumping ~ **1 Million** requests per second into our platform. This was a pretty serious attack, no longer a simple Registration-spamming python script, we are talking medium-sized botnets here.

How we defended from this? Well, we did all we could:

- We changed the original servers with two new ones, one for the platform itself, and one for the challenges. The platform server was routed directly through cloudflare, and its original IP wasn't disclosed. We set CloudFlare's included DDoS protection on max.
- Then, we set iptables rules to block all UDP Traffic on both challenge/platform servers, to further defend from UDP-based attacks.
- Another important step is to set **hard resource limits** on each challenge docker, at ~100MB Max RAM Usage / challenge and 0.1% Max CPU Usage. This way, if a challenge gets totalled, all the others will remain alive. This effectively forces the attacker to divide his botnet for all the challenges, thus weakening his attack power by a factor of ~10-20. If his RPS/Chall drops below 100K, the botnet might be rendered ineffective.
- We made our best choices for each challenge docker too. The [Alpine](https://docs.docker.com/samples/library/alpine/) Docker image is really lightweight, and paired with nginx (+a 5 Requests/IP limit config), it can take up quite a punch.
- To make sure, we have employed our VPS's DDoS protection as an extra layer of defense for the challenge server, although we have seen that it didn't resist well when it wasn't paired with cloudflare / other extra DDoS defenses.

With all these new configs, the servers remained alive and well for the rest of the competition, albeit a bit fuzzy while we tweaked the configs to better fit each challenge environment. We have seen several various smaller attacks in the following days, but they all barely _scratched the paint_ of the server.

Another small thing we learned from this experience is that mischevious competitors will always find ways to break your challenges. If there is even the smallest permission overlooked, people will exploit that to take away / modify the challenge flag, or they will render the challenge unusable. Hence, as a rule of thumb, you should:

- Make ROOT the owner of every file and folder of the challenge (and make sure the player himself isn't root, of course). Set the *t* bit to all folders that players have write access to, and place a .nomedia file owned by ROOT in those folders, in order to make sure that they won't delete the folder.

With this last simple security check, you can be sure that your challenge is safe and sound from interfering players.
