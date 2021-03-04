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

There have been many shells (_bash, zsh, fish_) and many terminal emulators (_iTerm, Hyper, Windows Terminal_) created. But not one that tried to combine these two. [Termy](https://termy.app/) is a terminal with a built-in shell that tries to combine these two worlds and provide the user with a better experience.

<br/>

### Design

Termy is made up of cells. This user interface might be familiar to those who've used Jupyter Notebook before.

- Two things make up a cell: **the prompt and the output**. Input goes into the prompt and the output will be shown right below the prompt.

- You can **reuse cells**. After you're cell finished running, you can run it again with the same or a different command.

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
