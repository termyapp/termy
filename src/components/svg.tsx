import React from 'react'
import { styled } from '../stitches.config'

const Svg = styled.svg({
  width: '$5',
  height: '$5',

  fill: 'currentColor',
  stroke: 'currentColor',
})

type SvgProps = React.ComponentProps<typeof Svg>

export const Folder: React.FC<SvgProps> = ({ css = {} }) => (
  <Svg
    css={{
      // @ts-ignore
      ...css,
      fill: 'none',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      path: {
        stroke: 'currentColor',
        strokeWidth: '32px',
      },
    }}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
  >
    <path d="M64,192V120a40,40,0,0,1,40-40h75.89a40,40,0,0,1,22.19,6.72l27.84,18.56A40,40,0,0,0,252.11,112H408a40,40,0,0,1,40,40v40" />
    <path d="M479.9,226.55,463.68,392a40,40,0,0,1-39.93,40H88.25a40,40,0,0,1-39.93-40L32.1,226.55A32,32,0,0,1,64,192h384.1A32,32,0,0,1,479.9,226.55Z" />
  </Svg>
)

export const File: React.FC<SvgProps> = ({ css = {} }) => (
  <Svg
    css={{
      // @ts-ignore
      ...css,
      fill: 'none',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      path: {
        stroke: 'currentColor',
        strokeWidth: '32px',
      },
    }}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
  >
    <path d="M416,221.25V416a48,48,0,0,1-48,48H144a48,48,0,0,1-48-48V96a48,48,0,0,1,48-48h98.75a32,32,0,0,1,22.62,9.37L406.63,198.63A32,32,0,0,1,416,221.25Z" />
    <path d="M256,56V176a32,32,0,0,0,32,32H408" />
  </Svg>
)
