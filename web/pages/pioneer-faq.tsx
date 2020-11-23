import React from 'react'
import { Div } from '../components/design-system'
import Layout from '../components/layout'

interface Props {}

const PioneerFaqPage: React.FC<Props> = props => {
  return (
    <Layout>
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
        <header>
          <h1>Pioneer FAQ</h1>
        </header>
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
            <strong>How are you going to make money?</strong>
          </h3>
          <p>
            Termy is 100% open source and will remain so in the future, for the
            individual. Later on we'll be offering extra paid features to teams.
          </p>
          <h3>
            <strong>The download link on your site didn't work!</strong>
          </h3>
          <p>Maybe it works now. Why don't you try it? 👀</p>
          <h3>
            <strong>Linux &amp; Windows. When?</strong>
          </h3>
          <p>Before Christmas.</p>
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
            <strong>Your landing page is confusing/too simple.</strong>
          </h3>
          <p>What should we add or change?</p>
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
            <strong>Why are you not focusing on growth?</strong>
          </h3>
          <p>
            One of the reasons why startups are so hard is because you have to
            focus on two things at the same time: product and growth. Right now
            we're just focusing on the product and will do so until we nail down
            the basic features of a terminal.
          </p>
          <h3>
            <strong>What help is a Github star towards your success?</strong>
          </h3>
          <p>
            We haven't set up analytics yet. This is the best quantified metric
            we've got for now.
          </p>
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

export default PioneerFaqPage
