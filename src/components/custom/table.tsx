import React from 'react'

interface Props {
  json: any[]
}

const Table = ({ json }: Props) => {
  return (
    <table className="table-auto">
      <thead>
        <tr>
          {Object.keys(json[0]).map((key, i) => (
            <th key={key + i} className="px-4 py-2">
              {key}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {json.map(row => (
          <tr>
            {Object.keys(row).map((key, i) => (
              <td key={key + i} className="border border-gray-600 px-4 py-2">
                {typeof row[key] === 'boolean'
                  ? row[key]
                    ? 'true'
                    : 'false'
                  : row[key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default Table
