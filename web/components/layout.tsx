import React from 'react'
import { Div } from './design-system'
import Footer from './footer'
import Nav from './nav'

const Layout: React.FC = ({ children }) => (
  <Div
    css={{
      maxWidth: '1300px',
      margin: '0 auto',
      px: '$3',
      mb: '$4',

      mobile: {
        px: '$1',
      },
    }}
  >
    <Nav />
    {children}
    <Footer />
  </Div>
)

export default Layout
