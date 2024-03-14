Headline: Our Journey Migrating Dashboards to the DHP Cloud
We are a DevOps metrics team. Our main dashboard is a Qlik Sense dashboard on a Windows server, but we had a few other custom-built dashboards we needed a new home for. 
Over an informal call with Pete ‘CTO DevOps Services – India Connect’ we discussed our interest in DHP onboarding and Andrea Madgwick connected us with Uma for a pilot of onboarding our services on DHP. Thanks a lot Pete and Andrea for the same.
That's where DHP, our internal cloud platform, came into the picture.
Background: One of our key dashboards is called AgileLens. It's a React application powered by a PostgreSQL database and has three main parts:
The Data Collector: It's the workhorse, pulling data from our Qlik dashboards, reformatting and storing it in the database.
The API: This is the helpful middleman, fetching data from the database and delivering it when the user interface needs it. We could call this AgileLens Bridge
The User Interface: This is the friendly face of AgileLens, the part our team interacts with to get the insights they need.

My self and Pranit Somne connected with Rajesh Shah, Uma, Rohit, Robert Taylor to discuss our apps, DHP platform and the roadmap for the pilot. We came up with a three-week deadline for POC for migration of AgileLens to social.

In my blog, I'll share our journey migrating this dashboard to DHP, what we learned, the challenges we faced, and why we think DHP was the right move. I also aim to express my gratitude to everyone who has played a role in DHP onboarding journey. While I'll do my best to thank each individual, I apologize in advance if I inadvertently miss anyone's name. Your support and assistance have been invaluable, and I am truly thankful for every contribution along the way.

Migrating to DHP brought some expected hurdles, but nothing we couldn't overcome. Setting up our PostgreSQL database with PGMaker was a breeze, for SIT and UAT environments. We haven’t requested a prod db yet. Thank you Justin Z Wu for the pgmaker2 URLs and billing codes.  And let's not forget how much simpler SSO and logging are compared to our old way of doing things.

The real tinkering came with our React app.  That 'baseURL' issue was a pain, forcing the app to incorrectly look for assets. Those who have tried know the problem!  But hey, a little Vite config magic and some environment tweaks resolved that. Not really happy with the current flow, we lost a major benefit of react that is live loading of changes. Right now we have to make changes to our code, build, run, check changes and repeat. Hopefully I will be able to find a way to get hot reload working soon . Also we've got those separate build scripts for SIT and UAT/Prod now, but it's a price we are willing to pay. It's a slower dev cycle right now, but I'm determined to find a way to bring hot reloading back.

Converting CommonJS code to ECMAScript was a bit tedious but needed as our react supported ES and the boilerplate code we had was cjs.

Our GitHub repo worked seamlessly with DHP (as long as we remember to use 'master' instead of ‘main’). The UAT release scheduler, while convenient, means longer waits compared to the instant gratification of our current server. 

Collaborations and Discoveries
Felix L S Lam connected me with other team from DevOps Services that is experimenting on DHP and experts from MSS via a teams group!  Hope to collaborate more, I had an incidental learning as Robert Dann helped Farid by mentioning the secrets manager service.  

Shoutout to Maitraya for patiently fielding so many of my questions and resolving issues – it made a huge difference.

As of week 2, we are currently live on social UAT and plan to go to prod next week.

Room to Grow, Room to Contribute

I'd love to see smoother Symphony access (I'm still waiting!). More up-to-date documentation and sample apps would be awesome, and that's definitely an area where I'll try to help out. DAST scan support is crucial, and I'm aware that WAF scanning is on the way. Feature-wise, automating ICE updates and adding alm-jira support would streamline our workflow big time.

Honestly, my nitpicks are a testament to how solid the DHP platform is! We're already seeing significant benefits from the move.
Let me know if you'd like to know more of the team's challenges and technical solutions!

Special thanks to thank Rajesh Shah for guiding me throughout the process and to every individual who has contributed to DHP in some form or another. It is a tech solution that we as a bank are really prod of.
