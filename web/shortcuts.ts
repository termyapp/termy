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
      code: 'KeyA',
      shortcutText: 'A',
    },
    external: true,
    href: 'https://forms.gle/6hZtuTPamCtXLg8f8',
  },
}

export default shortcuts
