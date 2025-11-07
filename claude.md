I want to brainstorm an app idea that i've described below. Bring up any issues you may have with the idea (are there any issues with copyright?) and give me some suggestions for system architecture. do not build anything yet.
----------------------------------------------------------------------------------------------------------------------------------------

I want to create an app that will allow readers to share notes about a specific thing they have read with other readers. For example:

User A logs into the app, opens whatever they are reading in the app - this could be a pdf, ebook, online article, screenshot of text, but for the purposes of this example we will use - and then highlights a specific piece of text that they would like to leave a comment on. They leave their comment, and it appears as an icon on the side of the page (the users avatar for e.g.).

User B is subscribed to User A's comments. User Blogs into the app, opens whatever they are reading in the app - this happens to be the same material that User A left a comment on. In the margin of the material that is opened, User B should see User A's comment in the form of their avatar. Once User B clicks on this avatar a popup modal appears with User A's comment.

Instead of saving pdfs or a file of whatever the reader is reading, I want to store the entire text of what the person is reading into memory - does this violate any copyright?

Eventually, I want to source comments from social media. For e.g.:
User A posts on X (tagging a bot): "Crime and Punishment - chapter 2 - 'And then I stabbed the old hag' - omg Raskolnikov!!!"
The bot gets alerted by this post because it's tagged, then parses the data in the post into meaningful data to be consumed by the reader app described above so that it may show up as a comment. In this case, the reader app knows to look for a specific piece of text ("And then I stabbed the old hag") to highlight and tag a comment ("omg Raskolnikov!!!") to. We will assume for now that the user A will always post their comment in this format.


Regarding the parsing of social media data, for now i'm going to be very strict and force users to follow a strict pattern if they want their comments parsed - they have to provide the title, page, paragraph. For now we can just highlight the entire paragraph being referenced to the reading user . from there its easy to figure out what the comment means within that context