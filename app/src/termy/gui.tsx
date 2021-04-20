import { Path, Table } from '@components'
import Edit from '@src/tapp/edit'
import React from 'react'
import ReactFromJSON from 'react-from-json'

interface Props {
  type: 'edit' | 'path' | 'table'
  props: any
}

const mapping = {
  edit: (props: any) => <Edit {...props} />,
  path: ({ children }: any) => <Path>{children}</Path>,
  table: ({ json }: any) => <Table json={json} />,
}

// todo: type guard check & proper validation
export default function GUI(props: Props) {
  // console.error('Invalid data type:', data)
  // return <Div>Invalid data type</Div>

  return <ReactFromJSON entry={props} mapping={mapping} />
}
