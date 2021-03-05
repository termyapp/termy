<h1 align="center">Termy</h1>

<p align="center">
  A terminal with autocomplete
</p>

<p align="center">
  <a href="https://github.com/termyapp/Termy/releases"><strong>Download</strong></a> •
  <a href="http://discord.com/invite/tzrRhdZ"><strong>Discord</strong></a> •
  <a href="/contributing.md"><strong>Contributing</strong></a>
</p>

<br/>

<p align="center">
  <a href="https://termy.app" target="_blank"><img src="https://termy.app/screenshot.jpg" /></a>
</p>

<br/>

There have been many shells (_bash, zsh, fish_) and many terminal emulators (_iTerm, Hyper, Windows Terminal_) created. But not one that tried to combine these two. [Termy](https://termy.app/) is a terminal with a built-in shell that tries to combine these two worlds and provide the user with a better experience.

<br/>

### Concepts

Termy is made up of cells. This user interface might be familiar to those who've used Jupyter Notebook before.

- Two things make up a cell: **the prompt and the output**. Input goes into the prompt and the output will be shown right below the prompt.

- You can **reuse cells**. After your cell finished running, you can run it again with the same or a different command.

**Note**: to change directories, enter the path of the directory directly - without `cd`. There will be a fallback `cd` command in the future.

<br/>

### FAQ

#### How does this work?

Instead of loading your shell at start, Termy spawns a new "shell" every time you run a command.

##### Why?

To provide VSCode style autocompletions in the terminal we need know the current state of the shell. But since the shell handles everything internally, external programs don't know what the current state is. Termy goes around this issue by separating the input and output layer and holding its own state.

##### But this approach also has its downsides

Since Termy doesn't use the shell as intended, many of the built-in features will stop working (installed plugins, user config).

But don't worry: many oh-my-zsh plugins will be in Termy and soon you'll also be able to configure your settings!

#### What about performance?

Even without optimizations Termy is pretty fast at the moment. Now, I'm mainly focusing on the features that make Termy unique, but before the v1.0 release performance will improve a lot.

#### Does it have `TRUECOLOR`?

Yes.

<br/>

### Built-in commands

| Command |            Description             |
| ------- | :--------------------------------: |
| `edit`  |  Edit files using VSCode's editor  |
| `view`  | Lists all the files in a directory |
| `theme` |  Change theme (`#000` or `#fff`)   |

<br/>

### Keyboard Shortcuts

> **Note:** <kbd>Mod</kbd> stands for <kbd>⌘</kbd> on Mac and <kbd>Ctrl</kbd> on other platforms.

| Action                       |         Shortcut         |          When |
| ---------------------------- | :----------------------: | ------------: |
| Run Cell                     |     <kbd>Enter</kbd>     | Input Focused |
| Insert Suggestion & Run      |   <kbd>Mod+Enter</kbd>   | Input Focused |
| Accept or Trigger Suggestion |      <kbd>Tab</kbd>      | Input Focused |
| Run Cell                     |     <kbd>Mod+R</kbd>     |               |
| Stop Cell                    |     <kbd>Mod+S</kbd>     |               |
| New Cell                     |     <kbd>Mod+N</kbd>     |               |
| Remove Cell                  |     <kbd>Mod+W</kbd>     |               |
| New Tab                      |     <kbd>Mod+T</kbd>     |               |
| Remove Tab                   |  <kbd>Mod+Shift+W</kbd>  |               |
| Focus Next Cell              |     <kbd>Mod+J</kbd>     |               |
| Focus Previous Cell          |     <kbd>Mod+K</kbd>     |               |
| Focus Next Tab               |    <kbd>Mod+Tab</kbd>    |               |
| Focus Previous Tab           | <kbd>Mod+Shift+Tab</kbd> |               |
| Focus Tab (_1-9_)            |  <kbd>Mod+(_1-9_)</kbd>  |               |
| Focus Input                  |     <kbd>Mod+I</kbd>     |               |
| Focus Output                 |     <kbd>Mod+O</kbd>     |               |
