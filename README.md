Title: Our Journey Migrating Dashboards to the DHP Cloud (Part 1 of 2)

Intro: We are a DevOps metrics team. We have a bunch of dashboard catered towards different audience. For our inhouse built dashboards we needed a new home. That's
where DHP came into the picture. This story is about our onboarding experience of DHP. This migration not only aimed at technological advancement but also at maturing our DevOps practices, reducing operational toil, and fostering an environment where experimentation is the key to innovation.

Over an informal call saith Pete 'CTO DevOps Services — India Connect' we discussed our interest in collaborating with MSS by onboarding DHP to get a technology advancement. Andrea Madgwick connected us with Uma for a pilot of onboarding our services on DHP. Thanks a lot Pete and Andrea for the same.

Background: One of our key dashboards is called AgileLens. It's a React application powered by a PostgreSQL database and has three main parts:
The Data Collector: It's the workhorse, pulling data from our Qlik dashboards, reformatting and storing it in the database.
The API: This is the helpful middleman, fetching data from the database and delivering it when the user interface needs it. We could call this AgileLens Bridge
The User Interface: This is the friendly face of AgileLens, the part our team interacts with to get the insights they need.


I and Pranit Somne connected with Rajesh Shah, Uma, Rohit Nayyar and Robert Taylor to discuss our apps, the DHP platform and the roadmap for a pilot of DHP onboarding. Rajesh Shah suggested us to do a POC for migration of AgileLens on social platform within DHP. We timeboxed this POC to 3 weeks.



In my blog, I'll share our journey migrating this dashboard to DHP, what we learned, the challenges we faced, and why we think DHP was the right move. I also aim to express my gratitude to everyone who has played a role in DHP onboarding journey. While I'll do my best to thank each individual, I apologize in advance if I inadvertently miss anyone's name.

Migrating to DHP brought some expected hurdles, but nothing we couldn't overcome. Setting up our PostgreSQL database with PGMaker was a breeze, for prod we had to make a simple json file and create a PR. Thank you Justin Z Wu for the help with pgmaker2 . And let's not forget how much simpler secrets management, SSO and logging are compared to our old way of doing things. The streamlined process not only reduced the operational toil but also enhanced our ability to monitor and respond more dynamically to the needs.

Right now I am managing database DDL in code (create table, alter table, etc) in database setup. This feels not so clean and not so perfect. Maybe libraries like Prisma will help but these have their own set of limitations and serious performance costs.

The real tinkering came with our React app. The 'baseURI' issue was a pain, incorrectly forcing the app to look for assets as though apps were hosted at the root domain name on social.. Those who have tried, know the problem! But hey, a little Vite config magic and some environment tweaks resolved that. Not really happy with the current flow, we lost a major benefit of react that is live loading of changes. Right now we have to make changes to our code, build, run, check changes and repeat. Hopefully I will be able to find a way to get hot reload working soon. Also we've got those separate build scripts for SIT and UAT/Prod now, but it's a price we are willing to pay. It's a slower dev cycle right now, but I'm determined to find a way to bring hot reloading back. 

Converting CommonJS code to ECMAScript was a bit tedious but needed as our react supported ES and the boilerplate code we had was cjs.

Our alm-github repo worked seamlessly with DHP (as long as we remember to use 'master' instead of 'main'). The UAT release scheduler, while convenient, means longer waits compared to the instant gratification of our current server.

Collaborations and Discoveries
Felix L S Lam connected me with other team from DevOps Services that is experimenting on DHP and experts from MSS via a teams group! This helped us a lot in the long run, more in a story I will be writing up soon. These collaborations are vital as they allow us to experiment with new ideas and solutions in a supportive environment, ultimately leading to refined and more robust services.

Shoutout to Maitraya for patiently fielding so many of my questions and resolving issues – it made a huge difference.

After all the approvals and changes we were live on social UAT at the end of week 2 and we went live on social prod the following week. This marked the success of the first part of our POC, migrating one of our dashboard from ICP to DHP. 
Once we deployed AgileLens on social prod, we were able to properly analyse the benefits, the implications and the processes on DHP which the team was happy with. Post this we have started Part 2 of our POC where we host our own cranker router on our own domain (not social) and start migrating services one by one, story coming out on the same soon.

Room to Grow, Room to Contribute
More up-to-date documentation and sample apps would be awesome, and that's definitely an area where I'll try to help out. DAST scan support is crucial, and I'm aware that WAF scanning is on the way. Feature-wise, automating ICE updates and adding alm-jira support would streamline our workflow big time.

Honestly, my nitpicks are a testament to how solid the DHP platform is! We're already seeing significant benefits from the move.

Let me know if you'd like to know more of the team's challenges and technical solutions!

Special thanks to Rajesh Shah for guiding me throughout the process and to every individual who has contributed to DHP in some form or another. It is a tech solution that we as a bank are really proud of.

I highly recommend everyone to find out know more about the various DHP services and if they would help their team in any way.

![Uploading image.png…]()
