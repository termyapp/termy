import { KeyProps } from './components/design-system'

const shortcuts: { [key: string]: KeyProps } = {
  DOCS: {
    shortcut: {
      code: 'KeyD',
      shortcutText: 'D',
    },
    href: '/docs',
  },
  COMMUNITY: {
    shortcut: {
      code: 'KeyC',
      shortcutText: 'C',
    },
    href: '/community',
  },
  GITHUB: {
    shortcut: {
      code: 'KeyG',
      shortcutText: 'G',
    },
    external: true,
    href: 'https://github.com/termyapp/termy',
  },
  GET_ACCESS: {
    shortcut: {
      code: 'KeyA',
      shortcutText: 'A',
    },
    external: true,
    href: 'https://forms.gle/6hZtuTPamCtXLg8f8',
  },
}

export default shortcuts
