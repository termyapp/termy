import React from 'react'
import Layout from '../components/layout'
import Nav from '../components/nav'
import { Text, Flex } from '../components/design-system'

interface Props {}

const DocsPage: React.FC<Props> = props => {
  return (
    <Layout>
      <Nav />
      <Flex
        css={{
          alignItems: 'center',
          justifyContent: 'center',
          height: '80vh',
          textAlign: 'center',
        }}
      >
        <Text as="h1" size="9">
          Soon
        </Text>
      </Flex>
    </Layout>
  )
}

export default DocsPage
