import { FeatureType } from './../components/feature'

const FEATURES: FeatureType[] = [
  {
    currentDir: '/Users/termy/dev/termy',
    input: 'ls features',
    output: {
      type: 'pty',
      data: `\
- autocomplete
- fuzzy search
- bash, zsh & fish history
- tldr docs for commands
- backwards compatible
- keyboard-first
    `,
    },
  },
  {
    currentDir: '/Users/termy/dev/termy',
    input: 'edit readme.md',
    output: {
      type: 'api',
      data: `
# Termy

> An easy to use terminal built on web technologies
with a shell built for structured data

## Motivation

Terminals can be scary at first.
Termy aims to be a beginner-friendly,
easy to use tool for developers just starting out.
But we think more experienced developers will find it helpful too.

> ⚠️ **Termy is currently in alpha.**
Many features don't work yet.

#### License

<sup>
Termy is <a href="LICENSE">MIT licensed</a>.
</sup>      
    `,
    },
  },
  {
    currentDir: '/Users/termy/Downloads',
    input: 'theme #000',
    output: {
      type: 'api',
      data: '<h2>Theme set to #000</h2>',
    },
  },
  {
    currentDir: '/Users/termy',
    input: 'cowsay -f bong Join our Discord!',
    output: {
      type: 'pty',
      data: `\
    ___________________ 
    < Join our Discord! >
     ------------------- 
             \\
              \\
                ^__^ 
        _______/(oo)
    /\\/(       /(__)
       | W----|| |~|
       ||     || |~|  ~~
                 |~|  ~
                 |_| o
                 |#|/
                _+#+_
    `, // watch out for \ escaping new lines
    },
  },
]

export default FEATURES
