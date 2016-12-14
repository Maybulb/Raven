# Raven
Only this and nothing more.

## About

Raven is a network to share poetry, and all the creative ideas that come with it. It includes social elements such as commenting and annotation, but is not intended to be a traditional social network– instead serving as a modern medium between poets and readers.

## Development

```bash
git clone https://github.com/ravenpoetry/raven

cd raven && npm i
node index.js
```

## API Routes/Map

Current roadmap, and will be updated in the future to support a public API which can be used by users, and will likely be used with our iOS app.

### `/ GET`
If the user is logged in, will bring them to the home page.

If the user is not logged in it will bring them to the main index with Raven's description, as well as login/register buttons.

### `GET /post`
Returns the page to post a poem. Redirects to login if the user is not authenticated.

### `POST /post`
Takes 2 parameters through body (`title`, `body`), and creates a `Poem` object with the following model.

```json
{
	title: String,
	body: String,
	author: ObjectID,
	preview: String
}
```


###  `GET /settings`
Returns the settings page, which includes logout and deactivate buttons, as well as a small form to change your username. Date of account creation is also listed. If user is not authenticated, redirect to login.

### `POST /settings`
Takes 1 parameter through body (`username`) to change the user's username.

### `GET /delete/:id`
Returns confirmation for asking author to delete poem with ID `:id`.

### `POST /delete/:id`
Deletes poem associated with `:id`. Requires author to be logged in. If user is unauthenticated, redirect to current user's profile.

### `GET /deactivate`
Returns confirmation for asking author to delete account with all poems.

### `POST /deactivate/:id`
Deletes author and all author's poems from database. Must be authenticated as author, or else redirected to `error.handlebars` with error message.

### `GET /edit/:id`
Returns the edit page for poem with ID `:id` for
authenticated user. If authenticated user is not author, redirect to login.

### `POST /edit/:id`
Takes 2 parameters through body (`title`, `content`). Updates poem with ID `:id` with these values. If an error occures, redirect to `error.handlebars` with error. If no error occurs, redirect to `/poem/:id`.

### `GET /logout`
Logs the authenticated user out.

### `GET /register`
Returns `register.handlebars` for registering.

### `POST /register`
Uses passport to take body parameters (`username`, `password`). `password` is hashed using bcrypt. User is stored in database and logged in if registering is successful. If not, user is redirected to `/register` with flash message displaying error.

### `GET /login`
Returns `login.handlebars` for logging in.

### `POST /login`
Uses passport to take body parameters (`username`, `password`). If user credentials are authenticated, log the user in and redirect to `/`. If an error occurs, redirect to `/login` and flash the error.

### `GET /poem/:id`
Displays the poem with ID `:id`. If poem does not exist, redirect to `error.handlebars` and display error.

### `GET /@:username`
Returns user's profile page, containing all poems/other content, if user/username exists. If authenticated user is not `:username`, also display follow button.


### `GET /@:username/followers`
Returns the list of followers for `:username`.

### `GET /me`
Shortcut redirect for authenticated user's profile.

### `POST /follow/@:username`
If user `:username` exists, is not currently being followed, and is not authenticated user, add `:username`'s ID to authenticated user's `relationships.following`, as well as add authenticated user's ID from `:username`'s `relationship.followers`.

### `POST /unfollow/@:username`
If user `:username` exists and authenticated user is currently following them, removes `:username`'s ID from authenticated user's `relationships.following`, as well as remove authenticated user's ID from `:username`'s `relationship.followers`.


## Developer Routes

Will be removed in the production version of Raven.

### `GET /users.json`
Returns all user objects in JSON.

```json
{
	_id: "58490820d25a14000485d091",
	created_at: "2016-12-08T07:13:36.901Z",
	username: "test",
	password: "$2a$10$vn0cUDytQEpZMq1uBsbSZeSCd9CMa",
	relationships: {
		followers: ["51223123123", "131231235"],
		following: ["134987138", "18937129837"],
	},
	__v: 0
}
```

### `GET /poems.json`
Returns all poem objects in JSON.

```json
{
	_id: "584908f1d10bb40004a134ea",
	created_at: "2016-12-08T07:17:05.576Z",
	title: "you say",
	content: "this is the poem. i dont know",
	author: "58490820d25a140f0485d091",
	preview: "this is the poem. / i dont know.,
	__v: 0
},
```


# LICENSE
[MLP 2.0](LICENSE)