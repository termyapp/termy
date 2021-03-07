import { styled } from '@src/stitches.config'
import React from 'react'
import { Div } from './div'

interface Props {
  json: string
}

export const Table = ({ json }: Props) => {
  json = JSON.parse(decodeURIComponent(escape(atob(json))))

  return Array.isArray(json) ? (
    <Container>
      <thead>
        <tr>
          {Object.keys(json[0]).map((key, i) => (
            <Div
              as="th"
              key={key + i}
              css={{
                px: '$20',
                py: '$2',
                fontWeight: '$bold',
              }}
            >
              {key}
            </Div>
          ))}
        </tr>
      </thead>
      <tbody>
        {json.map((row, i) => (
          <Div as="tr" key={i} css={{}}>
            {Object.keys(row).map((key, j) => (
              <Div
                as="td"
                key={j}
                css={{
                  borderTop: '1px solid $accent',
                  py: '$2',
                }}
              >
                {typeof row[key] === 'boolean'
                  ? row[key]
                    ? 'true'
                    : 'false'
                  : row[key]}
              </Div>
            ))}
          </Div>
        ))}
      </tbody>
    </Container>
  ) : (
    <Div>Can't render table. Children should be an array.</Div>
  )
}

const Container = styled.table({})
