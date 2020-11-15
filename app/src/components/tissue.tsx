// export type TissueType = string | string[]

// import React from 'react'
// import { styled } from '../stitches.config'
// import type { TissueType } from 'types'
// import Cell from './cell'
// import { Div } from './shared'

// // 'cause cells form tissues
// const Tissue: React.FC<{ tissueOrCell: string | TissueType[] }> = ({
//   tissueOrCell,
// }) => {
//   // only a single cell
//   if (typeof tissueOrCell === 'string')
//     return (
//       <Split>
//         <Cell id={tissueOrCell} />
//       </Split>
//     )

//   return (
//     <Tissues>
//       {tissueOrCell.map((_tissueOrCell, i) =>
//         typeof _tissueOrCell === 'string' ? (
//           <Split key={i} style={{}}>
//             {/* multiple cells */}
//             <Cell id={_tissueOrCell} />
//             {i < tissueOrCell.length && <Divider />}
//           </Split>
//         ) : (
//           <Tissue key={i} tissueOrCell={_tissueOrCell} />
//         ),
//       )}
//     </Tissues>
//   )
// }

// const Tissues = styled(Div, {
//   display: 'flex',
//   flexDirection: 'row',
//   flexWrap: 'nowrap',
//   width: '100%',
//   height: '100%',
//   flex: '1 1 0%',
// })

// const Split = styled(Div, {
//   //   width: '100%',
//   height: '50%',
//   //   flexBasis: '100%',
//   flex: 1,
//   margin: '$2',
// })

// const Divider = styled(Div, {
//   height: '100%',
//   width: '10px',
//   background: 'black',
// })

export default {}
