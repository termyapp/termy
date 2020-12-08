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
          mt: '$24',
          textAlign: 'center',

          mobile: {
            mt: '$16',
          },
        }}
      >
        A terminal with autocomplete
      </Text>

      <Demo src="/demo.gif" />

      <Div
        css={{
          my: '$24',

          mobile: {
            display: 'none',
          },
        }}
      >
        <Text
          as="div"
          css={{
            color: '$gray700',
            fontSize: '$xl',
            textAlign: 'center',
          }}
        >
          Press{' '}
          <Key
            shortcut="d"
            href="https://github.com/termyapp/Termy/releases/download/v0.1.4/Termy-0.1.4.dmg"
            external
          >
            D
          </Key>{' '}
          to{' '}
          <Button
            as="a"
            href="https://github.com/termyapp/Termy/releases/download/v0.1.4/Termy-0.1.4.dmg"
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

      <Div
        as="article"
        css={{
          maxWidth: '600px',
          mx: 'auto',
          mt: '$24',
          lineHeight: '$relaxed',

          mobile: {
            mt: '$12',
          },

          h1: {
            fontSize: '$5xl',
            color: '$gray900',
            letterSpacing: '$tighter',
          },

          h3: {
            fontSize: '$3xl',
            color: '$gray800',
            letterSpacing: '$tight',
            lineHeight: '$tight',
          },

          img: {
            width: '50%',
            display: 'block',
            mx: 'auto',
          },
        }}
      >
        <h1>FAQ</h1>
        <div>
          <h3>
            <strong>What's new about this?</strong>
          </h3>
          <p>
            There have been many shells (bash, zsh, nushell, powershell, fish)
            and many terminal emulators (iTerm, Terminal, Hyper, Windows
            Terminal) created. But not one that tried to combine the two. Termy
            tries to be the answer to the question: what if we combine the shell
            and the terminal? What could come out of that?
          </p>
          <h3>
            <strong>The download link on your site didn't work!</strong>
          </h3>
          <p>Maybe it works now. Why don't you try it? 👀</p>
          <h3>
            <strong>Linux &amp; Windows. When?</strong>
          </h3>
          <p>Before Xmas.</p>
          <h3>
            <strong>I'm not a coder, how will this benefit me?</strong>
          </h3>
          <p>
            The learning curve for a terminal is too high for the average
            person. We are trying to lower this curve. For now, we are targeting
            web developers. But in the future we are going to bring the power of
            the command line to many more people, by making it more accessible.
          </p>
          <h3>
            <strong>The GIF is confusing!</strong>
          </h3>
          <p>We know, we're gonna do a walkthrough video.</p>
          <h3>
            <strong>You should do a walkthrough video!</strong>
          </h3>
          <p>...</p>
          <h3>
            <strong>What about performance?</strong>
          </h3>
          <p>
            Performance is not a priority at the moment. We can improve a lot on
            it and we'll do so before the <code>v1.0</code> release. We are
            rather working on the features that make Termy unique.
          </p>
          <p>
            Only our thin frontend layer depends on web technologies (Electron,
            JS). The shell part is in Rust - which is, let's just say{' '}
            <em>fast</em>. But the approach is what matters a lot of the times,
            not the language it's written in.
          </p>
          <h3>
            <strong>
              What about collaboration: shared environments and variables?
            </strong>
          </h3>
          <p>
            Collaboration is part of our answer to the "
            <em>How are you going to make money?"</em> question. But at first
            we're focusing on creating a terminal people love to use.
          </p>
          <h3>
            <strong>How does Termy compare to traditional terminals?</strong>
          </h3>
          <p>Pros &amp; Cons comparison table coming up!</p>
          <h3>
            <strong>Add a logo!</strong>
          </h3>
          <p>
            Why does everyone want a logo?! This is the most frequent request
            we've got. This fine?
          </p>
          <img src="/icon.png" />
        </div>
      </Div>
    </Layout>
  )
}

const Demo = styled.img({
  display: 'block',
  width: '70%',
  mx: 'auto',
  my: '$10',
  br: '$3',
  backgroundColor: '$backgroundColor',
  boxShadow: '$2xl',
  borderRadius: '$2xl',
  p: '-$2',

  mobile: {
    width: '100%',
  },
})

export default IndexPage
