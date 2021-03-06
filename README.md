# fetch-node-wrapper
Node API wrapper around [fetch (GitHub downloader CLI)](https://github.com/gruntwork-io/fetch).

From fetch README:
> fetch makes it easy to download files, folders, or release assets from a specific commit, branch, or tag of 
a public or private GitHub repo.

Current version supports all features available in [fetch v0.1.1](https://github.com/gruntwork-io/fetch/tree/v0.1.1)


#### Quick examples

Download folder `/baz` from tag `0.1.3` of a GitHub repo and save it to `/tmp/baz`:

```js
fetch.fetch({"repo": "https://github.com/foo/bar", "tag": "0.1.3", "source-path": "/baz"}, "/tmp/baz", callback);
```

Download the release asset `foo.exe` from release `0.1.5` and save it to `/tmp`:

```js
fetch.fetch({"repo": "https://github.com/foo/bar", "tag": "0.1.5", "release-asset": "foo.exe"}, "/tmp", callback);
```

See more examples in the [Examples section](#examples).

## Installation

The fetch binary for your system will be automatically downloaded from the
[fetch GitHub Releases](https://github.com/gruntwork-io/fetch/releases).

**NOTE: If your platform isn't supported by fetch, you will get an error during installation.**

## Usage

```js
const fetch = require('fetch-node-wrapper');
```

## API

### `fetch.fetch(<options>, <local_download_path>, [callback])`
Download a repository asynchronously given `options` to `local_download_path`.

### `fetch.fetchSync(<options>, <local_download_path>)`
Same as `fetch.fetch` but downloads synchronously. Returns stdout from the command.


## Options

Uses the options for [fetch v0.1.1](https://github.com/gruntwork-io/fetch/tree/v0.1.1).
Options may optionally be prefixed with 

- `repo` (**Required**): The fully qualified URL of the GitHub repo to download from (e.g. https://github.com/foo/bar).
- `tag` (**Optional**): The git tag to download. Can be a specific tag or a [Tag Constraint
  Expression](#tag-constraint-expressions).
- `branch` (**Optional**): The git branch from which to download; the latest commit in the branch will be used. If
  specified, will override `tag`.
- `commit` (**Optional**): The SHA of a git commit to download. If specified, will override `branch` and `tag`.
- `source-path` (**Optional**): The source path to download from the repo (e.g. `"source-path": "/folder"` will download
  the `/folder` path and all files below it). By default, all files are downloaded from the repo unless `source-path`
  or `release-asset` is specified. This option can be specified more than once.
- `release-asset` (**Optional**): The name of a release asset that is a binary uploaded to a [GitHub
  Release](https://help.github.com/articles/creating-releases/)to download. This option can be specified more than
  once. It only works with the `tag` option.
- `github-oauth-token` (**Optional**): A [GitHub Personal Access
  Token](https://help.github.com/articles/creating-an-access-token-for-command-line-use/). Required if you're
  downloading from private GitHub repos. **NOTE:** fetch will also look for this token using the `GITHUB_OAUTH_TOKEN`
  environment variable, which we recommend using instead of the command line option to ensure the token doesn't get
  saved in bash history.
  
Options may be optionally prefixed with `--`:
```js
fetch.fetch({"repo": "https://github.com/foo/bar"}, "/foo");
// is identical to doing:
fetch.fetch({"--repo": "https://github.com/foo/bar"}, "/foo");
```

For options that can be specified more than once, provide them as an array or a comma-separated list, as such:
```js
fetch.fetch({"repo": "https://github.com/foo/bar", "source-path": "/folder,/foo"}, "/foo");
// is identical to doing:
fetch.fetch({"repo": "https://github.com/foo/bar", "source-path": ["/folder", "/foo"]}, "/foo");
```

The supported arguments are:

- `<local_download_path>` (**Required**): The local path where all files should be downloaded (e.g. `/tmp`).

Run `fetch.fetch({'help': ''})'` to see more information about the flags.

#### Tag Constraint Expressions

fetch assumes that a repo's tags are in the format `vX.Y.Z` or `X.Y.Z` to support Semantic Versioning parsing.
This allows you to specify a [Tag Constraint Expression](#tag-constraint-expressions) to do things like 
"get the latest non-breaking version" of this repo. Note that fetch also allows downloading a specific tag
not in SemVer format.

The value of `tag` can be expressed using any operators defined in [hashicorp/go-version](https://github.com/hashicorp/go-version).

Specifically, this includes:

| Tag Constraint Pattern | Meaning                                  |
| -------------------------- | ---------------------------------------- |
| `1.0.7`                    | Exactly version `1.0.7`                  |
| `=1.0.7`                   | Exactly version `1.0.7`                  |
| `!=1.0.7`                  | The latest version as long as that version is not `1.0.7` |
| `>1.0.7`                   | The latest version greater than `1.0.7`  |
| `<1.0.7`                   | The latest version that's less than `1.0.7` |
| `>=1.0.7`                  | The latest version greater than or equal to `1.0.7` |
| `<=1.0.7`                  | The latest version that's less than or equal to `1.0.7` |
| `~>1.0.7`                  | The latest version that is greater than `1.0.7` and less than `1.1.0` |
| `~>1.0`                    | The latest version that is greater than `1.0` and less than `2.0` |

## Examples

#### Usage Example 1

Download `/modules/foo/bar.sh` from a GitHub release where the tag is the latest version of `0.1.x` but at least `0.1.5`, and save it to `/tmp/bar`:

```js
fetch.fetch({"repo": "https://github.com/foo/bar", "tag": "~>0.1.5", "source-path": "/modules/foo/bar.sh"}, "/tmp/bar");
```

#### Usage Example 2

Download all files in `/modules/foo` from a GitHub release where the tag is exactly `0.1.5`, and save them to `/tmp`:

```js
fetch.fetch({"repo": "https://github.com/foo/bar", "tag": "0.1.5", "source-path": "/modules/foo"}, "/tmp");
```

#### Usage Example 3

Download all files from a private GitHub repo using the GitHUb oAuth Token `123`. Get the release whose tag is exactly `0.1.5`, and save the files to `/tmp`:

```js
process.env.GITHUB_OAUTH_TOKEN = 123;

fetch.fetch({"repo": "https://github.com/foo/bar", "tag": "0.1.5"}, "/tmp");

// identical, but not suggested:
fetch.fetch({"repo": "https://github.com/foo/bar", "tag": "0.1.5", "github-oauth-token": 123}, "/tmp");
```


#### Usage Example 4

Download all files from the latest commit on the `sample-branch` branch, and save them to `/tmp`:

```js
fetch.fetch({"repo": "https://github.com/foo/bar", "branch": "sample-branch"}, "/tmp");
```

#### Usage Example 5

Download all files from the git commit `f32a08313e30f116a1f5617b8b68c11f1c1dbb61`, and save them to `/tmp`:

```js
fetch.fetch({"repo": "https://github.com/foo/bar", "commit": "f32a08313e30f116a1f5617b8b68c11f1c1dbb61"}, "/tmp");
```

#### Usage Example 6

Download the release asset `foo.exe` from a GitHub release where the tag is exactly `0.1.5`, and save it to `/tmp`:

```js
fetch.fetch({"repo": "https://github.com/foo/bar", "tag": "0.1.5", "release-asset": "foo.exe"}, "/tmp");
```