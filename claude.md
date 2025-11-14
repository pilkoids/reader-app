I want to create an app that will allow readers to share notes about a specific thing they have read with other readers. For example:

User A logs into the app, opens whatever they are reading in the app - this could be a pdf, ebook, online article, screenshot of text, but for the purposes of this example we will use - and then highlights a specific piece of text that they would like to leave a comment on. They leave their comment, and it appears as an icon on the side of the page (the users avatar for e.g.).

User B is subscribed to User A's comments. User Blogs into the app, opens whatever they are reading in the app - this happens to be the same material that User A left a comment on. In the margin of the material that is opened, User B should see User A's comment in the form of their avatar. Once User B clicks on this avatar a popup modal appears with User A's comment.

Instead of saving pdfs or a file of whatever the reader is reading, I want to store the entire text of what the person is reading into memory - does this violate any copyright?

Eventually, I want to source comments from social media. For e.g.:
User A posts on X (tagging a bot): "Crime and Punishment - chapter 2 - 'And then I stabbed the old hag' - omg Raskolnikov!!!"
The bot gets alerted by this post because it's tagged, then parses the data in the post into meaningful data to be consumed by the reader app described above so that it may show up as a comment. In this case, the reader app knows to look for a specific piece of text ("And then I stabbed the old hag") to highlight and tag a comment ("omg Raskolnikov!!!") to. We will assume for now that the user A will always post their comment in this format.

Regarding the parsing of social media data, for now i'm going to be very strict and force users to follow a strict pattern if they want their comments parsed - they have to provide the title, page, paragraph. For now we can just highlight the entire paragraph being referenced to the reading user . from there its easy to figure out what the comment means within that context

Lets create a database to source these social media comments for now. It will contain dummy comments to be linked to texts. For now its just a single table:
{
    id: varchar,
    social_media_platform: varchar (e.g. X, facebook),
    social_media_user_id: varchar,
    reader_id: varchar (this will be a FK that matches with this users id on our platform),
    comment: varchar (entire text of comment),
    timestamp: datetime
}

Regarding the front end UI, I have a very specific vision for it:

User logs in, shown the main dashboard screen which consists of two parts - a left pane (20%) and a right pane (80%). 
The left pane will have all the main functions of the app and account handling links - a collapsible menu. This will also contain a link to "open" a title (pdf, ebub, web link)
The right pane will contain the text of the title that the user opens, along with controls for navigating pages.
The right pane will have a control bar at the top with menu items to show/hide comments on the current page.
When a text is opened, the app will check to see if there are any comments on it left by others.
If there is a comment, show it on the right of the text, closest as possible to the text that the comment is for, in the form of the commenters avatar. When the user clicks the avatar, the comment comes up in a popup modal.
The right pane can be maximized.


How It Works

  User A:
  1. Opens their legally owned PDF in your app
  2. App extracts text from PDF temporarily (in memory is fine)
  3. User highlights text and comments
  4. App stores: position data + comment + text fingerprint
  5. Text is discarded when user closes the document

  User B:
  1. Opens their own legal copy of same work
  2. App extracts text temporarily
  3. App matches fingerprints to find comment positions
  4. Displays User A's comment at matched location
  5. Text is discarded when done

User provides content → App processes it temporarily → Stores only metadata/comments