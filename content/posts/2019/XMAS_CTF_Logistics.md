# X-MAS CTF 2019 Logistics

<!--Authors: Milkdrop-->

Hello everyone! We are currently wrapping up the [2019 edition of X-MAS CTF](https://ctftime.org/event/926). This year we have received overwhelmingly positive feedback, and people seemed to have a lot of fun with the challenges that we have prepared. Amidst the ending preparations, I am taking a moment to talk about the whole logistics of the event, the things we've learned and what we could improve upon.

## The network load

This year we have decided to double down with our competition by allocating a lot more time to server setup, challenge making and publicity. Thus, we already had about 2000 teams registered before the competition even started (which is about double the amount of last year's edition). We have learned a lot since last year's [DDoS attack](https://htsp.ro/content/posts/2019/CTF_DDoS_Defense.html), and we have prepared the servers to efortlessly withstand a constant load of a few hundred concurrent requests, with plenty of fallbacks in case we would actually get attacked again.

The actual competition load was about as follows:
- 250,000 daily requests for the entire week, peaking up at 700,000 requests during the week-end. Cloudflare has helped us a lot in caching and speeding up the platform considerably:

![Cloudflare](/assets/images/posts/X-MAS_CTF_Logistics/cloudflare.png)
