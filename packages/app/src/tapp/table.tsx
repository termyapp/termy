import { Div, styled } from '@termy/ui'
import React from 'react'

interface Props {
  json: string
}

export default function Table({ json }: Props) {
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
                {typeof row[key] === 'boolean' ? (row[key] ? 'true' : 'false') : row[key]}
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

const Container = styled('table', {})
