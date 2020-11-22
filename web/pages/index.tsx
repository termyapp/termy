import React from 'react'
import { Button, Div, Grid, Key, Text } from '../components/design-system'
import Feature from '../components/feature'
import Layout from '../components/layout'
import FEATURES from '../lib/features'
import { styled } from '../stitches.config'

const IndexPage = () => {
  return (
    <Layout>
      <Text
        as="h1"
        css={{
          fontSize: '$4xl',
          mt: '$32',
          textAlign: 'center',

          mobile: {
            mt: '$16',
          },
        }}
      >
        A terminal with autocomplete
      </Text>

      <Demo src="/demo.gif" alt="Demo Gif" />

      <Div
        css={{
          my: '$32',

          mobile: {
            display: 'none',
          },
        }}
      >
        <Text
          as="p"
          css={{
            color: '$gray700',
            fontSize: '$xl',
            textAlign: 'center',
          }}
        >
          Press{' '}
          <Key
            shortcut="d"
            href="https://github.com/termyapp/Termy/releases/download/v0.1.3/Termy-0.1.3.dmg"
            external
          >
            D
          </Key>{' '}
          to{' '}
          <Button
            as="a"
            href="https://github.com/termyapp/Termy/releases/download/v0.1.3/Termy-0.1.3.dmg"
          >
            Download
          </Button>
          for Mac
        </Text>
      </Div>

      <Grid
        css={{
          gap: '$8',

          mobile: {
            gap: '$4',
          },
        }}
      >
        {FEATURES.map((feature, i) => (
          <Feature key={i} {...feature} />
        ))}
      </Grid>
    </Layout>
  )
}

const Demo = styled.img({
  display: 'block',
  width: '60%',
  mx: 'auto',
  my: '$10',
  br: '$3',
  backgroundColor: '$backgroundColor',
  boxShadow: '$2xl',
  borderRadius: '$lg',
  p: '-$2',

  mobile: {
    width: '100%',
  },
})

export default IndexPage
