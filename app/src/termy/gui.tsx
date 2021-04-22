import { Path, Table } from '@components'
import Edit from '@src/tapp/edit'
import type { Component } from '@types'
import React from 'react'
import ReactFromJSON from 'react-from-json'

const mapping = {
  markdown: ({ children }: any) => <p>{children}</p>,
  edit: (props: any) => <Edit {...props} />,
  path: ({ children }: any) => <Path>{children}</Path>,
  table: ({ json }: any) => <Table json={json} />,
}

// todo: type guard check & proper validation
export default function GUI(props: Component) {
  // console.error('Invalid data type:', data)
  // return <Div>Invalid data type</Div>

  return <ReactFromJSON entry={props} mapping={mapping} />
}
