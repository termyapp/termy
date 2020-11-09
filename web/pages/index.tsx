import Head from 'next/head'
import React from 'react'
import Layout from '../components/layout'
import Nav from '../components/nav'
import Footer from '../components/footer'
import { Grid, Button, Text, Key, Box } from '../components/design-system'
import { styled } from '../stitches.config'

const IndexPage = () => {
  return (
    <Layout>
      <Nav />
      <Head>
        <title>Termy</title>
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
      </Head>
      <Box
        css={{
          my: '$9',
          textAlign: 'center',
          '& > *': {
            mt: '$6',
          },
        }}
      >
        <Text as="h1" size="9" css={{ lineHeight: 0.9 }}>
          A terminal for the
          <br />
          <mark
            style={{
              background:
                'linear-gradient(to right, rgba(0,220,255,1) 0%, rgba(180,120,255,1) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            21st
          </mark>{' '}
          century
        </Text>

        <Demo src="/demo3.gif" alt="Demo Gif" />

        <Text
          as="p"
          size="7"
          css={{
            color: '$gray600',
          }}
        >
          Pretty cool, huh?
        </Text>
      </Box>
      <Box
        css={{
          position: 'absolute',
          width: '100%',
          height: '100vh',
          top: 0,
          left: 0,
          zIndex: -1,

          display: 'none',
          bp2: {
            display: 'initial',
          },
        }}
      >
        <Grid
          css={{
            position: 'absolute',
            bottom: 0,
            left: 'calc((100vw - 1000px) / 2 + 1000px)',

            gridTemplateColumns: 'auto auto auto auto',
            gap: '$2',
          }}
        >
          <Arrow>↓</Arrow>
          <Key
            code="KeyJ"
            fn={() =>
              window.scrollBy({ left: 0, top: 200, behavior: 'smooth' })
            }
          >
            J
          </Key>
          <Arrow>↑</Arrow>
          <Key
            code="KeyK"
            fn={() =>
              window.scrollBy({ left: 0, top: -200, behavior: 'smooth' })
            }
          >
            K
          </Key>
        </Grid>
      </Box>
      <Grid
        css={{
          gridTemplateColumns: 'auto',
          justifyContent: 'center',
          gap: '$7',

          bp2: {
            gridTemplateColumns: '45% 45%',
          },
        }}
      >
        {[
          {
            title: 'Keyboard first',
            description: 'Productivity++',
          },
          {
            title: 'Web based',
            description: 'Render all your fancy HTML in your terminal',
          },

          {
            title: 'Structured data piping',
            description: 'Termy converts std{in,out,err} to JSON',
          },
          {
            title: "VSCode's powerful editor",
            description: 'No more awkward interactions with vi/nano/pico',
          },
          {
            title: 'Command Line Apps (CLA)',
            description:
              'Create small applications to make your tools easier to use',
          },

          {
            title: 'Backward compatibility',
            description: 'All your existing shell commands work',
          },
        ].map(feature => (
          <Box key={feature.title}>
            <Text as="h4" size="6">
              {feature.title}
            </Text>
            <Text as="p" size="5" css={{ color: '$gray700' }}>
              {feature.description}
            </Text>
          </Box>
        ))}
      </Grid>
      <Footer />
      {/* todo: 0202 © Termy, Inc. */}
    </Layout>
  )
}

const Demo = styled.img({
  display: 'block',
  width: '95%',
  mx: 'auto',
  br: '$3',
  border: '1px solid $gray400',

  bp2: {
    width: '80%',
  },
})

const Arrow = styled(Text, {
  color: '$purple600',
  opacity: 0.6,
  mr: '-7px',
})

export default IndexPage
