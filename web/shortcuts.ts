import { KeyProps } from './components/design-system'

type Shortcut = 'Slash' | 'KeyD' | 'KeyI' | 'KeyG' | 'KeyA'

const shortcuts: { [key in Shortcut]: KeyProps } = {
  Slash: {
    shortcut: {
      code: 'Slash',
      shortcutText: '/',
    },
    href: '/',
  },
  KeyD: {
    shortcut: {
      code: 'KeyD',
      shortcutText: 'D',
    },
    href: '/docs',
  },
  KeyI: {
    shortcut: {
      code: 'KeyI',
      shortcutText: 'I',
    },
    external: true,
    href: 'http://discord.com/invite/tzrRhdZ',
  },
  KeyG: {
    shortcut: {
      code: 'KeyG',
      shortcutText: 'G',
    },
    external: true,
    href: 'https://github.com/termyapp/termy',
  },
  KeyA: {
    shortcut: {
      code: 'KeyO',
      shortcutText: 'O',
    },
    external: true,
    href:
      'https://github.com/termyapp/termy/releases/download/untagged-d71f568835ce574dd09f/termy-0.1.0.dmg',
  },
}

export default shortcuts
