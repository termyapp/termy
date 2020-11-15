import React from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import { useKey } from 'react-use'
import shallow from 'zustand/shallow'
import useStore from '../store'
import Cell from './cell'
import { Grid } from './shared'

// adjusts width on resize
const ResponsiveGridLayout = WidthProvider(Responsive)

if (import.meta.hot) {
  import.meta.hot.decline()
}

const Terminal: React.FC = () => {
  // Mapped picks, re-renders the component when state.treats changes in order, count or keys
  const cellComponents = useStore(
    state =>
      Object.keys(state.cells).map(id => (
        <div key={id}>
          <Cell id={id} />
        </div>
      )),
    shallow,
  )
  // const layouts = useStore(state => state.layouts)
  console.log(cellComponents)
  const dispatch = useStore(state => state.dispatch)

  useKey('j', e => e.metaKey && dispatch({ type: 'new' }))

  useKey('ArrowDown', () => dispatch({ type: 'focus-down' }))
  useKey('ArrowUp', () => dispatch({ type: 'focus-up' }))

  // styles:
  // https://github.com/STRML/react-resizable/blob/master/css/styles.css
  // https://github.com/STRML/react-grid-layout/blob/master/css/styles.css
  return (
    <Grid
      css={{
        p: '$1',
        rowGap: '$1',

        '& > .react-resizable-handle': {
          width: '0 !important',
          height: 10,
        },
      }}
    >
      <ResponsiveGridLayout
        className="layout"
        margin={[15, 25]}
        containerPadding={[0, 0]}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 6, md: 5, sm: 3, xs: 2, xxs: 1 }}
        maxRows={6}
        rowHeight={150}
        // https://github.com/STRML/react-grid-layout/issues/1063
        // // layouts={JSON.parse(JSON.stringify(layouts))}
        // onLayoutChange={(layout, layouts) => {
        //   console.log(layout, layouts)
        //   dispatch({ type: 'set-layouts', layouts })
        // }}
        // doesn't worked yet, but PR is
        // resizeHandle={
        //   <Div css={{ width: '$1', height: '$1', backgroundColor: 'red' }}>
        //     +
        //   </Div>
        // }
      >
        {cellComponents}
      </ResponsiveGridLayout>
    </Grid>
  )
}

export default Terminal
