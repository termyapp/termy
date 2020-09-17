import React from 'react'

interface Props {
  src: string
}

// Doom in a terminal: iframe https://playclassic.games/games/first-person-shooter-dos-games-online/play-doom-online/play/

const Iframe = ({ src }: Props) => {
  return (
    <iframe
      title="iFrame"
      src={src}
      style={{ height: ' 30rem', width: '100%', maxWidth: '50rem' }}
    />
  )
}

export default Iframe
